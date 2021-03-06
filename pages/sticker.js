import { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import {
  Card, Col, Row, Button,
} from 'antd';
import Wapper from '../components/Wapper/Wapper';
import reduxApi from '../lib/reduxApi';
import {
  decodeWebp, loadStickersList,
} from '../lib/customReducers';
import WhatsAppStickersConverter from '../lib/WhatsAppStickersConverter';
import saveAs from 'file-saver';
import Router from 'next/router';
import Layout from '../components/Layout/Layout'

class StickerPage extends Component {
    converter = null;

    static async getInitialProps({
      store, query, router, req,
    }) {
      const uuid = query.uuid;
      const stickersList = await store.dispatch(reduxApi.actions.sticker.get({ uuid }));
      await store.dispatch(loadStickersList(stickersList));
      const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
      return { uuid, router, userAgent };
    }

    constructor(props) {
      super(props);
    }

    componentDidMount() {
      if (!this.isWebpSupported()) {
        this.converter = new WhatsAppStickersConverter();
        this.converter.init().then(async () => {
          this.props.decodeWebp(this.converter);
        }).catch(e => console.log(e));
      }
    }

    isWebpSupported() {
      return this.props.userAgent.includes('Chrome') || this.props.userAgent.includes('Android');
    }

    render() {
      const { stickersList } = this.props;
      const packList = stickersList[0].stickers.map((pack, index) => (
        <Card
          key={index}
          title={`Pack ${index + 1}`}
          extra={<Button style={{ marginLeft: '10px' }} type="primary" icon="plus" size="large" ghost onClick={() => {
            let url = `/api/stickers/${this.props.uuid}/packs/${index + 1}.json`;
            if (this.props.userAgent.includes('iPhone')) {
              Router.push(url);
            } else {
              saveAs(url, `${stickersList[0].name}_${index + 1}.json`, {type: 'application/json'});
            }

          }} >
            Download JSON
          </Button>}
        >
          {
                    pack.map((item, itemIndex) => <img key={itemIndex} src={this.isWebpSupported() ? item : (item.endsWith('.webp') ? '' : item)} width="100px" />)
                }
        </Card>
      ));


      return (
        <div>
          <Head>
            <title>{`${stickersList[0].name} - Sticker.ooo`}</title>
            <meta name="description" content="Converter page description" />
            <script src="../static/libwebpjs.out.js" />
          </Head>


          <Layout>
            <Wapper>
              <Row type="flex" justify="center">
                <Col lg={12}>
                  <Card
                    title={stickersList[0].name
                    }
                    extra={
                      `Publisher: ${stickersList[0].publisher}`
                    }
                    bordered={false}
                  >
                    {packList}
                  </Card>
                </Col>
              </Row>
            </Wapper>
          </Layout>
        </div>
      );
    }
}

const mapStateToProps = reduxState => ({
  stickersList: reduxState.stickersList,
}); // Use reduxApi endpoint names here

const mapDispatchToProps = dispatch => ({
  decodeWebp: (converter) => {
    dispatch(decodeWebp(converter));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(StickerPage);
