const express = require('express')
const router = express.Router()
const { register, logIn, refreshToken, logOut } = require('../controllers/user')

router.post('/register', register)
router.post('/login', logIn)
router.post('/refresh-token', refreshToken)
router.delete('/logout', logOut)

module.exports = router