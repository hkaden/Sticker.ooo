

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const Stickerooo = require('../models/Stickerooo');
const auth = require('../middleware/auth');
const { expressValidatorErrorHandler } = require('../utils/expressErrorHandlers');
const { TYPES, MESSAGES } = require('../configs/constants');
const { requestParameterValidator } = require('../utils/validators');

module.exports = function (server) {
  server.get(
    '/api/stickerooo',
    auth.optional,
    async (req, res, next) => {
      try {
        let query = Stickerooo
                        .find({
                            status: 'RUNNING'
                        })
                        .limit(1)
                        .sort({'createdAt': -1})
                        .select({
                            version: 1,
                            status: 1
                        })
        let docs = await query;
        return res.status(200).json({
            type: TYPES.GET_APP_STATUS_SUCCESS,
            message: MESSAGES.GET_APP_STATUS_SUCCESS,
            data: docs[0]
        })
      } catch (e) {
        res.status(500).json({
            type: TYPES.FAILED_TO_GET_APP_STATUS,
            message: MESSAGES.FAILED_TO_GET_APP_STATUS
        })
      }
    },
  );

  //FIXME: use the commented out instead after beta
  server.post(
    '/api/stickerooo',
    auth.optional,
    async (req, res, next) => {
      try {
        let query = Stickerooo
                        .find({
                            status: 'RUNNING'
                        })
                        .limit(1)
                        .sort({'createdAt': -1})
                        .select({
                            version: 1,
                            status: 1
                        })
        let docs = await query;
        return res.status(200).json({
            type: TYPES.GET_APP_STATUS_SUCCESS,
            message: MESSAGES.GET_APP_STATUS_SUCCESS,
            data: docs[0]
        })
      } catch (e) {
        res.status(500).json({
            type: TYPES.FAILED_TO_GET_APP_STATUS,
            message: MESSAGES.FAILED_TO_GET_APP_STATUS
        })
      }
    },
  )
};


// server.post(
//     '/api/stickerooo',
//     auth.required,
//     auth.requiredAdminRole,
//     [
//         body('version'),
//         body('status'),
//         expressValidatorErrorHandler
//     ],
//     async (req, res, next) => {
//         try {
//             const { version, status } = req.body;
//             const stickerooo = new Stickerooo({
//                 version,
//                 status
//             })

//         return stickerooo.save((err) => {
//             if(err) {
//                 console.error(err)
//                 return res.status(500).json({
//                     type: TYPES.FAILED_TO_SET_APP_STATUS,
//                     message: MESSAGES.FAILED_TO_SET_APP_STATUS
//                 })
//             }

//             return Stickerooo.findOneAndUpdate({
//                 $or: [
//                     { status: 'RUNNING' },
//                     { status: 'MAINTAINING' },
//                   ],
//             }, {
//                 status: 'SUSPENDED'
//             }, (err, doc) => {
//                 if(err) {
//                     return res.status(500).json({
//                         type: TYPES.FAILED_TO_SET_APP_STATUS,
//                         message: MESSAGES.FAILED_TO_SET_APP_STATUS
//                     })
//                 }

//                 return res.status(200).json({
//                     type: TYPES.SET_APP_STATUS_SUCCESS,
//                     message: MESSAGES.SET_APP_STATUS_SUCCESS
//                 })
//             })
//         })
//         } catch (e) {
//         console.error(e)
//         return res.status(500).json({
//             type: TYPES.FAILED_TO_SET_APP_STATUS,
//             message: MESSAGES.FAILED_TO_SET_APP_STATUS
//         })
//         }
//     }
//   )
// };
