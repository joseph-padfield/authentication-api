require('dotenv').config() // load environment variables from .env file
const { MongoClient, ObjectId } = require('mongodb') // import MongoClient and ObjectId from mongodb driver

// retrieve the database connection URL from environment variables
const url = process.env.DB_URL
const dbName = 'authDB'
const client = new MongoClient(url)

async function dbConnect() {
    try {
        await client.connect()
        console.log('Connected to database')

        const db = client.db(dbName)

        const collections = await db.listCollections().toArray()
        console.table(collections)

        return client.db(dbName)
    }
    catch (error) {
        console.error('Error connecting to MongoDB', error)
        throw error
    }
}

module.exports = dbConnect