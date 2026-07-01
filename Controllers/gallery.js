const multer = require('multer');
const path = require('path');
const db = require('../Model/db');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'gallery-api/gallery',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
})

// take 10 maximum images
const uploadGallery = multer({ storage: storage }).array('images', 10);


const uploadGalleryImages = async (req, res) => {
    try {
        uploadGallery(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const userId = req.userId;

            // ✅ FIX 1: Handle both string and array
            let captions = req.body.captions || [];
            // If captions is a string (single caption), convert to array
            if (typeof captions === 'string') {
                // Try to parse JSON if it's a JSON string
                try {
                    captions = JSON.parse(captions);
                } catch {
                    // If not JSON, treat as single caption
                    captions = [captions];
                }
            }
            // If it's already an array, keep it

            // ✅ FIX 2: Create a fresh array for each upload
            const uploaded = [];

            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const imageUrl = file.path; // get the path of the uploaded file
                const caption = captions[i] || null;

                const [result] = await db.query(
                    'INSERT INTO gallery (user_id, image_url, captions) VALUES (?, ?, ?)',
                    [userId, imageUrl, caption]
                );

                uploaded.push({
                    id: result.insertId,
                    image_url: imageUrl,
                    caption: caption
                });
            }

            res.status(200).json({
                message: `${req.files.length} images uploaded`,
                images: uploaded
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed' });
    }
};

// get all uploads
const getAllUploadedImages = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    let search = req.query.search;

    let searchCondition = '';
    let searchParam = [];

    if(search){
        searchCondition = 'AND captions LIKE ?';

        const searchTerm = `%${search}%`

        searchParam = [searchTerm]
    }

    const userId = req.userId;

    const [countTotal] = await db.query(
        `SELECT COUNT(*) as total FROM gallery g WHERE user_id = ? ${searchCondition}` ,
        [userId, ...searchParam]
    )

    const total = countTotal[0].total;


    const [rows] = await db.query(
        `SELECT id, image_url, captions, created_at FROM gallery WHERE user_id = ? 
         ${searchCondition} ORDER BY created_at DESC LIMIT ? OFFSET ?`, 
        [userId, ...searchParam, limit, offset]
    )

    res.json({
        page: page,
        limit: limit,
        data: rows,
        totalPages: Math.ceil(total / limit) 
    })
    } catch (error) {
        console.log(error)
    }
}

// get gallery by id
 const getGalleryById = async (req, res) => {

            try {

                const { id } = req.params;

                const userId = req.userId;

                const [rows] = await db.query(
                    'SELECT * FROM gallery WHERE id = ? AND user_id = ?',
                    [id, userId]
                )

                if(rows.length === 0){
                    return res.status(404).json({error: 'Gallery not found'})
                }

                return res.status(200).json({
                    data: rows[0]
                })
                
            } catch (error) {
                console.error(error)
            }
        }


// update caption of an image
const updateGalleryCaption = async (req, res) => {

    try {
        const { id } = req.params
        const userId = req.userId;

        const { captions } = req.body;
        
        const [checkIdExists] = await db.query(
            'SELECT * FROM gallery WHERE id = ? AND user_id = ?',
            [id, userId]
        )

        if(checkIdExists.length === 0){
            return res.json({error: 'Gallery not found'})
        }

        const [rows] = await db.query(
            'UPDATE gallery SET captions = ? WHERE id = ? AND user_id = ?',
            [captions, id, userId]
        );

        const [updatedCaption] = await db.query(
            'SELECT id, user_id, image_url, captions FROM gallery WHERE id = ? AND user_id = ?',
            [id, userId]
        )

        res.status(200).json({
            message: 'Caption updated successfully',
            data: updatedCaption
        })
        
    } catch (error) {
        console.log(error)
    }
}



const deleteGallery = async (req, res) => {
    try {

        const { id } = req.params;

        const userId = req.userId;

        const [currentImageQuery] = await db.query(
            'SELECT image_url FROM gallery WHERE id = ? AND user_id = ?',
            [id, userId]
        )

        const imageUrl = currentImageQuery[0]?.image_url;


        if(currentImageQuery.length === 0){
            return res.status(404).json({error: 'Gallery not found'})
        }

                if (imageUrl) {
            const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }


            const [deleteRow] = await db.query(
                'DELETE FROM gallery WHERE id = ? AND user_id = ?',
                [id, userId]
            )
    
            res.status(200).json({
                message: 'Image deleted successfully'
            })
        } catch (error) {
        console.error(error)
    }
}













module.exports = {
    uploadGallery,
    uploadGalleryImages,
    getAllUploadedImages,
    getGalleryById,
    updateGalleryCaption,
    deleteGallery
}