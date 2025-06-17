const keyTokenModel = require('../models/keyToken.model');
const { Types } = require('mongoose')
class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            const filter = { user: userId };
            const update = {
                publicKey,
                privateKey,
                refreshToken,
                refreshTokenUsed: [],
            };
            const options = {
                upsert: true,
                new: true,
            };

            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            console.error('Error creating keyToken:', error);
            return null;
        }
    };

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({ _id: id });
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokenUsed: refreshToken }).lean()
    }

    static deleteKeyByUserId = async (userId) => {
        return await keyTokenModel.findByIdAndDelete({ user: userId })
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken }).lean()
    }

    static updateKeyToken = async (id, { refreshToken, refreshTokenUsed }) => {
        return await keyTokenModel.findByIdAndUpdate(id, {
            $set: {
                refreshToken
            },
            $addToSet: {
                refreshTokenUsed
            }
        }, { new: true })
    }
}

module.exports = KeyTokenService;
