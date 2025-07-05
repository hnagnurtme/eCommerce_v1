'use strict'

const redis = require('redis')
const { reservationInventory } = require('../models/repositories/inventory.repo')

// Create Redis client and connect
const redisClient = redis.createClient()

// Connect to Redis
redisClient.connect().catch(console.error)

const acquireLock = async ( productId, quantity, cartId) =>{
    const key = `lock_v2025${productId}`;
    const retryTimes = 10;
    const expireTime = 3000;

    for( let i = 0; i < retryTimes; i++){
        // tao 1 key , thang giu key thanh toan
        const result = await redisClient.setNX(key, expireTime)
        console.log(`Key ${result}`)

        if( result === true){
            // thao tac voi inventory
            const isReversation = await reservationInventory({
                productId, quantity: quantity, cartId
            })
            if( isReversation.modifiedCount){
                await redisClient.pExpire(key, expireTime)
                return key
            }
            return null
        }else{
            await new Promise((resolve) => setTimeout(resolve,50))
        }
    }
}

const releaseLock = async keyLock =>{
    return await redisClient.del(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}