const express = require('express')
const req = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { dbConnect } = require('../db/dbConnect')
const router = require('../routes/router').router
const app = express()
app.use(express.json())
app.use('/api', router)

// mock the database connection
jest.mock('../db/dbConnect', () => ({
    dbConnect: jest.fn(),
}))

describe('POST /api/login', () => {
    let mockDb, mockCollection

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
        }
        mockDb = {
            collection: jest.fn(() => mockCollection),
        }
        dbConnect.mockResolvedValue(mockDb)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return 404 if user does not exist', async () => {
        const userData = {
            email: 'doesnt.exist@example.com',
            password: 'password123',
        }

        mockCollection.findOne.mockResolvedValue(null)

        const res = await req(app).post('/api/login').send(userData)
        expect(res.statusCode).toBe(404)
        expect(res.body.error).toBe('Email Not Found')
    })

    it('should return 401 if no password is given', async () => {
        const userData = {
            email: 'test@example.com',
        }

        const res = await req(app).post('/api/login').send(userData)
        expect(res.statusCode).toBe(401)
        expect(res.body.error).toBe('Password is required')
    })

    it('should return 401 if password is incorrect', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'wrongpassword',
        }

        mockCollection.findOne.mockResolvedValue({ password: 'hashedPassword' })
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)

        const res = await req(app).post('/api/login').send(userData)
        expect(res.statusCode).toBe(401)
        expect(res.body.error).toBe('Incorrect password.')
    })

    it('should return 200 if user is logged in successfully', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'correctpassword',
        }

        mockCollection.findOne.mockResolvedValue({
            password: 'hashedPassword',
            email: 'test@example.com',
            _id: 'someUserId'
        })
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)

        // Mock jwt.sign to return a dummy token
        jest.spyOn(jwt, 'sign').mockReturnValue('mockJwtToken')

        const res = await req(app).post('/api/login').send(userData)
        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('User logged in successfully')
        expect(res.body.token).toBeDefined()
    })

    it('should return 500 for any other error during user lookup', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'password123',
        }

        mockCollection.findOne.mockRejectedValue(new Error('Database error'))

        const res = await req(app).post('/api/login').send(userData)
        expect(res.statusCode).toBe(500)
        expect(res.body.error).toBe('Login failed.')
    })
})