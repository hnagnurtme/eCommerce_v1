const { token } = require('morgan')
const keyTokenModel = require('../models/keyToken.model')

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey }) => {
        try {
            const publicKeyString = publicKey.toString()

            const tokens = await keyTokenModel.create({
                user: userId,
                publicKey: publicKeyString
            })

            return tokens ? tokens.publicKey : null
            
        } catch (error) {
            console.error('Error creating keyToken:', error)
            return null
        }
    }
}

module.exports = KeyTokenService