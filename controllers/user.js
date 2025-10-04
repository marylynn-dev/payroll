const User = require('../models/user')
const userValidation = require('../middleware/validation')
const createError = require('http-errors')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../middleware/jwt')
const Client = require('../config/redis')

const register = async (req, res, next) => {
    try {
        const result = await userValidation.validateAsync(req.body)

        const doesExist = await User.findOne({ email: result.email })
        if (doesExist) throw createError.Conflict(`${result.email} has already been registered`)
        const user = new User({ ...result, role: req.body.role });
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser)
        const refreshToken = await signRefreshToken(savedUser.id)
        const userObj = savedUser.toObject ? savedUser.toObject() : savedUser
        const { password, ...passwordLessUser } = userObj
        res.send({ accessToken, refreshToken, user: passwordLessUser })

    } catch (error) {
        console.log(error)
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

const logIn = async (req, res, next) => {
    try {
        const result = await userValidation.validate(req.body)
        const user = await User.findOne({ email: result.value.email })
        if (!user) throw createError.NotFound('User not registered')

        const isMatch = await user.isValidPassword(result.value.password)
        if (!isMatch) throw createError.Unauthorized('Username/Password is not valid')
        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)
        res.send({ accessToken, refToken })
    } catch (error) {
        next(error)
    }
}

const logOut = async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        Client.DEL(userId, (err, value) => {
            if (err) {
                console.log(err.message)
                throw createError.InternalServerError()
            }
            console.log(value)
            res.sendStatus(204)
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    register,
    logIn,
    refreshToken,
    logOut,
}