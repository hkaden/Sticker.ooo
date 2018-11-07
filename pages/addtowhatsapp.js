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

class appToWhatsapp extends Component {



    static async getInitialProps ({store, isServer, pathname, query }) {
        const uuid = query.uuid;
        const chunk = query.chunk;
        const stickers = await store.dispatch(reduxApi.actions.fechSticker.get({uuid: uuid}));
        return { uuid, stickers, chunk };
    }

    constructor (props) {
        super(props)
        console.log(this.props.res);
    }


    render () {
        const {stickers} = this.props;//dd



        return <div></div>;
    };

}

const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(combineReducers(reduxApi.reducers), reduxState);
const mapStateToProps = (reduxState) => ({ appToWhatsapp: reduxState.appToWhatsapp }); // Use reduxApi endpoint names here

const appToWhatsappConnented = withRedux({ createStore: makeStore, mapStateToProps })(appToWhatsapp)
export default appToWhatsappConnented
;
