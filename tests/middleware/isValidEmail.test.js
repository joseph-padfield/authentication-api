const isValidEmail = require('../../routes/router').isValidEmail
const { dbConnect, closeDb } = require('../../db/dbConnect')

describe('Your test suite', () => {

    // connect to the database before all tests
    beforeAll(async () => {
        await dbConnect()
    })

    // close the database connection after all tests
    afterAll(async () => {
        await closeDb()
    })

    describe('isValidEmail', () => {
        it('returns true if email is valid', async () => {
            // test with a simple valid email
            expect(isValidEmail('test@test.com')).toBe(true)
            // test with a more complicated valid email
            expect(isValidEmail('user.name@subdomain.example.com')).toBe(true)
        })

        it('returns false if email is invalid', async () => {
            // test with missing top-level domain
            expect(isValidEmail('test@example')).toBe(false)
            // test with missing domain and top-level domain
            expect(isValidEmail('user.name@')).toBe(false)
            // test with a completely invalid email format
            expect(isValidEmail('invalidemail')).toBe(false)
        })
    })
})