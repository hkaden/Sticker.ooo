import _ from 'lodash';
import 'isomorphic-fetch';
import reduxApi, { transformers } from 'redux-api';
import adapterFetch from 'redux-api/lib/adapters/fetch';
import { Provider, connect } from 'react-redux';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

const jsonOptions = {
	headers: {
		'Content-Type': 'application/json'
	}
};

const apiTransformer = function (data, prevData, action) {
	const actionMethod = _.get(action, 'request.params.method');
	switch (actionMethod) {
		case 'POST':
			return [...prevData, data];
		case 'PUT':
			return prevData.map(oldData => oldData._id === data._id ? data : oldData);
		case 'DELETE':
			return _(prevData).filter(oldData => oldData._id === data._id ? undefined : oldData).compact().value();
		default:
			return transformers.array.call(this, data, prevData, action);
	}
};

// redux-api documentation: https://github.com/lexich/redux-api/blob/master/docs/DOCS.md
export default reduxApi({

    submitSticker: {
        url: '/api/submitsticker',
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
        //transformer: transformers.array,
        transformer: apiTransformer,

    },

    listSticker: {
        url: '/api/liststicker',
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
        //transformer: transformers.array,
        transformer: apiTransformer,

    },

    fechSticker: {
        url: '/api/fechsticker/:uuid',
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
        // 		dispatch(actions.kittens.sync());
        // 	}
        // ],

        // Reimplement default `transformers.object`
        //transformer: transformers.array,
        transformer: apiTransformer,

    },

})
.use('fetch', adapterFetch(fetch))
.use('rootUrl', API_URL);
