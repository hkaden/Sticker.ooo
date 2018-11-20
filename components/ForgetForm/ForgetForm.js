import * as React from 'react'
import {Button, Col, Form, Input, message, Row} from "antd"
import redirect from "../../lib/redirect"
import cachios from "cachios"
import _ from "lodash"
import Loader from "../Loader/Loader"
import {connect} from 'react-redux';
import './ForgetForm.less';

const FormItem = Form.Item;

class Forget extends React.Component {
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
            email: values.email
          }

          const resp = await cachios.post('/api/forgetPassword', credential);

          if (resp.status === 200) {
            //this.props.setIsLoggedIn(true);
            //redirect({}, e, '/submit')
          }

        } catch (e) {

          const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
          message.error(errorMsg);
          this.setState({
            isSubmitting: false,
          });
          this.props.form.setFieldsValue({
            email: ''
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
              {locales[lang].forgetPasswordLinkLabel}
					</span>
              <FormItem className="inputWrapper">
                {getFieldDecorator('email', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    type: 'email', message: locales[lang].emailValidationMessage
                  },
                    {
                      required: true, message: locales[lang].pleaseInputEmail
                    }],
                })(
                  <Input placeholder="E-mail Address" className="Input"/>
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

const ForgetForm = Form.create({})(Forget);
const mapStateToProps = reduxState => ({
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

export default connect(mapStateToProps)(ForgetForm)
