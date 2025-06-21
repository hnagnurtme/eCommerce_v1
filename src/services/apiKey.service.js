const apiKeyModel = require("../models/apiKey.model")
const crypto = require('crypto')

const findApiKeyById = async (key) =>{
    const objKey = await apiKeyModel.findOne({
        key,
        status : true
    })
    .lean()

    return objKey
}

// Function to create a new API key
const createApiKey = async () => {
    const newKey = await apiKeyModel.create({
        key: crypto.randomBytes(32).toString('hex'),
        permissions: ['0000', '1111', '2222']
    })
    return newKey
}

module.exports = {
    findApiKeyById,
    createApiKey
}