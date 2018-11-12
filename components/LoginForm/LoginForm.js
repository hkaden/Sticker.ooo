import * as React from 'react'
import cachios from 'cachios';
import {Form, Icon, Input, Button, Checkbox, Row, Col} from 'antd';
import _ from 'lodash';
import redirect from '../../lib/redirect'
import styles from "../LoginForm/LoginForm.less"

const FormItem = Form.Item;

class Login extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState({
          isSubmitting: true,
        });

        try {
          let credential = {
            email: values.email,
            password: values.password
          }

          const resp = await cachios.post('/api/login', credential)
          
          if (resp.status === 200) {
            redirect({}, e, '/list/')
          } else {
            // TODO: 
          }


        } catch(e) {
          const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
          this.setState({
            isSubmitting: false,
            errorMsg,
          })
        }
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <div className="Wrapper">
        <Row type="flex" justify="center" align="middle" className="LoginFormWrapper">
          <Col md={6} lg={6} xs={12} sm={12} className="LoginFormWrapper">
            <Form onSubmit={this.handleSubmit} className="login-form" className="Form" autoComplete="off">
              					<span className="login100-form-title">
						Login
					</span>
              <FormItem className="inputWrapper">
              {getFieldDecorator('email', {
                    rules: [{
                      type: 'email', message: 'The input is not valid E-mail!',
                    },
                    {
                      required: true, message: 'Please input E-mail address!'
                    }],
                  })(
                <Input placeholder="E-mail Address" className="Input"/>
              )}
              </FormItem>
              <FormItem className="inputWrapper">
              {getFieldDecorator('password', {
                    rules: [{required: true, message: 'Please input password!'}],
                  })(
                <Input type="password"
                       placeholder="Password" className="Input"/>
              )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Log in
                </Button>
                Or <a href="/register">register now!</a>
              </FormItem>
            </Form>
          </Col>
        </Row>
        </div>
    );

  }
}

const LoginForm = Form.create({})(Login);
export default LoginForm
