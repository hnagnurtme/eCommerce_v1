const { token } = require('morgan')
const keyTokenModel = require('../models/keyToken.model')

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey , privateKey}) => {
        try {

            const tokens = await keyTokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })

            return tokens ? tokens.publicKey : null
            
        } catch (error) {
            console.error('Error creating keyToken:', error)
            return null
        }
    }
}

module.exports = KeyTokenService