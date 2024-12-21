const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const dbConnect = require('../db/dbConnect')

dbConnect()

// just a debugging route
router.get("/", (req, res, next) => {
    res.json({message: "we're in"})
})

// using this to check that everything is functioning as it should. it will be replaced by a login page.
router.get("/signup", async (req, res) => {
    const db = await dbConnect()
    const usersCollection = await db.collection('users')
    const result = await usersCollection.find().toArray()
    res.json(result)
})

router.post('/signup', async (req, res) => {
    try {
        const db = await dbConnect()
        const usersCollection = await db.collection('users')

        const {firstName, lastName, email, password} = req.body

        const errors = []

        if (!firstName || firstName.trim() === '') {
            errors.push('First name is required')
        }
        if (!lastName || lastName.trim() === '') {
            errors.push('Last name is required')
        }
        if (!email || !isValidEmail(email)) {
            errors.push('Invalid email format')
        }
        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters')
        }
        if (errors.length > 0) {
            return res.status(400).json({errors: errors})
        }

        //     hashing password using bcrypt
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        //     input sanitisation
        const sanitisedUser = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        }

        const existingUser = await usersCollection.findOne({email: sanitisedUser.email})
        if (existingUser) {
            return res.status(409).json({message: 'Email already registered.'})
        }

        const result = await usersCollection.insertOne(sanitisedUser)
        res.status(201).json({message: 'User registered successfully', userId: result.insertedId})

    } catch (error) {
        console.error('Error during signup:', error)
        res.status(500).json({message: 'Signup failed.'})
    }
})

router.post('/login', async (req, res) => {
    try {
        const db = await dbConnect()
        const usersCollection = await db.collection('users')
        const user = await usersCollection.findOne({email: req.body.email})

        if (!user) {
            return res.status(404).json({message: 'Email Not Found'})
        }

        if (!req.body.password) {
            return res.status(401).json({message: 'Password is required'})
        }

        const passwordCheck = await bcrypt.compare(req.body.password, user.password)

        if (!passwordCheck) {
            return res.status(401).send({message: 'Incorrect password.'})
        }

        const token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )

        res.status(200).json({message: 'User logged in successfully', email: user.email, token})
    }
    catch (error) {
        console.error('Error during login', error)
        res.status(500).json({message: 'Login failed.'})
    }
})

// this function checks for correct email format.
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

module.exports = router