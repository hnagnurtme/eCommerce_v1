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
app.use(express.json())
app.use(express.urlencoded({
    extended : true
}))
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
app.use((req , res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
}) 

app.use((err, req , res, next) => {
    console.error('Error:', err);
    const statusCode = err.status || 500
    return res.status(statusCode).json({
        status : 'Error',
        code : statusCode,
        stack : process.env.NODE_ENV === 'dev' ? err.stack : '',
        message : err.message || ' Internal Server Error'
    })
}) 
module.exports = app