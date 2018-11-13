import * as React from 'react'
import {Button, Card, Col, Form, Icon, Input, Progress, Radio, Row, Switch, Upload} from 'antd';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import reduxApi from '../../lib/reduxApi';
import cachios from 'cachios';
import redirect from '../../lib/redirect';
import WhatsAppStickersConverter from '../../lib/WhatsAppStickersConverter';
import styles from './ConverterForm.less';
import Loader from '../Loader/Loader';

const FormItem = Form.Item;

class CForm extends React.Component {
  converter = null;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      trayFile: null,
      stickersFiles: null,
      progress: 0,
      isSubmitting: false,
      uploadType: 'image',
      sharingType: 'public',
      errorMsg: '',
      isLoading: true
    };
  }

  componentDidMount() {
    this.converter = new WhatsAppStickersConverter();
    this.converter.init().catch(e => console.log(e));

    return this.setState({
      isLoading: false
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      progress: 0,
      errorMsg: '',
    })
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({
          progress: 0,
          isSubmitting: true,
        });

        try {
          let trayFile;
          let stickersFiles;
          if (values.uploadType === 'zip') {
            const unzipContent = await this.converter.unzip(values.zip[0].originFileObj);
            trayFile = unzipContent.trayFile;
            stickersFiles = unzipContent.stickersFiles;
          } else {
            trayFile = values.tray[0].originFileObj;
            stickersFiles = values.stickers.map(sticker => sticker.originFileObj);
          }

          const emitter = this.converter.convertImagesToPacks(trayFile, stickersFiles);
          let stickersLoaded = 0;
          emitter.on('stickerLoad', () => {
            stickersLoaded += 1;
            this.setState({progress: stickersLoaded / stickersFiles.length * 90});
          });

          const { tray, trays, stickersInPack } = await new Promise((resolve, reject) => {
            emitter.on('error', reject);
            emitter.on('load', resolve);
          });

          const stickersData = {
            name: this.props.form.getFieldValue('name'),
            publisher: this.props.form.getFieldValue('publisher'),
            sharingType: this.props.form.getFieldValue('sharingType'),
            tray,
            trays,
            stickers: stickersInPack,
          };


          const resp = await cachios.post('/api/stickers', stickersData)
          if (resp.status === 200) {
            this.setState({progress: 100});
            redirect({}, e, '/sticker/' + resp.data.uuid)
          }
        } catch (e) {
          const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
          this.setState({
            isSubmitting: false,
            errorMsg,
          })
        }
      }
    });
  };

  handleFieldChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  };

  beforeUpload = () => {
    return false;
  };

  normFile = (e, type) => {
    return e && e.fileList;
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'}/>
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    if(this.state.isLoading) {
      return (
        <Loader/>
      )
    }

    return (
        <div className="ConverterWrapper">
          <Row type="flex" justify="start" align="middle" >
          <Col span={24}>
            <Card title="Submit your Stickers" bordered={true} className="ConverterCard">
              <Form onSubmit={this.handleSubmit} hideRequiredMark={true} className="login-form" autoComplete="off">
                <FormItem>
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: 'Please input pack name!'}],
                  })(
                    <Input prefix={<Icon type="file" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Pack Name"
                           disabled={this.state.isSubmitting}/>
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('publisher', {
                    rules: [{required: true, message: 'Please input publisher!'}],
                  })(
                    <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Publisher"
                           disabled={this.state.isSubmitting}/>
                  )}
                </FormItem>
                <FormItem
                  label="Sharing"
                  extra={{
                    public: 'Your stickers will be publicly available',
                    link: 'Your stickers can only be accessible by link'
                  }[this.state.sharingType]}
                >
                  {getFieldDecorator('sharingType', {
                    initialValue: 'public'
                  })(
                    <Radio.Group name="sharingType" onChange={this.handleFieldChange}
                                 disabled={this.state.isSubmitting}>
                      <Radio.Button value="public">Public</Radio.Button>
                      <Radio.Button value="link">Link only</Radio.Button>
                    </Radio.Group>
                  )}
                </FormItem>
                <FormItem
                  label="Upload Type"
                >
                  {getFieldDecorator('uploadType', {
                    initialValue: 'image'
                  })(
                    <Radio.Group name="uploadType" onChange={this.handleFieldChange} disabled={this.state.isSubmitting}>
                      <Radio.Button value="image">Image Files</Radio.Button>
                      <Radio.Button value="zip">Zip File</Radio.Button>
                    </Radio.Group>,
                  )}
                </FormItem>
                {this.state.uploadType === 'image' ? (<div>
                  <FormItem
                    label="Tray Icon"
                  >
                    <div className="dropbox">
                      {getFieldDecorator('tray', {
                        getValueFromEvent: this.normFile,
                        rules: [
                          {required: true, message: 'Please select tray icon!'},
                          {
                            validator: (rule, value, callback) => {
                              callback(value && value.length > 1 ? false : undefined);
                            }, message: 'Please select only 1 tray icon!'
                          }
                        ],

                      })(
                        <Upload.Dragger accept="image/png,image/jpeg" name="tray" multiple={false}
                                        beforeUpload={this.beforeUpload} disabled={this.state.isSubmitting}>
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox"/>
                          </p>
                          <p className="ant-upload-text">Choose file or drag file to this area</p>
                          <p className="ant-upload-hint">Any resolution</p>
                        </Upload.Dragger>
                      )}
                    </div>
                  </FormItem>
                  <FormItem
                    label="Stickers (3 or more images)"
                  >
                    <div className="dropbox">
                      {getFieldDecorator('stickers', {
                        getValueFromEvent: this.normFile,
                        rules: [
                          {
                            validator: (rule, value, callback) => {
                              callback(value && value.length >= 3 ? undefined : false);
                            }, message: 'Please select 3 or more images!'
                          }
                        ],
                      })(
                        <Upload.Dragger accept="image/png,image/jpeg" name="files" multiple={true}
                                        beforeUpload={this.beforeUpload} disabled={this.state.isSubmitting}>
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox"/>
                          </p>
                          <p className="ant-upload-text">Choose files or drag files to this area</p>
                          <p className="ant-upload-hint">Any resolution</p>
                        </Upload.Dragger>
                      )}
                    </div>
                  </FormItem>
                </div>) : (
                  <FormItem
                    label="Zip File"
                  >
                    <div className="dropbox">
                      {getFieldDecorator('zip', {
                        getValueFromEvent: this.normFile,
                        rules: [{required: true, message: 'Please select zip file!'}],
                      })(
                        <Upload.Dragger accept=".zip" name="files" multiple={true} beforeUpload={this.beforeUpload}
                                        disabled={this.state.isSubmitting}>
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox"/>
                          </p>
                          <p className="ant-upload-text">Choose file or drag file to this area</p>
                          <p className="ant-upload-hint">Zip file with images of any resolution</p>
                        </Upload.Dragger>
                      )}
                    </div>
                  </FormItem>
                )}
                <FormItem>
                  <div>

                    <span className="ant-form-text">
                  By submitting my stickers to Stickers.ooo, I agree to the Terms & Conditions of Sticker.ooo
                </span>
                    {getFieldDecorator('agreeTnC', {
                      rules: [{
                        validator: (rule, value, callback) => callback(value === true ? undefined : false),
                        message: 'Please agree to the Terms & Conditions',
                      }],
                    })(
                      <Switch checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="close"/>}/>
                    )}
                  </div>
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                    Upload
                  </Button>
                </FormItem>
                <Progress percent={this.state.progress} hidden={!this.state.isSubmitting} showInfo={false}/>
                <p style={{color: '#ff4d4f'}}>{this.state.errorMsg}</p>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

const ConverterForm = Form.create({})(CForm);
const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), reduxState);
const mapStateToProps = (reduxState) => ({sticker: reduxState.sticker}); // Use reduxApi endpoint names here

export default ConverterForm
