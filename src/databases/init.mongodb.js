const mongoose = require('mongoose')

const {database : {host,name,port}} = require('../configs/config.mongodb')
const { database } = require('../configs/config.mongodb')
const connectionString = `mongodb://${host}:${port}/${name}`

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

