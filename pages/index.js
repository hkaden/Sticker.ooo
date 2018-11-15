import {enquireScreen} from 'enquire-js';
import Banner from '../components/Banner/Banner';
import Layout from '../components/Layout/Layout';
import StickerList from '../components/StickerList/StickerList';
import {Banner00DataSource, FactArea00DataSource} from '../components/data.source.js';
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
      />,
      //<StickerList/>
    ];
    return (
      <Layout>
        {children}
      </Layout>

    );
  }
}
