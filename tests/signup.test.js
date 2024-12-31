const express = require('express')
const req = require('supertest')
const {dbConnect} = require("../db/dbConnect")
const router = require('../routes/router').router
const app = express()
app.use(express.json())
app.use('/api', router)

describe('POST /api/signup', () => {
    it('should return 400 if firstName, lastName, email, or password are missing', async () => {
        const testCases = [
            { firstName: 'joseph', lastName: 'padfield', email: 'joseph.padfield@example.com' }, // missing password
            { firstName: 'joseph', lastName: 'padfield', password: 'password123' }, // missing email
            { firstName: 'joseph', email: 'joseph.padfield@example.com', password: 'password123' }, // missing lastName
            { lastName: 'padfield', email: 'joseph.padfield@example.com', password: 'password123' }, // missing firstName
            {} // missing all
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
        // first create a user in the database
        const existingUser = {
            firstName: 'Test',
            lastName: 'Test',
            email: 'joseph.padfield@test.com',
            password: 'password123'
        }

        const db = await dbConnect()
        const usersCollection = db.collection('users')
        await usersCollection.insertOne(existingUser)

        // now try to sign up with the same email
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

    it('should handle database errors during user insertion', async () => {
        const userData = {
            firstName: 'Joseph',
            lastName: 'Padfield',
            email: 'joseph.padfield@test.com',
            password: 'password123'
        }

        // define usersCollection
        let usersCollection

        // mock dbConnect to return the mocked connection
        jest.mock('../db/dbConnect', () => ({
            dbConnect: jest.fn().mockResolvedValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockReturnValue(null),
                        insertOne: jest.fn().mockRejectedValue(new Error('Generic database error'))
                    })
                })
            })
        }))

        const res = await req(app).post('/api/signup').send(userData)
        expect(res.statusCode).toBe(500)
        expect(res.body.error).toBeDefined()
    })

    it('should handle errors when checking for existing users', async () => {
        const userData = {
            firstName: 'Joseph',
            lastName: 'Padfield',
            email: 'joseph.padfield@test.com',
            password: 'password123'
        }

        let usersCollection

        // mock dbConnect to return the mocked connection
        jest.mock('../db/dbConnect', () => ({
            dbConnect: jest.fn().mockResolvedValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue(usersCollection = {
                        findOne: jest.fn().mockRejectedValue(new Error('Database query error'))
                    })
                })
            })
        }))

        const res = await req(app).post('/api/signup').send(userData)
        expect(res.statusCode).toBe(409)
        expect(res.body.error).toBeDefined()
    })
})