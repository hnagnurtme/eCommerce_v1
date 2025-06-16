const jwt = require('jsonwebtoken')

const createTokenPair = async ( payload , publicKey , privateKey) => {
    try {
        const accessToken = await jwt.sign(
            payload,
            privateKey,
            {
                algorithm : 'RS256',
                expiresIn :'2 days'
            }
        )

        const refreshToken = await jwt.sign(
            payload,
            privateKey,
            {
                algorithm : 'RS256',
                expiresIn :'7 days'
            }
        )

        jwt.verify( accessToken, publicKey, (err,decode) => {
            if( err){
                console.log('verify error', err)
            }
            else{
                console.log('decode verify ',decode)
            }
        })
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        console.error('Error creating token pair:', error)
        return null
    }
}

module.exports = {
    createTokenPair
}