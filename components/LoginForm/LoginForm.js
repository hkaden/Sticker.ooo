import * as React from 'react'
import cachios from 'cachios';
import {Form, Input, Button, message, Row, Col, Modal} from 'antd';
import _ from 'lodash';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import {connect} from "react-redux";
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import redirect from '../../lib/redirect';
import styles from './LoginForm.less';
import Loader from '../Loader/Loader';
import {
  setIsLoggedIn,
} from '../../lib/customReducers';

const FormItem = Form.Item;

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isLoading: true
    };
  }


  componentDidMount() {
    const { locales, lang } = this.props;
    this.setState({
      isLoading: false
    });
    if (this.props.query) {
      const { success, type } = this.props.query;
      if (success && type) {
        const msg = MESSAGES[type];
        if (msg) {
          if (success === 'true') {
            Modal.success({
              title: msg,
              content: (
                <div>
                  <p>{locales[lang].loginSuccessMessage}</p>
                </div>
              ),
              onOk() {
                redirect({}, {}, '/login');
              },
            })
          } else {
            Modal.error({
              title: msg,
              content: (
                <div>
                  <p>{locales[lang].pleaseContactAdmin}</p>
                </div>
              ),
              onOk() {
                redirect({}, {}, '/login');
              },
            })
          }
        }
      }
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
            email: values.email,
            password: values.password
          }

          const resp = await cachios.post('/api/login', credential);

          if (resp.status === 200) {
            this.props.setIsLoggedIn(true);
            redirect({}, e, '/submit')
          }

        } catch (e) {

          const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
          message.error(errorMsg);
          this.setState({
            isSubmitting: false,
          });
          this.props.form.setFieldsValue({
            email: '',
            password: '',
          });
        }
      }
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {locales, lang} = this.props;
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
              {locales[lang].login} 
					</span>
              <FormItem className="inputWrapper">
                {getFieldDecorator('email', {
                  validateTrigger: 'onBlur',
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
                <Button type="primary" htmlType="submit" className="login-form-button"
                        loading={this.state.isSubmitting}>
                  {locales[lang].login} 
                </Button>
                {locales[lang].or} <a href="/register">{locales[lang].registerLinkLabel}</a><br/>
                {locales[lang].or}  <a href="/forget">{locales[lang].forgetPasswordLinkLabel}</a>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = reduxState => ({
  stickersList: reduxState.stickersList,
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});


const mapDispatchToProps = dispatch => ({
  setIsLoggedIn: (isLoggerIn) => {
    dispatch(setIsLoggedIn(isLoggerIn));
  },
});

const LoginForm = Form.create({})(Login);

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
