import _ from 'lodash';
import 'isomorphic-fetch';
import reduxApi, { transformers } from 'redux-api';
import adapterFetch from 'redux-api/lib/adapters/fetch';
import { Provider, connect } from 'react-redux';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const jsonOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const apiTransformer = function (data, prevData, action) {
  const actionMethod = _.get(action, 'request.params.method');
  switch (actionMethod) {
    case 'POST':
      return [...prevData, data];
    case 'PUT':
      return prevData.map(oldData => (oldData._id === data._id ? data : oldData));
    case 'DELETE':
      return _(prevData).filter(oldData => (oldData._id === data._id ? undefined : oldData)).compact().value();
    default:
      return transformers.array.call(this, data, prevData, action);
  }
};

// redux-api documentation: https://github.com/lexich/redux-api/blob/master/docs/DOCS.md
export default reduxApi({
  stickers: {
    url: `${BASE_URL}/api/stickers`,
    options: jsonOptions,
    transformer: apiTransformer,
  },
  sticker: {
    url: `${BASE_URL}/api/stickers/:uuid`,
    crud: true, // Make CRUD actions: https://github.com/lexich/redux-api/blob/master/docs/DOCS.md#crud

    // base endpoint options `fetch(url, options)`
    options: jsonOptions,

    // reducer (state, action) {
    // 	console.log('reducer', action);
    // 	return state;
    // },

    // postfetch: [
    // 	function ({data, actions, dispatch, getState, request}) {
    // 		console.log('postfetch', {data, actions, dispatch, getState, request});
    // 		dispatch(actions.submitSticker.sync());
    // 	}
    // ],

    // Reimplement default `transformers.object`
    // transformer: transformers.array,
    transformer: apiTransformer,

  },
  register: {
    url: `${BASE_URL}/api/register`,
    crud: true, // Make CRUD actions: https://github.com/lexich/redux-api/blob/master/docs/DOCS.md#crud

    // base endpoint options `fetch(url, options)`
    options: jsonOptions,

    // reducer (state, action) {
    // 	console.log('reducer', action);
    // 	return state;
    // },

    // postfetch: [
    // 	function ({data, actions, dispatch, getState, request}) {
    // 		console.log('postfetch', {data, actions, dispatch, getState, request});
    // 		dispatch(actions.submitSticker.sync());
    // 	}
    // ],

    // Reimplement default `transformers.object`
    // transformer: transformers.array,
    transformer: apiTransformer,

  },

  login: {
    url: `${BASE_URL}/api/login`,
    crud: true, // Make CRUD actions: https://github.com/lexich/redux-api/blob/master/docs/DOCS.md#crud

    // base endpoint options `fetch(url, options)`
    options: jsonOptions,

    // reducer (state, action) {
    // 	console.log('reducer', action);
    // 	return state;
    // },

    // postfetch: [
    // 	function ({data, actions, dispatch, getState, request}) {
    // 		console.log('postfetch', {data, actions, dispatch, getState, request});
    // 		dispatch(actions.submitSticker.sync());
    // 	}
    // ],

    // Reimplement default `transformers.object`
    // transformer: transformers.array,
    transformer: apiTransformer,

  },
})
  .use('fetch', adapterFetch(fetch))
  .use('rootUrl', API_URL);
