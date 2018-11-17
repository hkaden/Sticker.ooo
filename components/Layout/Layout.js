import * as React from 'react'
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import {Nav00DataSource, FooterDataSource} from '../data.source.js';
import {enquireScreen} from "enquire-js"
import styles from "./Layout.less"
import { locales } from "../../locales/locales";

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile,
    };
  }

  componentDidMount() {
    enquireScreen((b) => {
      this.setState({isMobile: !!b});
    });

    //TODO: update locale based on redux state;
    this.setState({
      locales: locales.en
    })
  }

  render() {
    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        locales: this.state.locales
      });
    });
    return (

      <div
        className="templates-wrapper"
        ref={(d) => {
          this.dom = d;
        }}
      >
        <Nav
          id="Nav0_0"
          key="Nav0_0"
          dataSource={Nav00DataSource}
          isMobile={this.state.isMobile}
        />
        <div className="MainContent">
          {children}
        </div>
        <Footer
          dataSource={FooterDataSource}
        />
      </div>
    );
  }
}

export default Layout
