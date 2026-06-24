const db = require('../Model/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

require('dotenv').config()

const signup = async (req, res) => {

    try {

        const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({error: 'Inputs are required'})
    }

    //check if email already exists

    const [existingUser] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
    );

    
    if(existingUser.length > 0){
        return res.status(400).json({error: 'Username or Email already exists'})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
        'INSERT INTO users(username, email, password) VALUES(?, ?, ?)',
        [username, email, hashedPassword]
    );


    res.status(201).json({
        message: 'User created successfully',
        user: {
            userId: result.insertId
        }
    })
        
    } catch (error) {
        console.error(error)
    }
}


const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if(!email || !password){
            return res.status(401).json({error: 'Inputs are required'})
        }

        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        if(rows.length === 0){
            return res.status(401).json({error: 'Invalid Credentials'})
        }

        const user = rows[0]

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({error: 'Invalid email or password'})
        }


        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )

        res.json({
            message: 'Login successfully',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = { signup, login }