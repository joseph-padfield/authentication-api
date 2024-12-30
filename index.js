const express = require('express')
const app = express()
const { router } = require('./routes/router')

// middleware to parse json request bodies
app.use(express.json())

// middleware to parse url-encoded request bodies (for forms)
app.use(express.urlencoded({ extended: true }))

// mount the router at the '/api' path - all routes will be prefixed with this
app.use('/api', router)

// set the port for the server to listen on. if the .env is not present it will default to 3000
const port = process.env.PORT || 3000

// start server and log success
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})