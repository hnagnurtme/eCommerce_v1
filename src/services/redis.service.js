'use strict'

const redis = require('redis')
const {promisify} = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()


const pexpire = promisify(redisClient.pexpire).bind(redisClient)
const setnxAsync = promisify(redisClient.pexpire).bind(redisClient)

const acquireLock = async ( productId, quantity, cartId) =>{
    const key = `lock_v2025${productId}`;
    const retrtTimes = 10;
    const expireTime = 3000;

    for( let i =0; i < retrtTimes.length;i++){
        // tao 1 key , thang giu key thanh toan
        const result = await setnxAsync(key, expireTime)
        console.log(`Key ${result}`)

        if( result === 1){
            // thao tac voi inventory
            const isReversation = await reservationInventory({
                productId, quanity, cartId
            })
            if( isReversation.modifiedCount){
                await pexpire(key, expireTime)
                return key
            }
            return null
        }else{
            await new Promise((resolve) => setTimeout(resolve,50))
        }
    }
}

const releaseLock = async keyLock =>{
    const delAsynceKey = promisify(redisClient.del).bind(redisClient)
    return await delAsynceKey
}

module.exports = {
    acquireLock,
    releaseLock
}