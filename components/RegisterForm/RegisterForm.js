import * as React from 'react'
import cachios from 'cachios';
import {Form, Input, Button, message, Row, Col, Modal} from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import redirect from '../../lib/redirect'
import Loader from '../Loader/Loader';
import "./RegisterForm.less"

const FormItem = Form.Item;

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isLoading: true
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: false
    })
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({confirmDirty: this.state.confirmDirty || !!value});
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(true);
    } else {
      callback();
    }
  }

  handleSubmit = (e) => {
    const {locales, lang} = this.props;
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        //console.log('Received values of form: ', values);
        this.setState({
          isSubmitting: true,
        });

        try {
          let credential = {
            username: values.username,
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword
          }

          const resp = await cachios.post('/api/register', credential);

          if (resp.status === 200) {
            Modal.info({
              title: 'One more step',
              content: (
                <div>
                  <p>{locales[lang].confirmEmailMessage}</p>
                </div>
              ),
              onOk() {
                redirect({}, e, '/login')
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
            password: '',
            username: '',
            confirmPassword: ''
          })
        }
      }
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const { locales, lang } = this.props;

    if(this.state.isLoading) {
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
                {locales[lang].register}
              </span>
              <FormItem className="inputWrapper">
                {getFieldDecorator('username', {
                  validateTrigger: 'onBlur',
                  rules: [
                    {required: true, message: locales[lang].pleaseInputUsername},
                    {min: 4, message: locales[lang].usernameValidationMessage},
                    {max: 20, message: locales[lang].usernameValidationMessage}
                  ],
                })(
                  <Input placeholder={locales[lang].username} className="Input"/>
                )}
              </FormItem>
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
                {getFieldDecorator('password', {
                  rules: [
                    {required: true, message: locales[lang].pleaseInputPassword},
                    {min: 6, message: locales[lang].passwordValidationMessage},
                  ],
                })(
                  <Input type="password"
                         placeholder={locales[lang].password} className="Input"/>
                )}
              </FormItem>
              <FormItem className="inputWrapper">
                {getFieldDecorator('confirmPassword', {
                  rules: [
                    {required: true, message: locales[lang].pleaseInputPassword},
                    {
                      validator: this.compareToFirstPassword,
                      message: locales[lang].passwordNotMatch
                    }
                  ],
                })(
                  <Input type="password"
                         placeholder={locales[lang].confirmPassword} className="Input" onBlur={this.handleConfirmBlur}/>
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        loading={this.state.isSubmitting}>
                  {locales[lang].registerButton}
                </Button>
                {locales[lang].or} <a href="/login">{locales[lang].loginNowLabel}</a>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

const RegisterForm = Form.create({})(Register);
const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(RegisterForm)
