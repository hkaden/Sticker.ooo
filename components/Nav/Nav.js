import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Menu } from 'antd';
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
      const { ...props } = this.props;
      const { dataSource, isMobile } = props;
      delete props.dataSource;
      delete props.isMobile;
      const { menuHeight, phoneOpen } = this.state;
      const navData = dataSource.Menu.children;
      const navChildren = Object.keys(navData).map((key, i) => (
        <Item key={i.toString()} {...navData[key]}>
          <a
            {...navData[key].a}
            href={navData[key].a.href}
            target={navData[key].a.target}
          >
            {navData[key].a.children}
          </a>
        </Item>
      ));

      return (

        <TweenOne
          component="header"
          {...dataSource.wrapper}
          {...props}
        >
          <style jsx>
            { styles }
          </style>
          <div
            {...dataSource.page}
            className={`${dataSource.page.className}${phoneOpen ? ' open' : ''}`}
          >
            <TweenOne
              {...dataSource.logo}
            >
              <img width="100%" src={dataSource.logo.children} alt="img" />
            </TweenOne>
            {isMobile && (
            <div
              {...dataSource.mobileMenu}
              onClick={() => {
                this.phoneClick();
              }}
            >
              <em />
              <em />
              <em />
            </div>
            )}
            <TweenOne
              {...dataSource.Menu}
              ref={(c) => {
                this.menu = c;
              }}
              style={isMobile ? { height: menuHeight } : null}
            >
              <Menu
                mode={isMobile ? 'inline' : 'horizontal'}
                defaultSelectedKeys={['0']}
                theme={isMobile ? 'dark' : 'default'}
              >
                {navChildren}
              </Menu>
            </TweenOne>
          </div>
        </TweenOne>
      );
    }
}

export default Nav;
