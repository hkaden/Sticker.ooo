import * as React from 'react'
import cachios from 'cachios';
import {Form, Input, Button, message, Row, Col, Modal} from 'antd';
import _ from 'lodash';
import redirect from '../../lib/redirect'
import Loader from '../Loader/Loader';
import styles from "../RegisterForm/RegisterForm.less"

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
                  <p>Please confirm your email to fully access your website. Check your email inbox as well as spam
                    section for confirmation letter and click on link in it to confirm your account.</p>
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
    const { locales } = this.props;

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
						{locales.register}
					</span>
              <FormItem className="inputWrapper">
                {getFieldDecorator('username', {
                  validateTrigger: 'onBlur',
                  rules: [
                    {required: true, message: locales.pleaseInputUsername},
                    {min: 4, message: locales.usernameValidationMessage},
                    {max: 20, message: locales.usernameValidationMessage}
                  ],
                })(
                  <Input placeholder={locales.username} className="Input"/>
                )}
              </FormItem>
              <FormItem className="inputWrapper">
                {getFieldDecorator('email', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    type: 'email', message: locales.emailValidationMessage,
                  },
                    {
                      required: true, message: locales.pleaseInputEmail
                    }],
                })(
                  <Input placeholder={locales.email} className="Input"/>
                )}
              </FormItem>

              <FormItem className="inputWrapper">
                {getFieldDecorator('password', {
                  rules: [
                    {required: true, message: locales.pleaseInputPassword},
                    {min: 6, message: locales.passwordValidationMessage},
                  ],
                })(
                  <Input type="password"
                         placeholder={locales.password} className="Input"/>
                )}
              </FormItem>
              <FormItem className="inputWrapper">
                {getFieldDecorator('confirmPassword', {
                  rules: [
                    {required: true, message: locales.pleaseInputPassword},
                    {
                      validator: this.compareToFirstPassword,
                      message: locales.passwordNotMatch
                    }
                  ],
                })(
                  <Input type="password"
                         placeholder={locales.confirmPassword} className="Input" onBlur={this.handleConfirmBlur}/>
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        loading={this.state.isSubmitting}>
                  {locales.registerButton}
                </Button>
                {locales.or} <a href="/login">{locales.loginNowLabel}</a>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

const RegisterForm = Form.create({})(Register);
export default RegisterForm
