// load environment variables from .env file
require('dotenv').config()
// import MongoClient and ObjectId from mongodb driver
const { MongoClient } = require('mongodb')

// retrieve the database connection URL from environment variables
const url = process.env.DB_URL
// set name of database
const dbName = 'authDB'
// create a new mongo client instance
const client = new MongoClient(url)

// function to connect to the database
async function dbConnect() {
    try {
        // connect to mongo db server
        await client.connect()

        // select the database to use
        const db = client.db(dbName)

        // return database object
        return client.db(dbName)

    }
    catch (error) {
        console.error('error connecting to MongoDB', error)
        throw error // rethrow error to be handled elsewhere
    }
}

// function to close the connection to the database
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