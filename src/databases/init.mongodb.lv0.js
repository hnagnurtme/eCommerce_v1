const mongoose = require('mongoose')

const connectionString = 'mongodb://localhost:27017/shopApp'

mongoose.connect(connectionString).then( _ => {
    console.log('Connect Mongoose Success')
}).catch( _ => {
    console.log('Connect Mongoose Failed')
})

//dev 
if( 1 == 1){
    mongoose.set('debug', true)
    mongoose.set('debug',{color : true})
}

module.exports = mongoose