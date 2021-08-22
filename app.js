require('dotenv').config()
const express = require('express')
const db = require('./jwt/config/database')
const auth = require('./jwt/middleware/auth')

db.connect()
const app = express()
app.use(express.json())

//Route User
var user_router = require('./routes/userRoute')
app.use('/user', user_router)

//Route Assignment
var assignment_router = require('./routes/assignmentSetRoute')
app.use('/assignment', assignment_router)

//Route Student Submission
var submission_router = require('./routes/submissionRoute')
app.use('/submission', submission_router)

app.post('/welcome', auth, (req, res) => {
    res.status(200).send('Welcome' + req.user.email)
})

module.exports = app
