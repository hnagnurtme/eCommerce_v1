const mongoose = require('mongoose')
const countConnect = require('../helper/check.connect')
const connectionString = 'mongodb://localhost:27017/shopApp'

class Database {
    constructor() {
        this.connect()
    }
    connect(type = 'moogodb') {
        //dev 
        if (1 == 0) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }
        mongoose.connect(connectionString, {
            maxPoolSize : 50
        }).then(_ => {
            console.log('Connect Mongoose Success With Instacne')
        }).catch(_ => {
            console.log('Connect Mongoose Failed')
        })

    }

    static getInstance(){
        if( !Database.instance){
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongoDB = Database.getInstance()

module.exports = instanceMongoDB

