const express = require('express')
const accessController = require('../../controllers/access.controller');
const  asyncHandle  = require('../../helper/asyncHandle');
const { authenciation } = require('../../auth/authUtils');
const route = express.Router()


route.post('/shop/signup', asyncHandle(accessController.signUp))
route.post('/shop/login', asyncHandle(accessController.logIn))


route.use(authenciation)
route.post('/shop/refreshToken', asyncHandle(accessController.handleRefreshToken))
route.post('/shop/logout', asyncHandle(accessController.logOut))
module.exports = route