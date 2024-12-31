const express = require('express')
const req = require('supertest')
const {dbConnect} = require("../db/dbConnect");
const router = require('../routes/router').router
const app = express()
app.use(express.json())
app.use('/api', router)

describe('POST /api.login', () => {
    it('should return 401 if the password is incorrect', async () => {

    })
})