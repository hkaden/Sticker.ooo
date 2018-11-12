import * as React from 'react'
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import {Nav00DataSource, FooterDataSource} from '../data.source.js';
import {enquireScreen} from "enquire-js"
import styles from "./Layout.less"

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
  }

  render() {
    return (

      <div
        className="templates-wrapper"
        ref={(d) => {
          this.dom = d;
        }}
      >
        <style jsx>
          {styles}
        </style>
        <Nav
          id="Nav0_0"
          key="Nav0_0"
          dataSource={Nav00DataSource}
          isMobile={this.state.isMobile}
        />
        {this.props.children}
        <Footer
          dataSource={FooterDataSource}
        />
      </div>
    );
  }
}

export default Layout
