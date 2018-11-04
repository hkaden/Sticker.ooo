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
        const stickersList = await store.dispatch(reduxApi.actions.listSticker.get())
        return { stickersList }
    }

    constructor (props) {
        super(props)
        this.state = {
            stickers: []
        }
    }

    componentDidMount() {
        const { stickers } = this.props.stickersList.data[0];
        this.setState({ stickers: stickers });
    }

    renderLoader() {
        return (
            <Card loading={true}></Card>
        )
    }

    render () {
        var packList = this.renderLoader();
        
        if( this.state.stickers.length > 0) {
            packList = this.state.stickers.map((sticker, itemIndex)=> 
                <Card 
                    key={itemIndex}
                    title={sticker.name} 
                    extra={
                        <Button type="primary" icon="plus" size='large' ghost href={'twesticker://json?urlString=' +config.BASE_URL+ '/api/addtowhatsapp/'+this.props.uuid+'?chunk='+itemIndex}>
                            Add to Whatsapp
                        </Button>
                    }> 
                    {
                        sticker.preview[0].map((item, itemIndex) => {
                            return (
                                <img key={itemIndex} src={item} width={'100px'}/>
                            );
                        })
                    } 
                </Card>
            )
        } 
       
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
                                  { packList }
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
const mapStateToProps = (reduxState) => ({ stickersList: reduxState.listSticker }); // Use reduxApi endpoint names here

const stickersListConnected = withRedux({ createStore: makeStore, mapStateToProps })(stickersList)
export default stickersListConnected;
