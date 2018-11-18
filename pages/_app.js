// pages/_app.js
import React from 'react';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import App, { Container } from 'next/app';
import withRedux from 'next-redux-wrapper';
import thunkMiddleware from 'redux-thunk';
import reduxApi from '../lib/reduxApi';
import { stickersListReducer, authReducer, localesReducer, setIsLoggedIn, setLocales } from '../lib/customReducers';
import { verifyJwt } from '../server/middleware/auth';
import { locales } from '../locales/locales';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { isServer, req } = ctx;
    if (isServer) {
      const isLoggedIn = await new Promise(resolve => verifyJwt(req.cookies.jwtToken, (err) => resolve(!err)));
      ctx.store.dispatch(setIsLoggedIn(isLoggedIn));
      ctx.store.dispatch(setLocales(locales));
    }
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};
    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}


const createStoreWithThunkMiddleware = applyMiddleware(thunkMiddleware)(createStore);
const makeStore = (reduxState, enhancer) => createStoreWithThunkMiddleware(
  combineReducers({
    ...reduxApi.reducers,
    stickersList: stickersListReducer,
    auth: authReducer,
    locales: localesReducer
  }),
  reduxState,
);

export default withRedux(makeStore)(MyApp);
