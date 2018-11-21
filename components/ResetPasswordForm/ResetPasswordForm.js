import * as React from 'react'
import {Button, Col, Form, Input, message, Row} from "antd"
import redirect from "../../lib/redirect"
import cachios from "cachios"
import _ from "lodash"
import Loader from "../Loader/Loader"
import {connect} from 'react-redux';
import './ResetPasswordForm.less';

const FormItem = Form.Item;

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isLoading: true
    };
  }


  componentDidMount() {
    const {locales, lang} = this.props;
    this.setState({
      isLoading: false
    });
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
            token: this.props.query.token,
            password: values.password,
            confirmPassword: values.confirmPassword
          }

          const resp = await cachios.post('/api/resetPassword', credential);

          if (resp.status === 200) {
            message.success(locales[lang].resetPasswordSuccessMessage);
            this.setState({isSubmitting: false});
            this.props.form.setFieldsValue({
              password: '',
              confirmPassword: ''
            });
            redirect({}, {}, '/login');
          }

        } catch (e) {

          const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
          message.error(errorMsg);
          this.setState({
            isSubmitting: false,
          });
          this.props.form.setFieldsValue({
            password: '',
            confirmPassword: ''
          });
        }
      }
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {locales, lang} = this.props;
    if (this.state.isLoading) {
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
              {locales[lang].resetPassword}
					</span>
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
                  {locales[lang].resetPassword}
                </Button>

              </FormItem>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

const ResetPasswordForm = Form.create({})(ResetPassword);
const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(ResetPasswordForm)
