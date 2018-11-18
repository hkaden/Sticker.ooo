import * as React from 'react'
import {Button, Card, Col, Form, Icon, Input, InputNumber, Progress, Radio, Row, Switch, Upload} from 'antd';
import cachios from 'cachios';
import redirect from '../../lib/redirect';
import WhatsAppStickersConverter from '../../lib/WhatsAppStickersConverter';
import styles from './ConverterForm.less';
import Loader from '../Loader/Loader';
import { connect } from 'react-redux';
import Link from 'next/link';

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
    this.converter.init().catch(() => {
      Modal.error({
        title: 'Critical API not loaded!',
        content: (
          <div>
            <p>Please try refreshing the page, and ensure that you are using the latest version of Chrome / Firefox / Safari</p>
          </div>
        ),
        okText: 'Refresh',
        maskClosable: true,
        onOk() {
          location.reload();
        },
      });
    });

    this.setState({
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

            const packSize = this.props.form.getFieldValue('packSize');

            const emitter = this.converter.convertImagesToPacks(trayFile, stickersFiles, packSize);
            let stickersLoaded = 0;
            emitter.on('stickerLoad', () => {
              stickersLoaded += 1;
              this.setState({ progress: stickersLoaded / stickersFiles.length * 90 });
            });

          const { tray, trays, stickersInPack } = await new Promise((resolve, reject) => {
            emitter.on('error', reject);
            emitter.on('load', resolve);
          });

          const stickersData = {
            name: this.props.form.getFieldValue('name'),
            sharingType: this.props.form.getFieldValue('sharingType'),
            tray,
            trays,
            stickers: stickersInPack,
          };


          const resp = await cachios.post('/api/stickers', stickersData);
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
    const { locales, lang } = this.props;
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
            <Card title={locales[lang].submitStickersLabel} bordered={true} className="ConverterCard">
              <Form onSubmit={this.handleSubmit} hideRequiredMark={true} className="login-form" autoComplete="off">
                <FormItem>
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: locales[lang].pleaseInputPackName}],
                  })(
                    <Input prefix={<Icon type="file" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Pack Name"
                           disabled={this.state.isSubmitting}/>
                  )}
                </FormItem>
                <FormItem
                  label="Sharing"
                  extra={{
                    public: 'Your stickers will be publicly available when Sticker.ooo is out of beta',
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
                  label={locales[lang].maxNumOfStickersPerPack}
                >
                  {getFieldDecorator('packSize', {
                    initialValue: 30,
                  })(
                    <InputNumber
                      disabled={this.state.isSubmitting}
                      min={5}
                      max={30}
                    />,
                  )}
                </FormItem>
                <FormItem
                  label="Upload Type"
                >
                  {getFieldDecorator('uploadType', {
                    initialValue: 'image'
                  })(
                    <Radio.Group name="uploadType" onChange={this.handleFieldChange} disabled={this.state.isSubmitting}>
                      <Radio.Button value="image">{locales[lang].imageFiles}</Radio.Button>
                      <Radio.Button value="zip">{locales[lang].zipFiles}</Radio.Button>
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
                          {required: true, message: locales[lang].pleaseSelectTrayIcon},
                          {
                            validator: (rule, value, callback) => {
                              callback(value && value.length > 1 ? false : undefined);
                            }, message: locales[lang].pleaseSelectOnlyOneTrayIcon
                          }
                        ],

                      })(
                        <Upload.Dragger accept="image/png,image/jpeg" name="tray" multiple={false}
                                        beforeUpload={this.beforeUpload} disabled={this.state.isSubmitting}>
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox"/>
                          </p>
                          <p className="ant-upload-text">{locales[lang].dragAndDropLabel}</p>
                          <p className="ant-upload-hint">{locales[lang].anyResolution}</p>
                        </Upload.Dragger>
                      )}
                    </div>
                  </FormItem>
                  <FormItem
                    label={locales[lang].threeOrMoreImages}
                  >
                    <div className="dropbox">
                      {getFieldDecorator('stickers', {
                        getValueFromEvent: this.normFile,
                        rules: [
                          {
                            validator: (rule, value, callback) => {
                              callback(value && value.length >= 3 ? undefined : false);
                            }, message: locales[lang].pleaseSelectThreeOrMoreImages
                          }
                        ],
                      })(
                        <Upload.Dragger accept="image/png,image/jpeg" name="files" multiple={true}
                                        beforeUpload={this.beforeUpload} disabled={this.state.isSubmitting}>
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox"/>
                          </p>
                          <p className="ant-upload-text">{locales[lang].dragAndDropLabel}</p>
                          <p className="ant-upload-hint">{locales[lang].anyResolution}</p>
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
                        rules: [
                          {required: true, message: locales[lang].pleaseSelectZipFile},
                          {
                            validator: (rule, value, callback) => {
                              callback(value && value.length > 1 ? false : undefined);
                            }, message: locales[lang].pleaseSelectOnlyOneZipFile
                          }
                        ],
                      })(
                        <Upload.Dragger accept=".zip" name="files" beforeUpload={this.beforeUpload}
                                        disabled={this.state.isSubmitting}>
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox"/>
                          </p>
                          <p className="ant-upload-text">{locales[lang].dragAndDropLabel}</p>
                          <p className="ant-upload-hint">{locales[lang].zipWithAnyResolution}</p>
                        </Upload.Dragger>
                      )}
                    </div>
                  </FormItem>
                )}
                <FormItem>
                  <div>

                    <span className="ant-form-text">
                      {locales[lang].submitAgreementPrefix} <Link href="/tnc">{locales[lang].termsAndConditions}</Link> {locales[lang].submitAgreementSuffix}
                </span>
                    {getFieldDecorator('agreeTnC', {
                      rules: [{
                        validator: (rule, value, callback) => callback(value === true ? undefined : false),
                        message: locales[lang].pleaseAgreeTnc,
                      }],
                    })(
                      <Switch checkedChildren={<Icon type="check"/>} unCheckedChildren={<Icon type="close"/>}/>
                    )}
                  </div>
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" style={{width: '100%'}} loading={this.state.isSubmitting}>
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


const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(ConverterForm);
