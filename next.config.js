require('dotenv').config({path: __dirname + '/.env'})
const withLess = require('@zeit/next-less')
module.exports = withLess({
    lessLoaderOptions: {
        javascriptEnabled: true
    }
})
