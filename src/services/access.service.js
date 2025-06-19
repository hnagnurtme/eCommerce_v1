const shopModel = require('../models/shop.model')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { NotFoundError, ConflictError, ForBiddenError } = require('../core/error.respone')
const { findByEmail } = require('./shop.service')
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN',
}
class AccessService {

    /* 
        1.  check this token used
        2.  neu da su dung roi, check xem la ai va xoa toan bo token nguoi do
        3. neu khong , tao 1 cap AT, RT
        4. Cap nhat token vao danh sach token da su dung
    */
    static handleRefreshToken = async (refreshToken) => {
        if (!refreshToken) {
            throw new NotFoundError('Không tồn tại refresh token')
        }

        // Kiểm tra nếu refresh token đã từng được sử dụng (dấu hiệu bị tấn công)
        const holderToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if (holderToken) {
            const { userId } = await verifyJWT(refreshToken, holderToken.privateKey)
            await KeyTokenService.deleteKeyByUserId(userId)
            throw new ForBiddenError('Refresh token đã bị sử dụng trước đó. Vui lòng đăng nhập lại.')
        }

        // Tìm refresh token hợp lệ
        const foundToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!foundToken) {
            throw new ForBiddenError('Refresh token không hợp lệ')
        }

        try {
            // Giải mã refresh token
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)

            // Tìm người dùng theo email
            const foundShop = await findByEmail({ email })
            if (!foundShop) {
                throw new NotFoundError('Không tìm thấy người dùng với email đã cung cấp')
            }

            // Tạo cặp accessToken và refreshToken mới
            const tokens = await createTokenPair(
                { userId, email },
                foundToken.publicKey,
                foundToken.privateKey
            )

            // Cập nhật refresh token mới và lưu lại token cũ vào danh sách đã sử dụng
            await KeyTokenService.updateKeyToken(foundToken._id, {
                refreshToken: tokens.refreshToken,
                refreshTokenUsed: refreshToken
            })

            return {
                user: { userId, email },
                tokens
            }
        } catch (error) {
            throw new ForBiddenError(`Lỗi xử lý refresh token: ${error.message}`)
        }
    }


    static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user
        if (keyStore.refreshTokenUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyByUserId(userId)
            throw new ForBiddenError('Refresh token đã bị sử dụng trước đó. Vui lòng đăng nhập lại.')
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new ForBiddenError('Refresh token không hợp lệ')
        }


        // Tìm người dùng theo email
        const foundShop = await findByEmail({ email })
        if (!foundShop) {
            throw new NotFoundError('Không tìm thấy người dùng với email đã cung cấp')
        }

        // Tạo cặp accessToken và refreshToken mới
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        )
        // Cập nhật refresh token mới và lưu lại token cũ vào danh sách đã sử dụng
        await KeyTokenService.updateKeyToken(keyStore._id, {
            refreshToken: tokens.refreshToken,
            refreshTokenUsed: refreshToken
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logOut = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)

        console.log('delKey', delKey)

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
        const foundShop = await findByEmail({ email });

        if (!foundShop) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }

        const match = await bcrypt.compare(password, foundShop.password);

        if (!match) {
            throw new ConflictError('Sai mật khẩu');
        }

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');


        const tokens = await createTokenPair(
            {
                userId: foundShop._id,
                email
            },
            publicKey,
            privateKey
        );


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