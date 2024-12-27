const authMiddleware = require('../../auth')
const express = require('express')
const req = require('supertest')
const jwt = require('jsonwebtoken')
const router = require('../../routes/router').router
require('dotenv').config() // load environment variables from .env file

const app = express()
app.use(express.json())
app.use('/api', router)

// mock request, response and next objects
const mockRequest = (token) => ({
    headers: token ? { authorization: `Bearer ${token}` } : {} // set authorisation to undefined if no token
})

const mockResponse = () => {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

const next = jest.fn()

describe('authMiddleware', () => {
    it('should call next() if the token is valid', async () => {
        //generate a valid jwt
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        const req = mockRequest(token)
        const res = mockResponse()

        await authMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    it('should attach the decoded token to req.user', async () => {
        const userId = 1
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
        const req = mockRequest(token)
        const res = mockResponse()

        await authMiddleware(req, res, next)

        expect(req.user).toBeDefined()
        expect(req.user.userId).toBe(userId)
    })

    it('should return 401 if the token is missing', async () => {
        const res = await req(app).get('/api/auth-endpoint')
        expect(res.statusCode).toBe(401)
        expect(res.body.error).toBe('Authorisation header missing')
    });

    it('should return 401 if the token is invalid', async () => {
        const res = await req(app)
            .get('/api/auth-endpoint')
            .set('Authorization', `Bearer invalid token`)

        expect(res.statusCode).toBe(401)
        expect(res.body.error).toBe('Invalid token')
    })

    it('should return 401 if the token is expired', async () => {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '-1h' }) // generate expired token

        const res = await req(app)
            .get('/api/auth-endpoint')
            .set('Authorization', `Bearer ${token}`)

        expect(res.statusCode).toBe(401)
        expect(res.body.error).toBe('Token expired')
    })
})