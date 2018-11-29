import * as React from 'react'
import {findDOMNode} from 'react-dom';
import {Button, Icon, Drawer, Menu} from 'antd';
import TweenOne from 'rc-tween-one';
import { connect } from 'react-redux';
import cachios from 'cachios';
import Sidebar from "react-sidebar";
import redirect from '../../lib/redirect';
import './Nav.less';
import Locale from '../Locale/Locale';
import {
  setIsLoggedIn,
} from '../../lib/customReducers';
import {Nav00DataSource} from "../data.source"

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Nav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      phoneOpen: false,
      menuHeight: 0,
      isLoading: true,
      isLoggedIn: false,
      isSubmitting: false,
      MobileNavvisible: false,
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
      return <a href="">
        <li className="item seperator" onClick={this.handleLogoutButtonClick}>{locales[lang].logout}</li>
      </a>
    }
    return <li className="item seperator" onClick={this.handleLoginButtonClick}>{locales[lang].login}</li>
  }

  renderMobileLoginLogOutButton = () => {
    const {isLoggedIn} = this.state;
    const {locales, lang} = this.props;
    if (isLoggedIn) {
      return <Menu.Item className="item">
        <a
          onClick={this.handleLogoutButtonClick}
          className="link"
        >
          {locales[lang].logout}
        </a>
      </Menu.Item>
    }
    return <Menu.Item className="item">
      <a
        onClick={this.handleLoginButtonClick}
        className="link"
      >
        {locales[lang].login}
      </a>
    </Menu.Item>
  }



  phoneClick = () => {
    const menu = findDOMNode(this.menu);
    const phoneOpen = !this.state.phoneOpen;
    this.setState({
      phoneOpen,
      menuHeight: phoneOpen ? menu.scrollHeight : 0,
    });
  };

  onClose = () => {
    this.setState({
      MobileNavvisible: false,
    });
  }

  onOpen = () => {
    this.setState({
      MobileNavvisible: true,
    });
  }
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
    const mobileNavChildren = Object.keys(navData).map((key, i) => (
      <Menu.Item key={i.toString()} {...navData[key]} className="item">
        <a
          {...navData[key].a}
          href={navData[key].a.href}
          target={navData[key].a.target}
          className="link"
        >
          {navData[key].a.children[lang]}
        </a>
      </Menu.Item>
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
            <div className="MobileNav">
              <Icon type="ellipsis" style={{fontSize: '30px'}} className="openMobileNav" onClick={this.onOpen}/>
            </div>
          </TweenOne>
          <div className="link">
            <ul className="nav">
              {navChildren}
            </ul>
            <ul className="rightNav">
              <Locale/>
              {this.renderLoginLogOutButton()}
            </ul>
          </div>
          <div className="buttonsList">
            <Button type="primary" className="haveSticker" size="large" onClick={this.handleButtonClick}>{locales[lang].createStickers}</Button>
          </div>
          <Drawer
            placement="right"
            closable={false}
            onClose={this.onClose}
            visible={this.state.MobileNavvisible}
          >
            <Menu mode="inline">
              {mobileNavChildren}
              <Menu.Divider/>
              <Menu.Item>
                <li className="item seperator" onClick={this.handleButtonClick}>{locales[lang].createStickers}</li>
              </Menu.Item>
              {this.renderMobileLoginLogOutButton()}
              <Locale/>
            </Menu>
          </Drawer>
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
