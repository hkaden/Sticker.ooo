const { body } = require('express-validator/check');

module.exports.formatResponse = function (req, res, next) {
  if (req.crudify.err) {
    return next(req.crudify.err);
  }
  return res.status(200).json(req.method === 'DELETE' ? req.params : req.crudify.result);
};

module.exports.populateAuditFields = [
  (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.payload) {
      req.body.updatedBy = req.payload.uuid;
      req.body.updatedAt = new Date();
      if (req.method === 'POST') {
        req.body.createdBy = req.payload.uuid;
        req.body.createdAt = req.body.updatedAt;
      } else {
        delete req.body.createdBy;
        delete req.body.createdAt;
      }
    }
    next();
  },
  body('createdBy').optional(),
  body('createdAt').optional(),
  body('updatedBy').optional(),
  body('updatedAt').optional(),
]
