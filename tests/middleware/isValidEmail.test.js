const isValidEmail = require('../../routes/router').isValidEmail
const { dbConnect, closeDb } = require('../../db/dbConnect')

describe('Your test suite', () => {

    beforeAll(async () => {
        await dbConnect()
    })

    afterAll(async () => {
        await closeDb()
    })

    describe('isValidEmail', () => {
        it('returns true if email is valid', async () => {
            expect(isValidEmail('test@test.com')).toBe(true)
            expect(isValidEmail('user.name@subdomain.example.com')).toBe(true)
        })

        it('returns false if email is invalid', async () => {
            expect(isValidEmail('test@example')).toBe(false)
            expect(isValidEmail('user.name@')).toBe(false)
            expect(isValidEmail('invalidemail')).toBe(false)
        })
    })
})