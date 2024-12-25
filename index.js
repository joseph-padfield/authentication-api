const express = require('express')
const app = express()
const { router } = require('./routes/router')

app.use(express.json())
// middleware to parse url-encoded request bodies (for forms)
app.use(express.urlencoded({ extended: true }))
app.use('/api', router)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})