const apiKeyModel = require("../models/apiKey.model")
const crypto = require('crypto')

const findApiKeyById = async (key) =>{
    // const newKey = await apiKeyModel.create({
    //     key : crypto.randomBytes(64).toString('hex'),
    //     permissions : ['0000']
    // })

    // console.log('Key', newKey)
    const objKey = await apiKeyModel.findOne({
        key,
        status : true
    })
    .lean()

    return objKey
}


module.exports = {
    findApiKeyById
}