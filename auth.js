const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
    try {
        const token = await req.headers.authorization.split(' ')[1]
        console.log('TOKEN: ' + token)
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = await decodedToken
        next()
    }
    catch(err) {
        res.status(401).json({error: 'Not authorized'})
    }
}