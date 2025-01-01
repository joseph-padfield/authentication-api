const express = require('express')
const req = require('supertest')
const { dbConnect } = require("../db/dbConnect")
const router = require('../routes/router').router
const bcrypt = require('bcrypt')
const app = express()

app.use(express.json())
app.use('/api', router)

// mock the database connection
jest.mock('../db/dbConnect', () => ({
    dbConnect: jest.fn(),
}))

describe('POST /api/signup', () => {
    let mockDb, mockCollection

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
            insertOne: jest.fn(),
            find: jest.fn(() => ({ toArray: jest.fn() })),
        }
        mockDb = {
            collection: jest.fn(() => mockCollection),
        }
        dbConnect.mockResolvedValue(mockDb)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return 400 if firstName, lastName, email, or password are missing', async () => {
        const testCases = [
            { firstName: 'joseph', lastName: 'padfield', email: 'joseph.padfield@example.com' },
            { firstName: 'joseph', lastName: 'padfield', password: 'password123' },
            { firstName: 'joseph', email: 'joseph.padfield@example.com', password: 'password123' },
            { lastName: 'padfield', email: 'joseph.padfield@example.com', password: 'password123' },
            {}
        ]

        for (const testCase of testCases) {
            const res = await req(app)
                .post('/api/signup')
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 400 if firstName or lastName are empty strings or contain only whitespace', async () => {
        const testCases = [
            { firstName: '', lastName: 'padfield', email: 'joseph.padfield@example.com', password: 'password123' },
            { firstName: ' ', lastName: 'padfield', email: 'joseph.padfield@example.com', password: 'password123' },
            { firstName: 'joseph', lastName: '', email: 'joseph.padfield@example.com', password: 'password123' },
            { firstName: 'joseph', lastName: '  ', email: 'joseph.padfield@example.com', password: 'password123' }
        ]

        for (const testCase of testCases) {
            const res = await req(app)
                .post('/api/signup')
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 400 if email is invalid', async () => {
        const testCases = [
            { firstName: 'Joseph', lastName: 'Padfield', email: 'joseph.padfieldexample', password: 'password123' },
            { firstName: 'Joseph', lastName: 'Padfield', email: 'joseph.padfield@example', password: 'password123' },
            { firstName: 'Joseph', lastName: 'Padfield', email: 'joseph.padfield', password: 'password123' },
            { firstName: 'Joseph', lastName: 'Padfield', email: '', password: 'password123' }
        ]

        for (const testCase of testCases) {
            const res = await req(app)
                .post('/api/signup')
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 409 if email already exists', async () => {
        mockCollection.findOne.mockResolvedValue({ email: 'joseph.padfield@test.com' })

        const res = await req(app)
            .post('/api/signup')
            .send({
                firstName: 'Joseph',
                lastName: 'Padfield',
                email: 'joseph.padfield@test.com',
                password: 'password456'
            })

        expect(res.statusCode).toBe(409)
        expect(res.body.error).toBeDefined()
    })

    it('should return 400 if password format is invalid', async () => {
        const testCases = [
            { firstName: 'Joseph', lastName: 'Padfield', email: 'joseph.padfield@test.com', password: 'password' },
            { firstName: 'Joseph', lastName: 'Padfield', email: 'joseph.padfield@test.com', password: 'pass' },
            { firstName: 'Joseph', lastName: 'Padfield', email: 'joseph.padfield@test.com', password: '12345678' }
        ]

        for (const testCase of testCases) {
            const res = await req(app)
                .post('/api/signup')
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 201 when successfully inserting a new user into the database', async () => {
        const userData = {
            firstName: 'Joseph',
            lastName: 'Padfield',
            email: 'joseph.padfield@test.com',
            password: 'password123'
        }

        // mock successful insertion
        mockCollection.findOne.mockResolvedValue(null)
        mockCollection.insertOne.mockResolvedValue({ insertedId: 'mockUserId' })

        // mock bcrypt.hash (optional, if you want to test hashing as well)
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword')

        const res = await req(app).post('/api/signup').send(userData)

        expect(res.statusCode).toBe(201)
        expect(res.body.message).toBe('User registered successfully')
        expect(res.body.userId).toBe('mockUserId')
    })

    it('should return 500 if an error occurs during signup', async () => {
        const userData = {
            firstName: 'Joseph',
            lastName: 'Padfield',
            email: 'joseph.padfield@test.com',
            password: 'password123'
        }

        // force an error during database interaction (e.g., insertOne)
        mockCollection.insertOne.mockRejectedValue(new Error('Database error'))

        const res = await req(app).post('/api/signup').send(userData)

        expect(res.statusCode).toBe(500)
        expect(res.body.error).toBe('Signup failed.')
    })

})