const multer = require('multer');
const db = require('../Model/db');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


// create absolute path for the uploads folder

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gallery-api/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
})




//create a multer instance
const upload = multer({ storage: storage });


// now the upload function

const uploadAvatar = async (req, res) => {

    try {

        if(!req.file){
            return res.status(400).json({error: 'No file uploaded'})
        }

        // get the information of the file. multer has already saved the file in /uploads/avatars
    const filename = req.file.filename;

    const userId = req.userId;

    const imageUrl = req.file.path; // get the path of the uploaded file

    // delete the previous avatar if it exists
    const [rows] = await db.query(
        'SELECT avatar_url FROM users WHERE id = ?',
        [userId]
    );

    if(rows.length > 0 && rows[0].avatar_url) {
        const oldPublicId = rows[0].avatar_url.split('/')/slice(-2).join('/').split('.')[0]; // get the public ID of the old avatar

        await cloudinary.uploader.destroy(oldPublicId); // delete the old avatar from Cloudinary
        
    }
    // get image URL
    // const imageUrl = `/uploads/avatars/${filename}`;



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

         if (avatarUrl) {
            const publicId = avatarUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

            await db.query(
                'UPDATE users SET avatar_url = NULL WHERE id = ?',
                [userId]
            )

            res.json({message: 'Avatar deleted successfully'})
        
    } catch (error) {
        console.error(error)
    }
}


module.exports = { upload, uploadAvatar, getProfile, deleteAvatar } 