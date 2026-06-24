const express = require('express');
const db = require('./Model/db');
const cors = require('cors');
const path = require('path')

const authRoute = require('./Routes/auth')
const mediaRoute = require('./Routes/media')
const galleryRoute = require('./Routes/gallery')

const app = express();


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors()); // allows any domain to access your API

app.use(express.static(path.join(__dirname, 'Public')))

// auth route
app.use('/api', authRoute)

// media route
app.use('/api', mediaRoute)

// gallery route
app.use('/api', galleryRoute)

// serve uploaded files with absolute path
app.use('/uploads/', express.static(path.join(__dirname, 'uploads')))


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'login.html'))
})

app.listen(4000, () => {
    console.log('Server listening on Port 4000')
})