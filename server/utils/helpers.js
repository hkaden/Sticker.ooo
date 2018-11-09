//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict';

const _ = require('lodash');

// Since DELETE doesn't return the _id of deleted item by default
module.exports.formatResponse = function (req, res, next) {
	if (req.crudify.err) {
        return next(req.crudify.err);
	}
	return res.status(200).json(req.method === 'DELETE' ? req.params : req.crudify.result);
};
