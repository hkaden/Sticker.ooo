import * as React from 'react'
import styles from "../LoginForm/LoginForm.less"
import {Form, Icon, Input, Button, Checkbox, Row, Col} from 'antd';

const FormItem = Form.Item;

class LoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  render() {
    return (
        <div className="Wrapper">
        <Row type="flex" justify="center" align="middle" className="LoginFormWrapper">
          <Col md={6} lg={6} xs={12} sm={12} className="LoginFormWrapper">
            <Form onSubmit={this.handleSubmit} className="login-form" className="Form">
              					<span className="login100-form-title">
						Login
					</span>
              <FormItem className="inputWrapper">
                <Input placeholder="Username" className="Input"/>
              </FormItem>
              <FormItem className="inputWrapper">
                <Input type="password"
                       placeholder="Password" className="Input"/>
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Log in
                </Button>
                Or <a href="">register now!</a>
              </FormItem>
            </Form>
          </Col>
        </Row>
        </div>
    );

  }
}

export default LoginForm
