const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { dbConnect } = require('../db/dbConnect')
const auth = require('../middleware/authMiddleware')
const ObjectId = require('mongodb').ObjectId

// connect to the database
dbConnect()

// enable CORS (Cross-Origin Resource Sharing) for all routes in this router
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') // allow requests from any origin, update for production
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
            errors.push('first name is required')
        }
        if (!lastName || lastName.trim() === '') {
            errors.push('last name is required')
        }
        if (!email || !isValidEmail(email)) {
            errors.push('invalid email format')
        }
        if (!password || password.length < 8) {
            errors.push('password must be at least 8 characters')
        }
        if (!(/\d/.test(password))) {
            errors.push('password must contain at least one number')
        }
        if (!(/[a-zA-Z]/.test(password))) {
            errors.push('password must contain at least one letter')
        }
        if (errors.length > 0) {
            return res.status(400).json({error: errors})
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
            return res.status(409).json({error: 'email already registered.'})
        }

        // insert new user into database
        const result = await usersCollection.insertOne(sanitisedUser)
        res.status(201).json({message: 'user registered successfully', userId: result.insertedId})
    }
    catch (error) {
        res.status(500).json({error: 'signup failed.'})
    }
})

// user login route
router.post('/login', async (req, res) => {
    try {
        const db = await dbConnect()
        const usersCollection = await db.collection('users')
        const user = await usersCollection.findOne({email: req.body.email})
        if (!req.body.password) {
            return res.status(401).json({error: 'password is required'})
        }
        if (!user) {
            return res.status(404).json({error: 'email Not Found'})
        }
        // compare provided password with stored hashed password
        const passwordCheck = await bcrypt.compare(req.body.password, user.password)
        if (!passwordCheck) {
            return res.status(401).send({error: 'incorrect password.'})
        }
        // generate json web token for authentication
        const token = jwt.sign(
            {userId: user._id, email: user.email}, // payload
            process.env.JWT_SECRET, // secret key stored in .env
            {expiresIn: '1h'} // token expiration time
        )
        res.status(200).json({message: 'user logged in successfully', email: user.email, token})
    }
    catch (error) {
        res.status(500).json({error: 'login failed.'})
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

router.put('/users/:id', auth, async (req, res) => {
    try {
        const db = await dbConnect()
        const usersCollection = await db.collection('users')
        const loggedInUserId = new ObjectId(req.user.userId)
        const userToUpdate = new ObjectId(req.params.id)
        if(!loggedInUserId.equals(userToUpdate)) {
            return res.status(401).json({error: 'not authorised'})
        }

        // get updated user data
        const { firstName, lastName, email } = req.body


        // validation
        const errors = []

        if (!firstName || firstName.trim() === '') {
            errors.push('first name is required')
        }
        if (!lastName || lastName.trim() === '') {
            errors.push('last name is required')
        }
        if (!email || !isValidEmail(email)) {
            errors.push('invalid email format')
        }
        if (errors.length > 0) {
            return res.status(400).json({error: errors})
        }

        const updatedUserData = {
            firstName: firstName,
            lastName: lastName,
            email: email
        }

        // update user data
        const result = await usersCollection.updateOne(
            { _id: loggedInUserId },
            { $set: updatedUserData },
        )

        if(result.modifiedCount === 1) {
            res.json({message: 'success!', user: req.user})
        }
        else {
            console.log('user not found')
            res.status(404).json({error: 'user not found'})
        }
    }
    catch (error) {
        console.error(error)
        res.status(500).json({error: 'internal server error'})
    }
})

// helper function to validate email format.
// this is basic and should either be expanded or replaced with an existing library
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

module.exports = { router, isValidEmail }