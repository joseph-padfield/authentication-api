const authMiddleware = require('../middleware/authMiddleware')
const express = require('express')
const req = require('supertest')
const jwt = require('jsonwebtoken')
const router = require('../routes/router').router
require('dotenv').config() // load environment variables from .env file

// create express app for testing
const app = express()
app.use(express.json())
app.use('/api', router) // mount the router

// mock request object with optional token
const mockRequest = (token) => ({
    headers: token ? { authorization: `Bearer ${token}` } : {} // set authorisation to undefined if no token
})

// mock response object with mock functions for status and json
const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

// mock next function
const next = jest.fn()

describe('authMiddleware', () => {
    afterEach(() => {
        jest.restoreAllMocks() // restore all mocks after each test
    })
    it('should call next() if the token is valid', async () => {
        //generate a valid jwt
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        const req = mockRequest(token)
        const res = mockResponse()

        await authMiddleware(req, res, next)

        expect(next).toHaveBeenCalled() // assert that next() was called
    })

    it('should attach the decoded token to req.user', async () => {
        const userId = 1
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        const req = mockRequest(token)
        const res = mockResponse()

        await authMiddleware(req, res, next)

        expect(req.user).toBeDefined() // assert that req.user is defined
        expect(req.user.userId).toBe(userId) // assert that the userId matches
    })

    it('should return 401 if the token is missing', async () => {
        const res = await req(app).get('/api/auth-endpoint') // make a request without a token
        expect(res.statusCode).toBe(401) // assert 401 unauthorised status code
        expect(res.body.error).toBe('Authorisation header missing') // assert correct error message
    });

    it('should return 401 if the token is invalid', async () => {
        const res = await req(app)
            .get('/api/auth-endpoint')
            .set('Authorization', `Bearer invalid token`) // make a request with an invalid token

        expect(res.statusCode).toBe(401) // assert 401 unauthorised status code
        expect(res.body.error).toBe('Invalid token') // assert correct error message
    })

    it('should return 401 if the token is expired', async () => {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '-1h' }) // generate expired token

        const res = await req(app)
            .get('/api/auth-endpoint')
            .set('Authorization', `Bearer ${token}`) // make request with expired token

        expect(res.statusCode).toBe(401) // assert 401 unauthorised status code
        expect(res.body.error).toBe('Token expired') // assert correct error message
    })

    it('should handle unexpected errors during token verification', async () => {
        // mock jwt.verify to throw a non-JsonWebTokenError error
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            const error = new Error('Database error')
            error.name = 'DatabaseError' // set a different error name
            throw error
        });

        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        const res = await req(app)
            .get('/api/auth-endpoint')
            .set('Authorization', `Bearer ${token}`)

        expect(res.statusCode).toBe(500) // assert 500 internal server error status code
        expect(res.body.error).toBe('Internal server error') // assert correct error message
    })
})