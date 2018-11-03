const config = require('../config.js')
import { Component } from 'react';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import withRedux from 'next-redux-wrapper';
import reduxApi from '../lib/reduxApi';
import Helmet from "react-helmet"
import Wapper from "../components/Wapper/Wapper"
import {Card, Col, Row, Button} from "antd"
import * as React from "react"

class stickersList extends Component {



    static async getInitialProps ({store, isServer, pathname, query, router}) {
        //console.log(reduxApi.actions.listSticker.get());
        const stickersList = await store.dispatch(reduxApi.actions.kittens.sync())
        return { stickersList }
    }

    constructor (props) {
        super(props)

    }


    render () {
        const {stickersList} = this.props;//dd
        console.log(this.props)
        //const packList = stickers.map((sticker, index)=> <Card title={sticker.name} extra={<Button type="primary" icon="plus" size='large' ghost href={'twesticker://json?urlString=' +config.BASE_URL+ '/api/addtowhatsapp/'+this.props.uuid+'?chunk='+index}>Add to Whatsapp</Button>}> {sticker.stickers.map((item, itemIndex)=> <img src={item.image_data} width={'100px'}/>)} </Card>)

        return(
            <div>
                <Helmet>
                    <title>List page</title>
                    <meta name="description" content="Converter page description"/>
                </Helmet>


                <Wapper>

                    <Row type="flex" justify="center">
                        <Col lg={12}>
                            <Card title='Stickers List'
                                  bordered={false}>
                            </Card>

                        </Col>
                    </Row>
                </Wapper>
            </div>




        )
    };

}

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), reduxState);
const mapStateToProps = (reduxState) => ({ stickersList: reduxState.stickersList }); // Use reduxApi endpoint names here

const stickersListConnected = withRedux({ createStore: makeStore, mapStateToProps })(stickersList)
export default stickersListConnected;
