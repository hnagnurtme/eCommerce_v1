const jwt = require('jsonwebtoken')
const asyncHandle = require('../helper/asyncHandle')
const { NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')
const { token } = require('morgan')

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESH_TOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await jwt.sign(
            payload,
            privateKey,
            {
                algorithm: 'HS256',
                expiresIn: '2 days'
            }
        )

        const refreshToken = await jwt.sign(
            payload,
            privateKey,
            {
                algorithm: 'HS256',
                expiresIn: '7 days'
            }
        )

        jwt.verify(accessToken, privateKey, (err, decode) => {
            if (err) {
                console.log('verify error', err)
            }
            else {
                console.log('decode verify ', decode)
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


const authenciation = asyncHandle(async (req, res, next) => {
    /*
    1. Check user_id missing
    2. Get access token
    3. Verify token
    4. Check user in db
    5. Check key Store with userId
    6. Return data
    */

    const userId = req.headers[HEADER.CLIENT_ID]

    if (!userId) {
        throw new NotFoundError(' Khong co client id')
    }

    const keyStore = await findByUserId(userId)

    if (!keyStore) {
        throw new NotFoundError(' Khong co key Store')
    }


    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) {
        throw new NotFoundError('Khong co access token')
    }

    try {
        const decodedUser = jwt.verify(accessToken, keyStore.privateKey)
        if (userId != decodedUser.userId) {
            throw new NotFoundError(' Ko cung id')
        }

        req.keyStore = keyStore
        req.user = decodedUser
        return next()
    } catch (error) {
        throw error
    }
})



const authenciationV2 = asyncHandle(async (req, res, next) => {
    /*
    1. Check user_id missing
    2. Get access token
    3. Verify token
    4. Check user in db
    5. Check key Store with userId
    6. Return data
    */

    const userId = req.headers[HEADER.CLIENT_ID]

    if (!userId) {
        throw new NotFoundError(' Khong co client id')
    }

    const keyStore = await findByUserId(userId)

    if (!keyStore) {
        throw new NotFoundError(' Khong co key Store')
    }

    // Check refreshToken
    if (req.headers[HEADER.REFRESH_TOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodedUser = jwt.verify(refreshToken, keyStore.privateKey)
            if (userId != decodedUser.userId) {
                throw new NotFoundError(' Ko cung id')
            }

            req.keyStore = keyStore
            req.user = decodedUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]

    if (!accessToken) {
        throw new NotFoundError('Khong co access token')
    }

    try {
        const decodedUser = jwt.verify(accessToken, keyStore.privateKey)
        if (userId != decodedUser.userId) {
            throw new NotFoundError(' Ko cung id')
        }

        req.keyStore = keyStore
        req.user = decodedUser
        return next()
    } catch (error) {
        throw error
    }
})

const verifyJWT = async (token, keySecret) => {
    return await jwt.verify(token, keySecret)
}


module.exports = {
    createTokenPair,
    authenciation,
    authenciationV2,
    verifyJWT
}