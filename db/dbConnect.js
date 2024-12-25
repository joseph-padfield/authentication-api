require('dotenv').config() // load environment variables from .env file
const { MongoClient, ObjectId } = require('mongodb') // import MongoClient and ObjectId from mongodb driver

// retrieve the database connection URL from environment variables
const url = process.env.DB_URL
const dbName = 'authDB'
const client = new MongoClient(url)

async function dbConnect() {
    try {
        await client.connect()

        const db = client.db(dbName)

        const collections = await db.listCollections().toArray()

        return client.db(dbName)
    }
    catch (error) {
        console.error('error connecting to MongoDB', error)
        throw error
    }
}

async function closeDb() {
    try {
        await client.close()
        console.log('closed db connection')
    }
    catch (error) {
        console.error('error closing connection to db', error)
    }
}

module.exports = { dbConnect, closeDb }