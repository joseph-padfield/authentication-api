require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')

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