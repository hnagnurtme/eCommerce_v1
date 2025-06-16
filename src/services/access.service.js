const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const RoleShop = {
    SHOP : 'SHOP',
    WRITER : 'WRITER',
    EDITOR : 'EDITOR',
    ADMIN : 'ADMIN',
}
class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            const hodleShop = await shopModel.findOne({ email }).lean()
            //lean trả về 1 object js thuần tuý
            if (hodleShop) {
                return {
                    code: '406',
                    message: 'Already Email Registration',
                    status: 'error'
                }
            }
            const hashPassword = await bcrypt.hash(password,10)
            // salt = 10 > độ phức tạp càng khó -> ảnh hưởng đến CPU nếu quá nhiều
            const newShop = await shopModel.create({
                name , email, password : hashPassword, roles : [RoleShop.SHOP]
            })

            if( newShop){
                
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