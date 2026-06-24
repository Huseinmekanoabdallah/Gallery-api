const jwt = require('jsonwebtoken');
const { error } = require('node:console');

require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
       return  res.status(401).json({error: 'No token provided'})
    }

    const token = authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: 'Invalid token format'})
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.userId = decoded.userId;
        req.username = decoded.username

        next()

        
    } catch (error) {
        console.error(error)
    }
}

module.exports = { verifyToken }