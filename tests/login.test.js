const express = require('express')
const req = require('supertest')
const bcrypt = require('bcrypt')
const {dbConnect} = require('../db/dbConnect')
const router = require('../routes/router').router
const mongoClient = require('mongodb')
const app = express()
app.use(express.json())
app.use('/api', router)

describe('POST /api/login', () => {
    it('should return 404 if user does not exist', async () => {
        const userData = {
            email: 'doesnt.exist@example.com',
            password: 'password123'
        }

        // define user collection
        let usersCollection

        // mock dbConnect to return the mocked connection
        jest.mock('../db/dbConnect', () => ({
            dbConnect: jest.fn().mockResolvedValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue(usersCollection = {
                        findOne: jest.fn().mockRejectedValue(null)
                    })
                })
            })
        }))

        const res = await req(app).post('/api/login').send(userData)
        expect(res.statusCode).toBe(404)
        expect(res.body.error).toBeDefined()
    })

    it('should return 401 if no password is given', async () => {

    })

    it('should return 401 if password is incorrect', async () => {

    })

    it('should return 200 if user is logged in successfully', async () => {

    })

    it('should return 500 for any other error during user lookup', async () => {

    })

})