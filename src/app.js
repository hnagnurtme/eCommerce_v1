const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const app = express()

console.log('Process : ',process.env)

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
// init database
require('./databases/init.mongodb')
const { checkOverload} = require('./helper/check.connect')
checkOverload()
// init route
// app.get('/',(req,res,next) => {
//     const str = 'hello world'
//     return res.status(200).json({
//         message :"hello world",
//         metadata: str.repeat(1000)
//     }
//     )
// })
app.use('',require('./routes'))
//handle error

module.exports = app