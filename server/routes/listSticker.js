'use strict';

const mongooseCrudify = require('mongoose-crudify');
const helpers = require('../services/helpers');
const Sticker = require('../models/Sticker');

module.exports = function (server) {
    let selectFields = '-__v -id -create';
    let endResponseInAction = true;
    server.use(
        '/api/liststicker',
        mongooseCrudify({
            Model: Sticker,
            identifyingKey: 'uuid',
            actions: {
                list: (req, res, next) => {
                    let query = Sticker.find({})
                        //.skip(1 * 5)
                        //.limit(1)
                        .sort({'_id':-1});

                    if (selectFields) {
                        query.select(selectFields)
                    }

                    query.exec((err, docs) => {
                        if (endResponseInAction) {
                            console.log("here")
                            if (err) {
                                console.log("Err")
                                return res.json(err)
                            }
                        }
                        let stickersArr = [];
                        docs.map(item => {
                            console.log("pushing item")
                            stickersArr.push({
                                name: item.name,
                                publisher: item.publisher,
                                uuid: item.uuid,
                                preview: item.stickers.slice(0, 5).map(i=>{
                                    return( i )
                                })
                            })
                        })
                        let newJson = {
                            stickers: stickersArr,
                        }
                            console.log(newJson)
                            res.json(newJson)

                        if (mongooseCrudify.exposure.hooks['after']['list'].length > 0) {
                            next()
                        }
                    })
                }
            },
            // beforeActions: [],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
        })
    );

};
