const express = require('express')
const req = require('supertest')
const { dbConnect } = require('../db/dbConnect')
const router = require('../routes/router').router
const jwt = require('jsonwebtoken')
const app = express()

app.use(express.json())
app.use('/api', router)

// mock the database connection
jest.mock('../db/dbConnect', () => ({
    dbConnect: jest.fn(),
}))

require('dotenv').config()

describe('PUT /api/users/:id', () => {
    let mockDb, mockCollection
    const mockUserId = '67831d38e9726f781517893b'
    const mockToken = jwt.sign({ userId: mockUserId }, process.env.JWT_SECRET)

    beforeEach(() => {
        mockCollection = {
            updateOne: jest.fn(),
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

    it('should return 401 if user is not authorised', async () => {
        const differentUserId = '67831d38e9726f781517893f'
        const res = await req(app)
            .put(`/api/users/${differentUserId}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                firstName: 'Joseph',
                lastName: 'Padfield',
                email: 'joseph.padfield@example.com'
            })

        expect(res.statusCode).toBe(401)
    })

    it('should return 400 if first name is missing or invalid', async () => {
        const testCases = [
            { lastName: 'Padfield', email: 'test@example.com' },
            { firstName: '', lastName: 'Padfield', email: 'test@example.com' }
        ]

        for(const testCase of testCases) {
            const res = await req(app)
                .put(`/api/users/${mockUserId}`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 400 if last name is missing or invalid', async () => {
        const testCases = [
            { firstName: 'Joseph', email: 'test@example.com' },
            { firstName: 'Joseph', lastName: '', email: 'test@example.com' }
        ]

        for(const testCase of testCases) {
            const res = await req(app)
                .put(`/api/users/${mockUserId}`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 400 if email is missing or invalid', async () => {
        const testCases = [
            { firstName: 'Joseph', lastName: 'Padfield' },
            { firstName: 'Joseph', lastName: 'Padfield', email: '' },
            { firstName: 'Joseph', lastName: 'Padfield', email: 'invalidEmail' }
        ]

        for(const testCase of testCases) {
            const res = await req(app)
                .put(`/api/users/${mockUserId}`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send(testCase)

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toBeDefined()
        }
    })

    it('should return 200 if the user is updated successfully', async () => {
        mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 })

        const res = await req(app)
            .put(`/api/users/${mockUserId}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                firstName: 'Joseph',
                lastName: 'Padfield',
                email: 'test@example.com'
            })

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('success!')
    })

    it('should return 404 if the user is not found', async () => {
        mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 })

        const res = await req(app)
            .put(`/api/users/${mockUserId}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                firstName: 'Joseph',
                lastName: 'Padfield',
                email: 'test@example.com'
            })

        expect(res.statusCode).toBe(404)
        expect(res.body.error).toBe('user not found')
    })

    it('should return 500 if an unexpected error occurs', async () => {
        mockCollection.updateOne.mockRejectedValue(new Error('database error'))

        const res = await req(app)
            .put(`/api/users/${mockUserId}`)
            .set('Authorization', `Bearer ${mockToken}`)
            .send({
                firstName: 'Joseph',
                lastName: 'Padfield',
                email: 'test@example.com'
            })

        expect(res.statusCode).toBe(500)
        expect(res.body.error).toBe('internal server error')
    })
})