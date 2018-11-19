import * as React from 'react'
import {findDOMNode} from 'react-dom';
import {Button, Menu} from 'antd';
import TweenOne from 'rc-tween-one';
import { connect } from 'react-redux';
import cachios from 'cachios';
import redirect from '../../lib/redirect';
import './Nav.less';
import Locale from '../Locale/Locale';
import {
  setIsLoggedIn,
} from '../../lib/customReducers';

const Item = Menu.Item;

class Nav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      phoneOpen: false,
      menuHeight: 0,
      isLoading: true,
      isLoggedIn: false,
      isSubmitting: false
    };
    this.handleLogoutButtonClick = this.handleLogoutButtonClick.bind(this);
  }

  componentDidMount() {
    const { isLoggedIn } = this.props.auth;
    this.setState({
      isLoading: false,
      isLoggedIn
    })
  }

  renderLoginLogOutButton = () => {
    const { isLoggedIn } = this.state;
    const { locales, lang } = this.props;
    if(isLoggedIn) {
      return <Button type="primary" className="authBtn logoutBtn" size="large" onClick={this.handleLogoutButtonClick} loading={this.state.isSubmitting}>{locales[lang].logout}</Button>
    } 
    return <Button type="primary" className="authBtn loginBtn" size="large" onClick={this.handleLoginButtonClick} loading={this.state.isSubmitting}>{locales[lang].login}</Button>
  }


  phoneClick = () => {
    const menu = findDOMNode(this.menu);
    const phoneOpen = !this.state.phoneOpen;
    this.setState({
      phoneOpen,
      menuHeight: phoneOpen ? menu.scrollHeight : 0,
    });
  };

  handleButtonClick = () => {
    location.href = "/submit"
  }

  handleLogoClick = () => {
    location.href = "/"
  }

  handleLoginButtonClick = () => {
    location.href = "/login"
  }

  handleLogoutButtonClick() {
    try {
      this.setState({
        isSubmitting: true,
      }, async () => {
        const resp = await cachios.post('/api/logout');
        this.props.setIsLoggedIn(false);
        redirect({}, {}, '/')
      });
    } catch(e) {
      this.setState({
        isSubmitting: false,
      }, () => {
        const errorMsg = _.get(e, 'response.data.message', e.message || e.toString())
        redirect({}, errorMsg, '/')
      })
    }
  }

  render() {
    const {dispatch, ...props} = this.props;
    const {dataSource, isMobile, locales, lang} = props;
    delete props.dataSource;
    delete props.isMobile;
    const {menuHeight, phoneOpen} = this.state;
    const navData = dataSource.Menu.children;
    const navChildren = Object.keys(navData).map((key, i) => (
      <li key={i.toString()} {...navData[key]} className="item">
        <a
          {...navData[key].a}
          href={navData[key].a.href}
          target={navData[key].a.target}
          className="link"
        >
          {navData[key].a.children[lang]}
        </a>
      </li>
    ));

    if(this.state.isLoading) {
      return (null)
    }

    return (

      <TweenOne
        component="header"
        className="header0 home-page-wrapper"
        {...props}
      >
        <div
          className="home-page"
        >
          <TweenOne
            {...dataSource.logo}
          >
            <img className="site-logo" width="100%" src={dataSource.logo.children} alt="img" onClick={this.handleLogoClick}/>
          </TweenOne>
          <div className="buttonsList">
            <Locale/>
            <Button type="primary" className="haveSticker" size="large" onClick={this.handleButtonClick}>{locales[lang].createStickers}</Button>
            { this.renderLoginLogOutButton() }
          </div>
        </div>
      </TweenOne>
    );

  }
}

const mapStateToProps = reduxState => ({
  auth: reduxState.auth,
  locales: reduxState.locales.locales,
  lang: reduxState.locales.lang,
});

const mapDispatchToProps = dispatch => ({
  setIsLoggedIn: (isLoggerIn) => {
    dispatch(setIsLoggedIn(isLoggerIn));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
