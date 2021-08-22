var express = require('express')
var router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcrypt')
const User = require('../jwt/model/userModel')
const auth = require('../jwt/middleware/auth')

//Register
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, type } = req.body
        console.log(first_name, last_name, email, password, type)

        if (!(email && password && first_name && last_name && type)) {
            res.status(400).send('All input is required')
        }
        //check email id is valid
        const emailRegex =
            /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        if (!emailRegex.test(email)) {
            res.status(400).send('Invalid email')
        }
        if (
            type.toLowerCase() !== 'student' &&
            type.toLowerCase() !== 'tutor'
        ) {
            res.status(400).send('Invalid type')
        }

        const oldUser = await User.findOne({ email: email.toLowerCase() })
        console.log(oldUser)
        if (oldUser) {
            return res.status(409).send('User Already Exist. Please Login')
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            type: type.toLowerCase(),
            password: encryptedPassword,
        })

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: '2h',
            }
        )
        user.token = token

        res.status(201).json(user)
    } catch (err) {
        console.log(err)
    }
})

// Login
router.post('/login', (req, res) => {
    const { email, password, type } = req.body
    console.log(email, password, type.toLowerCase())
    if (!(email && password && type.toLowerCase())) {
        return res.status(400).send('All input is required')
    }
    User.findOne({ email: email.toLowerCase() })
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found')
            }
            if (user.type !== type.toLowerCase()) {
                return res.status(400).send('User type not match')
            }
            bcrypt.compare(password, user.password).then((isMatch) => {
                if (!isMatch) {
                    return res.status(401).send('Invalid Password')
                }
                // Create token
                const token = jwt.sign(
                    { user_id: user._id, email, type: type.toLowerCase() },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: '2h',
                    }
                )
                // save user token
                user.token = token

                // return new user
                res.status(200).json(user)
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

//update
router.post('/update', auth, async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body
        console.log(first_name, last_name, email, password)
        if (!(email && password && first_name && last_name)) {
            res.status(400).send('All input is required')
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)

        const user = await User.findOneAndUpdate(
            { email },
            {
                first_name,
                last_name,
                email: email.toLowerCase(),
                password: encryptedPassword,
            }
        )
        res.status(200).json(user)
    } catch (err) {
        console.log(err)
    }
})

module.exports = router
