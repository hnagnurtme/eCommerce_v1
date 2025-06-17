const shopModel = require('../models/shop.model')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtils')
const { type } = require('os')
const { format } = require('path')
const { getInfoData } = require('../utils')
const { NotFoundError, ConflictError } = require('../core/error.respone')
const { findByEmail } = require('./shop.service')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}
class AccessService {

    static logOut = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)

        console.log('delKey',delKey)

        return delKey
    }

    /*
        1. Check email in db
        2. Match Password
        3. Create AT , RT
        4. Generate Token
        5. Return user

    */
    static logIn = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email }); // ✅ Đúng kiểu

        if (!foundShop) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        const match = await bcrypt.compare(password, foundShop.password); // ✅ Thêm await

        if (!match) {
            throw new ConflictError('Sai mật khẩu');
        }

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        // ✅ Tạo token
        const tokens = await createTokenPair(
            {
                userId: foundShop._id,
                email
            },
            publicKey,
            privateKey
        );

        // ✅ Lưu khóa vào DB
        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey
        });

        return {
            metadata: {
                shop: getInfoData({
                    fields: ['_id', 'name', 'email'],
                    object: foundShop
                }),
                tokens
            }
        };
    };

    static signUp = async ({ name, email, password }) => {
        try {
            const hodleShop = await shopModel.findOne({ email }).lean()
            //lean trả về 1 object js thuần tuý
            if (hodleShop) {
                throw new ConflictError('Shop already register')
            }
            const hashPassword = await bcrypt.hash(password, 10)
            // salt = 10 > độ phức tạp càng khó -> ảnh hưởng đến CPU nếu quá nhiều
            const newShop = await shopModel.create({
                name, email, password: hashPassword, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // create privatekey , public key
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding:{
                //         type : 'pkcs1',
                //         format : 'pem'
                //     },
                //     privateKeyEncoding:{
                //         type : 'pkcs1',
                //         format : 'pem'
                //     }
                // })
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({ privateKey, publicKey })
                // save to database
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    //v2
                    privateKey
                })
                // if error


                if (!keyStore) {
                    return {
                        code: '406',
                        message: 'Error in create publicKey',
                        status: 'error'
                    }
                }

                // create Token Pair 
                const tokens = await createTokenPair({
                    userId: newShop._id,
                    email
                },
                    publicKey,
                    privateKey

                )
                console.log('Success', tokens)

                //
                return {
                    code: '201',
                    metadata: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                    status: 'success',
                }
            }
        } catch (error) {
            return {
                code: '406',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService