const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { dbConnect } = require('../db/dbConnect')
const auth = require('../middleware/authMiddleware')

// connect to the database
dbConnect()

// enable CORS (Cross-Origin Resource Sharing) for all routes in this router
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') // allow requests from any origin
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    )
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    next()
})

// just a debugging route, currently
router.get('/', (req, res, next) => {
    res.json({message: 'we\'re in'})
})

// using this to check that everything is functioning as it should. it will be replaced by a page
router.get('/signup', async (req, res) => {
    const db = await dbConnect()
    const usersCollection = await db.collection('users')
    const result = await usersCollection.find().toArray()
    res.json(result)
})

// user signup route
router.post('/signup', async (req, res) => {
    try {
        const db = await dbConnect()
        const usersCollection = await db.collection('users')
        const {firstName, lastName, email, password} = req.body
        const errors = [] // array to store validation errors

        // validate user input
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
        // hash password using bcrypt
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // sanitise user input
        const sanitisedUser = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        }
        // check if email is already registered
        const existingUser = await usersCollection.findOne({email: sanitisedUser.email})
        if (existingUser) {
            return res.status(409).json({message: 'Email already registered.'})
        }

        // insert new user into database
        const result = await usersCollection.insertOne(sanitisedUser)
        res.status(201).json({message: 'User registered successfully', userId: result.insertedId})
    }
    catch (error) {
        console.error('Error during signup:', error)
        res.status(500).json({message: 'Signup failed.'})
    }
})

// user login route
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
        // compare provided password with stored hashed password
        const passwordCheck = await bcrypt.compare(req.body.password, user.password)
        if (!passwordCheck) {
            return res.status(401).send({message: 'Incorrect password.'})
        }
        // generate json web token for authentication
        const token = jwt.sign(
            {userId: user.id, email: user.email}, // payload
            process.env.JWT_SECRET, // secret key stored in .env
            {expiresIn: '1h'} // token expiration time
        )
        res.status(200).json({message: 'User logged in successfully', email: user.email, token})
    }
    catch (error) {
        console.error('Error during login', error)
        res.status(500).json({message: 'Login failed.'})
    }
})

// public endpoint (no authentication required)
router.get('/free-endpoint', async (req, res) => {
    res.json({message: 'This is a freely accessible endpoint.'})
})

// protected endpoint (requires authentication)
router.get('/auth-endpoint', auth, async (req, res) => { // note where auth middleware lives in protected route
    res.json({message: 'This is a secure endpoint. If you can read this, it means that you are authorised.'})
})

// helper function to validate email format.
// this is basic and should either be expanded or replaced with an existing library
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

module.exports = { router, isValidEmail }