module.exports.formatResponse = function (req, res, next) {
  if (req.crudify.err) {
    return next(req.crudify.err);
  }
  return res.status(200).json(req.method === 'DELETE' ? req.params : req.crudify.result);
};
