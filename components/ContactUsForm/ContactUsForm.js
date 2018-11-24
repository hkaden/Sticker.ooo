import * as React from 'react';
import { connect } from 'react-redux';
import {Form, Input, Button, message, Row, Col, Modal} from 'antd';
import _ from 'lodash';
import redirect from '../../lib/redirect'
import Loader from '../Loader/Loader';
import cachios from 'cachios';
import './ContactUsForm.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class ContactUs extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isSubmitting: false,
        isLoading: true,
      };
    }

    componentDidMount() {
      this.setState({
        isLoading: false
      })
    }

    handleSubmit = (e) => {
      const {locales, lang} = this.props;
      e.preventDefault();
      this.props.form.validateFields(async (err, values) => {
        if (!err) {
          this.setState({
            isSubmitting: true,
          });
  
          try {
            let data = {
              email: values.email,
              subject: values.subject,
              message: values.message
            }
  
            const resp = await cachios.post('/api/contactUs', data);
  
            if (resp.status === 200) {
              Modal.info({
                title: locales[lang].contactUsModalTitle,
                content: (
                  <div>
                    <p>{locales[lang].confirmContactUsMessage}</p>
                  </div>
                ),
                onOk() {
                  redirect({}, e, '/')
                },
              });
            }
          } catch (e) {
  
            const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
            message.error(errorMsg);
            this.setState({
              isSubmitting: false,
              errorMsg,
            })
            this.props.form.setFieldsValue({
              email: '',
              subject: '',
              message: '',
            })
          }
        }
      });
    }

    render() {
      const {getFieldDecorator} = this.props.form;
      const {locales, lang} = this.props;
      
        if(this.state.isLoading){
          return (
            <Loader/>
          )
        }
        
        return (
          <div className="Wrapper">
          <Row type="flex" justify="center" align="middle" className="LoginFormWrapper">
            <Col md={6} lg={6} xs={12} sm={12} className="LoginFormWrapper">
              <Form onSubmit={this.handleSubmit} className="login-form" className="Form" autoComplete="off">
                          <span className="login100-form-title">
                {locales[lang].contactUs} 
            </span>
                <FormItem className="inputWrapper">
                  {getFieldDecorator('email', {
                    validateTrigger: 'onBlur',
                    rules: [{
                      type: 'email', message: locales[lang].emailValidationMessage,
                    },
                      {
                        required: true, message: locales[lang].pleaseInputEmail
                      }],
                  })(
                    <Input placeholder={locales[lang].email} className="Input"/>
                  )}
                </FormItem>
                <FormItem className="inputWrapper">
                  {getFieldDecorator('subject', {
                    rules: [{required: true, message: locales[lang].pleaseInputSubject}],
                  })(
                    <Input type="text" placeholder={locales[lang].subject} className="Input"/>
                  )}
                </FormItem>
                <FormItem className="inputWrapper">
                  {getFieldDecorator('message', {
                    rules: [{required: true, message: locales[lang].pleaseInputMessage}],
                  })(
                    <TextArea className="Input" placeholder={locales[lang].message} autosize={{ minRows: 4, maxRows: 15 }}/>
                  )}
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" className="login-form-button"
                          loading={this.state.isSubmitting}>
                    {locales[lang].submit} 
                  </Button>
                </FormItem>
              </Form>
            </Col>
          </Row>
        </div>
        );

    }
}

const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

const ContactUsForm = Form.create({})(ContactUs);
export default connect(mapStateToProps)(ContactUsForm)
