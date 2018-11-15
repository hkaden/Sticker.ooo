import * as React from 'react'
import {findDOMNode} from 'react-dom';
import {Button, Menu} from 'antd';
import TweenOne from 'rc-tween-one';
import styles from './Nav.less';

const Item = Menu.Item;

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneOpen: false,
      menuHeight: 0,
    };
  }

    phoneClick = () => {
      const menu = findDOMNode(this.menu);
      const phoneOpen = !this.state.phoneOpen;
      this.setState({
        phoneOpen,
        menuHeight: phoneOpen ? menu.scrollHeight : 0,
      });
    };

    render() {
      const {...props} = this.props;
      const {dataSource, isMobile} = props;
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
              <a href="/">
                <img width="100%" src={dataSource.logo.children} alt="img"/>
              </a>
            </TweenOne>
            <div className="link">
              <ul className="nav">
                {navChildren}
              </ul>
            </div>
            <div className="buttonsList">
              <Button type="primary" className="haveSticker" size="large" href="/submit">我要整一套屬於自己既Stickers!</Button>
            </div>
          </div>
        </TweenOne>
      );

    }
}

export default Nav
