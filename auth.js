const jwt = require('jsonwebtoken')

// authentication middleware function
// should be placed before any protected routes to ensure that only authorised users can access them
module.exports = async (req, res, next) => {
    try {
        // extract json web token from authorisation header
        const token = await req.headers.authorization.split(' ')[1]
        console.log('TOKEN: ' + token) // logging token for debugging - REMOVE LATER
        // verify token using JWT secret key
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET)
        // attach decoded token payload to the request object
        req.user = await decodedToken
        // this makes user information available in protected routes
        next()
    }
    catch(err) {
        res.status(401).json({error: 'Not authorized'})
    }
}