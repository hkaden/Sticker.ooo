import { decodeWebp, decodeWebpByPath, loadStickersList, stickersListReducer } from '../lib/customReducers';

const config = require('../config.js')
import { Component } from 'react';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../lib/reduxApi';
import Head from 'next/head';
import Wapper from "../components/Wapper/Wapper"
import {Card, Col, Row, Button} from "antd"
import * as React from "react"
import WhatsAppStickersConverter from '../lib/WhatsAppStickersConverter';

class StickerPage extends Component {

    converter = null;

    static async getInitialProps({store, isServer, pathname, query, router, req}) {
        const uuid = query.uuid;
        const stickersList = await store.dispatch(reduxApi.actions.fetchSticker.get({uuid: uuid}));
        await store.dispatch(loadStickersList(stickersList));
        const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
        return { uuid, router, userAgent };
    }

    constructor (props) {
        super(props)
    }

    isWebpSupported() {
        return this.props.userAgent.includes('Chrome') || this.props.userAgent.includes('Android');
    }

    componentDidMount() {
        if (!this.isWebpSupported()) {
            this.converter = new WhatsAppStickersConverter();
            this.converter.init().then(async () => {
                this.props.decodeWebp(this.converter, this.props.stickersList)
            }).catch(e => console.log(e));
        }
    }

    render() {
        const {stickersList} = this.props;
        const packList = stickersList[0].stickers.map((pack, index)=>
            <Card
                key={index}
                title={'Pack ' + index}
                extra={
                    <Button type="primary" icon="plus" size='large' ghost href={'twesticker://json?urlString=' +config.BASE_URL+ '/api/addtowhatsapp/'+this.props.uuid+'?chunk='+index}>
                        Add to Whatsapp
                    </Button>
                }
            >
                {
                    pack.map((item, itemIndex)=> <img key={itemIndex} src={this.isWebpSupported() ? item : (item.startsWith('data:image/webp') ? '' : item)} width={'100px'}/>)
                }
            </Card>
        )


        return(
        <div>
            <Head>
                <title>Submit page</title>
                <meta name="description" content="Converter page description"/>
                <script src="../static/libwebpjs.out.js"/>
            </Head>


            <Wapper>

                <Row type="flex" justify="center">
                    <Col lg={12}>
                        <Card title={stickersList[0].name
                        }
                              extra={ 'Publisher: ' + stickersList[0].publisher}
                              bordered={false}>
                            {packList}

                        </Card>

                    </Col>
                </Row>
            </Wapper>
        </div>
    )
    };

}

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers({...reduxApi.reducers, stickersList: stickersListReducer}), reduxState);
const mapStateToProps = (reduxState) => {
    return ({stickersList: reduxState.stickersList});
} // Use reduxApi endpoint names here

const mapDispatchToProps = (dispatch) => ({decodeWebp: (converter, stickersList) => {dispatch(decodeWebp(converter, stickersList))}});
const IndexPageConnected = withRedux({ createStore: makeStore, mapStateToProps, mapDispatchToProps })(StickerPage)
export default IndexPageConnected;
