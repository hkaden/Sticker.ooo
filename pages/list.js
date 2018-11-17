import * as React from 'react';
import { Component } from 'react';
import {connect} from "react-redux";
import {
  Button, Card, Col, Pagination, Row,
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import reduxApi from '../lib/reduxApi';
import Wapper from '../components/Wapper/Wapper';
import Layout from '../components/Layout/Layout';
import { decrypt } from '../server/utils/crypto';
import WhatsAppStickersConverter from '../lib/WhatsAppStickersConverter';
import { decodeWebp, loadStickersList, stickersListReducer } from '../lib/customReducers';

const config = require('../config.js');

class stickersList extends Component {
    converter = null;

    static async getInitialProps({
      store, isServer, pathname, query, router, req,
    }) {
      const pageSize = 5;
      const encryptedData = await store.dispatch(reduxApi.actions.stickers({ limit: pageSize }));
      const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
      const encryptResponse = process.env.ENCRYPT_RESPONSE === 'true';
      return {
        userAgent, encryptedData, pageSize, encryptResponse,
      };
    }

    constructor(props) {
      super(props);
      this.state = {
        currentPage: 1,
        pageCount: 1,
        isLoading: true,
      };
    }

    isWebpSupported() {
      return this.props.userAgent.includes('Chrome') || this.props.userAgent.includes('Android');
    }

    async getStickersList(currentPage) {
      const encryptedData = await this.props.dispatch(reduxApi.actions.sticker({ limit: this.props.pageSize, offset: (currentPage - 1) * this.props.pageSize }));
      const stickersList = (this.props.encryptResponse ? JSON.parse(decrypt(encryptedData[0].data)) : encryptedData[0]).data;
      await this.props.dispatch(loadStickersList(stickersList));

      if (!this.isWebpSupported()) {
        this.props.dispatch(decodeWebp(this.converter));
      }
    }

    pageinationOnChange = (page) => {
      this.setState({
        currentPage: page,
      });

      this.getStickersList(page).then(() => {
        if (!this.isWebpSupported()) {
          this.props.dispatch(decodeWebp(this.converter));
        }
      });
    }

    componentDidMount() {
      const { encryptedData } = this.props;
      const { count, data: stickersList } = process.env.ENCRYPT_RESPONSE === 'true' ? JSON.parse(decrypt(encryptedData[0].data)) : encryptedData[0];
      this.setState({
        itemCount: count,
        pageCount: Math.ceil((count / this.props.pageSize)),
        isLoading: false,
      });

      this.props.dispatch(loadStickersList(stickersList));

      if (!this.isWebpSupported()) {
        this.converter = new WhatsAppStickersConverter();
        this.converter.init().then(async () => {
          this.props.dispatch(decodeWebp(this.converter));
        }).catch(e => console.log(e));
      }
    }

    renderLoader() {
      return (
        <Card loading />
      );
    }

    render() {
      let packList = null;

      if (this.props.stickersList.length > 0) {
        packList = this.props.stickersList.map((sticker, itemIndex) => (
          <Card
            key={itemIndex}
            title={<div><div>{sticker.name}</div><div><i>by {sticker.publisher}</i></div></div>}
            extra={(
              <div>
                <Link href={{ pathname: '/sticker', query: {uuid: sticker.uuid}}} as={`/sticker/${sticker.uuid}`}>
                  <Button style={{ marginLeft: '10px' }} type="primary" size="large" ghost>
                    View more
                  </Button>
                </Link>
              </div>
            )}
          >
            {
              sticker.stickers[0].slice(0, 4).map((item, itemIndex) => (
                <img key={itemIndex} src={this.isWebpSupported() ? item : (item.endsWith('.webp') ? '' : item)} width="100px" />
              ))
            }
          </Card>
        ));
      } else {
        packList = (
          <Card>
                    No Stickers
          </Card>
        );
      }

      return (
        <div>
          <Head>
            <title>List page</title>
            <meta name="description" content="Converter page description" />
            <script src="../static/libwebpjs.out.js" />
          </Head>

          <Layout>
            <Wapper>
              <Row type="flex" justify="center">
                <Col xs={24} lg={12}>
                  <Card
                    title="Stickers List"
                    bordered={false}
                  >

                    { this.state.isLoading && this.renderLoader() }
                    { !this.state.isLoading && this.props.stickersList.length > 0
                                        && (
                                        <div>
                                          { packList }
                                          <Pagination current={this.state.currentPage} onChange={this.pageinationOnChange} total={this.state.itemCount} pageSize={this.props.pageSize} />
                                        </div>
                                        )
                                    }
                    { !this.state.isLoading && this.props.stickersList.length == 0
                                        && (
                                        <div>
                                          No Stickers
                                        </div>
                                        )
                                    }
                  </Card>
                </Col>
              </Row>
            </Wapper>
          </Layout>
       </div>
      );
    }
}

const mapStateToProps = reduxState => ({ stickersList: reduxState.stickersList }); // Use reduxApi endpoint names here

export default connect(mapStateToProps)(stickersList);
