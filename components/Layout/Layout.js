import * as React from 'react'
import Nav from '../Nav/Nav';
import {Nav00DataSource} from '../data.source.js';
import {enquireScreen} from "enquire-js"
import Banner from "../Banner/Banner"
import {Banner00DataSource, FactArea00DataSource} from "../data.source"
import FactArea from "../FactArea/FactArea"


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
        <Nav
          id="Nav0_0"
          key="Nav0_0"
          dataSource={Nav00DataSource}
          isMobile={this.state.isMobile}
        />
        {this.props.children}
      </div>
    );
  }
}

export default Layout
