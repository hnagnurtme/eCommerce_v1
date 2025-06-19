const AccessService = require("../services/access.service")
const { OK, CREATED} = require('../core/sucess.response')
class AccessController {
    logIn = async (req, res, next ) => {
        return new OK({
            message :' Login Successfully',
            metadata : await AccessService.logIn(req.body)
        }).send(res)
    }
    signUp = async (req,res,next) => {
            return new CREATED({
                message :'Register successfully',
                metadata : await AccessService.signUp(req.body)
            }).send(res)

    }

     logOut = async (req, res, next ) => {
        return new OK({
            message :' Logout Successfully',
            metadata : await AccessService.logOut(req.keyStore)
        }).send(res)
    }

    handleRefreshToken = async (req, res, next) =>{
        // return new OK({
        //     message : 'Get token success',
        //     metadata : await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res)

        return new OK({
              message : 'Get token success',
                metadata : await AccessService.handleRefreshTokenV2({
                    refreshToken : req.refreshToken,
                    user : req.user,
                    keyStore : req.keyStore
                })
        }).send(res)
    }

}

module.exports = new AccessController()