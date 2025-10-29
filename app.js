//imports and dependancies
const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const { verifyAccessToken } = require('./middleware/jwt')
const errorHandler = require('./middleware/error')
const cors = require('cors')

//create express app
const app = express()

//middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

//route handlers
const userRoutes = require('./routes/user')
const employeeRoutes = require('./routes/employee')
const payrollRoutes = require('./routes/payroll')

app.use('/user', userRoutes)
app.use('/employee', employeeRoutes)
app.use('/payroll', payrollRoutes)

app.get('/', verifyAccessToken, async (req, res, next) => {
    console.log(req.headers['authorization'])
    res.send('Hello from express')
})

//environment configuration
require('dotenv').config()

//database connection
require('./config/mongoDB')
require('./config/redis')


//error handling middleware
app.use((req, res, next) => {
    next(createError(404, "Not Found"));
});

// 👉 global error handler
app.use(errorHandler);

//server listenning
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server is listenning on port ${PORT}`)
})
