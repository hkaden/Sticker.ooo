import {enquireScreen} from 'enquire-js';
import Nav from '../components/Nav/Nav';
import Banner from '../components/Banner/Banner';

import {Banner00DataSource, FactArea00DataSource, Nav00DataSource} from '../components/data.source.js';
import FactArea from "../components/FactArea/FactArea"

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

export default class Home extends React.Component {
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
    const children = [
      <Nav
        id="Nav0_0"
        key="Nav0_0"
        dataSource={Nav00DataSource}
        isMobile={this.state.isMobile}
      />,
      <Banner
        id="Banner0_0"
        key="Banner0_0"
        dataSource={Banner00DataSource}
        isMobile={this.state.isMobile}
      />,
      <FactArea
        id="FactArea0_0"
        key="FactArea0_0"
        dataSource={FactArea00DataSource}
        isMobile={this.state.isMobile}
      />
    ];
    return (
      <div
        className="templates-wrapper"
        ref={(d) => {
          this.dom = d;
        }}
      >
        {children}
      </div>
    );
  }
}
