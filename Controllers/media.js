const multer = require('multer');
const db = require('../Model/db');
const path = require('path');
const fs = require('fs');

// create absolute path for the uploads folder
const uploadDir = path.join(__dirname, '..','uploads', 'avatars');

// now check where to save the file
const stotage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, uploadDir)
    },

    filename: function(req, file, cb){
        // name the file: e.g. 17844559940-profile.jpg
        cb(null, Date.now() + '-' + file.originalname)
    }
})


//create a multer instance
const upload = multer({ storage: stotage })


// now the upload function

const uploadAvatar = async (req, res) => {

    try {

        if(!req.file){
            return res.status(400).json({error: 'No file uploaded'})
        }

        // get the information of the file. multer has already saved the file in /uploads/avatars
    const filename = req.file.filename;

    const userId = req.userId;

    // get image URL
    const imageUrl = `/uploads/avatars/${filename}`;

    // now update the users table to show the avatar
    const [updateAvatar] = await db.query(
        'UPDATE users SET avatar_url = ? WHERE id = ?',
        [imageUrl, userId]
    );

    res.json({
        message: 'Avatar uploaded successfully',
        avatar: imageUrl
    })
        
    } catch (error) {
        console.error(error)
    }
}


// get profile of user
const getProfile = async (req, res) => {
    try {

        const userId = req.userId;

        const [rows] = await db.query(
            'SELECT username, email, avatar_url, created_at FROM users WHERE id = ?',
            [userId]
        );

        if(rows.length === 0){
            return res.status(404).json({error: 'User not found'})
        }

        res.json(rows[0])
        
    } catch (error) {
        console.error(error)
    }
}

// delete avatar
const deleteAvatar = async (req, res) => {
    try{
        const userId = req.userId;

        // get current avatar
        const [rows] = await db.query(
            'SELECT avatar_url FROM users WHERE id = ?',
            [userId]
        );

        //get the current avatar. if it is undefined it wont crash
        const avatarUrl = rows[0]?.avatar_url;  

        if(avatarUrl){
            const filePath = path.join(__dirname, '..', avatarUrl.slice(1)) // remove the beginning '/'

            // check if file exists in disk
            if(fs.existsSync(filePath)){
                fs.unlinkSync(filePath) //if it does then delete from disk permanently
            }

            await db.query(
                'UPDATE users SET avatar_url = NULL WHERE id = ?',
                [userId]
            )

            res.json({message: 'Avatar deleted successfully'})
        }
    } catch (error) {
        console.error(error)
    }
}


module.exports = { upload, uploadAvatar, getProfile, deleteAvatar } 