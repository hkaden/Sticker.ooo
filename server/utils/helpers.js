//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict';

const _ = require('lodash');

// Since DELETE doesn't return the _id of deleted item by default
module.exports.formatResponse = function (req, res, next) {
	if (req.crudify.err) console.error('formatResponse:', _.get(req, 'crudify.err.message'));
	const statusMap = {
		ValidationError: 400,
	};
	const status = req.crudify.err ? (statusMap[req.crudify.err.name] || 500) : 200;
	return res.status(status).json(req.crudify.err || (req.method === 'DELETE' ? req.params : req.crudify.result));
};
