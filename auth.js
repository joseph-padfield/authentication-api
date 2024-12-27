const jwt = require('jsonwebtoken')

// authentication middleware function
// should be placed before any protected routes to ensure that only authorised users can access them
module.exports = (req, res, next) => {
    try {
        if(!req.headers.authorization) {
            return res.status(401).json({ error: 'Authorisation header missing' });
        }
        const authHeader = req.headers.authorization
        // verify header is the correct Bearer <token> format
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Invalid authorisation format' });
        }
        // extract json web token from authorisation header
        const token = req.headers.authorization.split(' ')[1]
        // verify token using JWT secret key and attach decoded token payload to the request object
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        // this makes user information available in protected routes
        next()
    }
    catch (err) {
        // Check if the error is a JsonWebTokenError
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' })
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' })
        }
        else {
            // For other errors, re-throw to potentially handle them elsewhere
            // or log them for debugging
            console.err('Error during token verification')
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}