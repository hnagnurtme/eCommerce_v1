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
                upsert: true, // ✅ sửa "upset" thành "upsert"
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

}



module.exports = KeyTokenService;
