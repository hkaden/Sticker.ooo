'use strict';

const mongooseCrudify = require('mongoose-crudify');
const helpers = require('../services/helpers');
const crypto = require('../services/crypto');
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
                    let initList = req.query.initList || false;
                    
                    let currentPage = req.query.currentPage;
                        let pageSize = 5;
                        let query = Sticker.find({})
                            .skip(pageSize * (currentPage-1))
                            .limit(pageSize)
                            .sort({'_id':-1});
                            
                        if (selectFields) {
                            query.select(selectFields)
                        }

                        query.exec((err, docs) => {
                            if (endResponseInAction) {
                                if (err) {
                                    return res.json(err)
                                }
                            }
                            let stickersArr = [];
                            docs.map(item => {
                                stickersArr.push({
                                    name: item.name,
                                    publisher: item.publisher,
                                    uuid: item.uuid,
                                    preview: item.stickers.slice(0, 5).map(i=>{
                                        return( i )
                                    })
                                })
                            })

                            let data = {
                                stickers: stickersArr,
                            }

                            if(initList) {
                                let query = Sticker.count();
                                query.exec((err, docs) => {
                                    if (endResponseInAction) {
                                        if (err) {
                                            return res.json(err)
                                        }
                                    }
                                    
                                    data = {
                                        ...data,
                                        count: docs
                                    }
                                    return res.json({
                                        data: crypto.encrypt(JSON.stringify(data), process.env.CRYPTO_PASSPHRASE)
                                    })
                                })
                            } else {
                                return res.json({
                                        data: crypto.encrypt(JSON.stringify(data), process.env.CRYPTO_PASSPHRASE)
                                    })
                            }
                            

                            // if (mongooseCrudify.exposure.hooks['after']['list'].length > 0) {
                            //     next()
                            // }
                        })
                    
                }
            },
            // beforeActions: [],
            // actions: {}, // list (GET), create (POST), read (GET), update (PUT), delete (DELETE)
        })
    );

};
