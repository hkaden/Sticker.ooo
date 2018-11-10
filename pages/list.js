import * as React from 'react';
import { Component } from 'react';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import {
  Button, Card, Col, Pagination, Row,
} from 'antd';
import Head from 'next/head';
import reduxApi from '../lib/reduxApi';
import Wapper from '../components/Wapper/Wapper';
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

      console.log(stickersList);

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
            title={sticker.name}
            extra={(
              <Button type="primary" icon="plus" size="large" ghost href={`stickerooo://stickers/${sticker.uuid}`}>
                            Add to WhatsApp
              </Button>
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


          <Wapper>
            <Row type="flex" justify="center">
              <Col lg={12}>
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
        </div>
      );
    }
}

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers({ ...reduxApi.reducers, stickersList: stickersListReducer }), reduxState);
const mapStateToProps = reduxState => ({ stickersList: reduxState.stickersList }); // Use reduxApi endpoint names here

const stickersListConnected = withRedux({ createStore: makeStore, mapStateToProps })(stickersList);
export default stickersListConnected;
