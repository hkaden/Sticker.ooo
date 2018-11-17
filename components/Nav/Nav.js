import * as React from 'react'
import {findDOMNode} from 'react-dom';
import {Button, Menu} from 'antd';
import TweenOne from 'rc-tween-one';
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
    };
  }

  componentDidMount() {
    this.setState({
      isLoading: false
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

    render() {
      const {...props} = this.props;
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
            </div>
          </div>
        </TweenOne>
      );

    }
}

export default Nav
