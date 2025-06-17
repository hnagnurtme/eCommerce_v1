const shopModel = require('../models/shop.model')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { type } = require('os')
const { format } = require('path')
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
        check this token used
    */
    static handleRefreshToken  = async ( refreshToken) =>{
        if (!refreshToken) {
            throw new NotFoundError('Refresh token non fourni')
        }
        
        // Trouvez d'abord le token dans la base de données
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)

        if (!holderToken) {
            throw new NotFoundError('Refresh token introuvable')
        }
        
        // Vérifiez si le token a déjà été utilisé
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)

        if (foundToken) {
            // Si le token a déjà été utilisé, supprimez-le et lancez une erreur
            const { userId } = await verifyJWT(refreshToken, holderToken.privateKey)
            await KeyTokenService.deleteKeyByUserId(userId)
            throw new ForBiddenError('Refresh token déjà utilisé')
        }
        
        try {

            const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
            

            const foundShop = await findByEmail({ email })
            if (!foundShop) {
                throw new NotFoundError('Utilisateur introuvable')
            }


            const tokens = await createTokenPair(
                { userId, email },
                holderToken.publicKey,
                holderToken.privateKey
            )


            await KeyTokenService.updateKeyToken(holderToken._id, {
                refreshToken: tokens.refreshToken,
                refreshTokenUsed: refreshToken
            })

            return {
                user: { userId, email },
                tokens
            }
        } catch (error) {
            throw new ForBiddenError(`Erreur de vérification du token: ${error.message}`)
        }
    }

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