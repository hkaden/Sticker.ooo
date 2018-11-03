require('dotenv').config({path: __dirname + '/.env'})
const withCSS = require('@zeit/next-css')
module.exports = withCSS({
    cssModules: true
})
