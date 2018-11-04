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

class StickerPage extends Component {



    static async getInitialProps ({store, isServer, pathname, query, router}) {
        const uuid = query.uuid;
        const stickers = await store.dispatch(reduxApi.actions.fechSticker.get({uuid: uuid}));
        return { uuid, stickers, router };
    }

    constructor (props) {
        super(props)

    }


    render () {
        console.log(this.props.stickers[0].stickers);
        const {stickers} = this.props;
        const packList = stickers[0].stickers.map((pack, index)=>
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
                    pack.map((item, itemIndex)=> <img key={itemIndex} src={item} width={'100px'}/>)
                }
            </Card>
        )


        return(
        <div>
            <Helmet>
                <title>Submit page</title>
                <meta name="description" content="Converter page description"/>
            </Helmet>


            <Wapper>

                <Row type="flex" justify="center">
                    <Col lg={12}>
                        <Card title={stickers[0].name
                        }
                              extra={ 'Publisher: ' + stickers[0].publisher}
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
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), reduxState);
const mapStateToProps = (reduxState) => ({ sticker: reduxState.sticker }); // Use reduxApi endpoint names here

const IndexPageConnected = withRedux({ createStore: makeStore, mapStateToProps })(StickerPage)
export default IndexPageConnected;
