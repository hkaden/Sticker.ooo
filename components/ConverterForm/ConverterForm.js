import * as React from 'react'
import {
    Form, Button, Upload, Icon,
    Input, Progress
} from 'antd';
import jimp from 'jimp'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../../lib/reduxApi';
import cachios from 'cachios';
import redirect from '../../lib/redirect'
const FormItem = Form.Item;



class CForm extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            loading: false,
            trayFile: null,
            stickersFiles: null,
            progress: 0,
            isSubmitting: false,
        };
    }


    convertURIToWebpURI = (URI, quality) => {
        return new Promise(function (resolve, reject) {
            if (URI == null) return reject();
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                image = new Image();
            image.addEventListener('load', function () {
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/webp", quality));
            }, false);
            image.src = URI;
        });
    }

    loadFile = async (file, type) => {
        return new Promise((resolve, reject) => {
                let reader = new FileReader();

                reader.onloadend = async () => {
                    try {
                        if (type === 'tray') {
                            resolve(await this.resizeAndConvert(reader.result, 96, false));
                        } else if (type === 'stickers') {
                            resolve(await this.resizeAndConvert(reader.result, 512, true));
                        }
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        )
    }

    resizeAndConvert = async (input, px, toWebp) => {
        return jimp.read(input).then(image => {
            if (toWebp) {
                return image.contain(px, px).getBase64Async(jimp.MIME_PNG)
                    .then(uri => this.convertURIToWebpURI(uri, 1).then(async (_webpUri) => {
                        let webpUri = _webpUri;

                        let quality = 1.0;
                        while (btoa(webpUri).length > 99999 && quality > 0.2) {
                            quality -= 0.08;
                            console.error(`WebP size ${Math.ceil(btoa(webpUri).length / 1024)}kb exceeded 100kb, resizing with quality ${quality}`);
                            webpUri = await this.convertURIToWebpURI(uri, quality);
                        }
                        return webpUri;
                    }))
            }
            return image.contain(px, px).getBase64Async(jimp.MIME_PNG);
        })
    }

    addTextToUri = ( URI, text ) => {
        return new Promise(function(resolve, reject) {
            if (URI == null) return reject();
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                image = new Image();
            image.addEventListener('load', function() {
                canvas.width = image.width;
                canvas.height = image.height;

                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                context.save();

                context.beginPath();
                context.arc(canvas.width - 0 - 16, canvas.height - 0 - 16, 16, 0, 2 * Math.PI);
                // context.fillStyle = 'rgba(63,127,191,0.6)';
                context.fillStyle = 'rgba(53, 67, 90, 0.85)';
                context.fill();

                context.restore();

                context.font = '30px helvetica';
                context.textAlign = 'center';
                // context.fillStyle = '#262626';
                context.fillStyle = '#f7f7f7';
                context.lineWidth = 2;
                context.fillText(text, canvas.width - 0 - 16, canvas.height - 0 - 6);
                resolve(canvas.toDataURL("image/png"));
            }, false);
            image.src = URI;
        });
    }

    handleSubmit = (e) => {
        this.setState({
            progress: 0,
            errorMsg: '',
            isSubmitting: true,
            disabledTrayUpload: false,
        });
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log(values)
                const tray = await this.loadFile(values.Tray[0].originFileObj, 'tray');
                const stickersInPack = [];
                const numOfPacks = Math.ceil(values.Stickers.length / 30);
                const trays = [];

                for (let pack = 0; pack < numOfPacks; pack++) {
                    stickersInPack.push([]);
                    trays.push(numOfPacks === 1 ? tray : await this.addTextToUri(tray, (pack + 1) + ''));
                }
                for (let i = 0; i < values.Stickers.length; i++) {
                    const sticker = await this.loadFile(values.Stickers[i].originFileObj, 'stickers');
                    this.setState({ progress: (i + 1) / values.Stickers.length * 90 });
                    stickersInPack[Math.floor(i / 30)].push(sticker);
                }
                if (numOfPacks > 1 && stickersInPack[numOfPacks - 1].length < 3) {
                    stickersInPack[numOfPacks - 1] = [
                        ...stickersInPack[numOfPacks - 2].splice(-(3 - stickersInPack[numOfPacks - 1].length)),
                        ...stickersInPack[numOfPacks - 1],
                    ];
                }
                const formatter = url => url.replace('data:image/png;base64,', '')
                const stickersData  = {
                    name: this.props.form.getFieldValue('Packname'),
                    publisher: this.props.form.getFieldValue('Publisher'),
                    tray: trays,
                    stickers: stickersInPack
                }


                console.log('post data:', stickersData)
                cachios.post('/api/submitsticker', stickersData).then((resp) => {
                    console.log(resp.data.uuid)
                    if ( resp.status == 200 ){
                        this.setState({progress: 100, isSubmitting: false})
                        redirect({}, e, '/sticker/' + resp.data.uuid)
                    }
                });
            }
        });

    }

    trayToBase64 = () =>{
        return false;
    }

    normFile = (e, type) => {
        console.log('Upload event:', e.fileList);
        return e && e.fileList;
    }



    render() {
        const {getFieldDecorator} = this.props.form;
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        return (

            <Form onSubmit={this.handleSubmit} className="login-form">
                <FormItem>
                    {getFieldDecorator('Packname', {
                        rules: [{required: true, message: 'Please input pack name!'}],
                    })(
                        <Input prefix={<Icon type="file" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Pack Name"/>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('Publisher', {
                        rules: [{required: true, message: 'Please input publisher!'}],
                    })(
                        <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Publisher"/>
                    )}
                </FormItem>
                <FormItem
                    label="Tray Icon"
                >
                    <div className="dropbox">
                        {getFieldDecorator('Tray', {
                            valuePropName: 'tray',
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload.Dragger accept="image/png" name="tray" multiple={false} beforeUpload={this.trayToBase64} disabled={this.state.disabledTrayUpload}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox"/>
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                            </Upload.Dragger>
                        )}
                    </div>
                </FormItem>
                <FormItem
                    label="Stickers (3 or more images)"
                >
                    <div className="dropbox">
                        {getFieldDecorator('Stickers', {
                            valuePropName: 'stickersList',
                            getValueFromEvent: this.normFile,
                        })(
                            <Upload.Dragger accept="image/png" name="files" multiple={true} beforeUpload={this.trayToBase64}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox"/>
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                            </Upload.Dragger>
                        )}
                    </div>
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" className="login-form-button" style={{width: '100%'}}>
                        Upload
                    </Button>
                </FormItem>
                <Progress percent={this.state.progress} hidden={!this.state.isSubmitting} showInfo={false} />
            </Form>
        );
    }
}

const ConverterForm = Form.create({})(CForm);
const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), reduxState);
const mapStateToProps = (reduxState) => ({ sticker: reduxState.sticker }); // Use reduxApi endpoint names here


export default ConverterForm
