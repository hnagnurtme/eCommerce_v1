const AccessService = require("../services/access.service")

class AccessController {
    signUp = async (req,res,next) => {
        try {
            console.log('Sign up')
            return res.status(201).json(await AccessService.signUp(req.body))
        } catch (error) {
            next(error)
        }

    }

}

module.exports = new AccessController()