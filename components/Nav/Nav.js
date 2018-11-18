import * as React from 'react'
import {findDOMNode} from 'react-dom';
import {Button, Menu} from 'antd';
import TweenOne from 'rc-tween-one';
import { connect } from 'react-redux';
import styles from './Nav.less';
import Locale from '../Locale/Locale';

const Item = Menu.Item;

class Nav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      phoneOpen: false,
      menuHeight: 0,
      isLoading: true,
      isLoggedIn: false
    };
  }

  componentDidMount() {
    const { isLoggedIn } = this.props.auth;
    this.setState({
      isLoading: false,
      isLoggedIn
    })
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

    handleLogoutButtonClick = () => {
      //TODO:
    }

    renderLoginLogOutButton = () => {
      const { isLoggedIn } = this.state;
      const { locales } = this.props;
      console.log(this.state)
      if(isLoggedIn) {
        return <Button type="primary" className="authBtn logoutBtn" size="large" onClick={this.handleLogoutButtonClick}>{locales.logout}</Button>
      } 

      return <Button type="primary" className="authBtn loginBtn" size="large" onClick={this.handleLoginButtonClick}>{locales.login}</Button>
    }

    render() {
      const {dispatch, ...props} = this.props;
      const {dataSource, isMobile, locales} = props;
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
            {navData[key].a.children}
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
              <Button type="primary" className="haveSticker" size="large" onClick={this.handleButtonClick}>{locales.createStickers}</Button>
              { this.renderLoginLogOutButton() }
            </div>
          </div>
        </TweenOne>
      );

    }
}

const mapStateToProps = reduxState => ({
  auth: reduxState.auth,
});

export default connect(mapStateToProps)(Nav);
