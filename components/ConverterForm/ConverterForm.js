import * as React from 'react'
import {
    Form, Button, Upload, Icon,
    Input, Progress
} from 'antd';
import {WrappedFormUtils} from 'antd/lib/form/Form';
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../../lib/reduxApi';
import cachios from 'cachios';
import redirect from '../../lib/redirect'
import WhatsAppStickersConverter from '../../lib/WhatsAppStickersConverter'
const FormItem = Form.Item;



class CForm extends React.Component {
    converter = null;

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

    componentDidMount() {
        this.converter = new WhatsAppStickersConverter();
        this.converter.init().catch(e => console.log(e));
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
                console.log(values);
                const trayFile = values.Tray[0].originFileObj;
                const stickersFiles = values.Stickers.map(sticker => sticker.originFileObj);

                const emitter = this.converter.convertImagesToPacks(trayFile, stickersFiles);
                let stickersLoaded = 0;
                emitter.on('stickerLoad', () => {
                    stickersLoaded += 1;
                    this.setState({ progress: stickersLoaded / stickersFiles.length * 90 });
                });

                const { trays, stickersInPack } = await new Promise((resolve, reject) => {
                    emitter.on('error', reject);
                    emitter.on('load', resolve);
                });

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
