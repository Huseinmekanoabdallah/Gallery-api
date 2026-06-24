const express = require('express');
const { verifyToken } = require('../Middlewares/middleware')

const { 
    uploadGallery, 
    uploadGalleryImages,
    getAllUploadedImages,
    getGalleryById,
    updateGalleryCaption,
    deleteGallery
    } = require('../Controllers/gallery')

const router = express.Router();

router.post('/upload/gallery', verifyToken, uploadGalleryImages);

router.get('/gallery', verifyToken, getAllUploadedImages);

router.get('/gallery/:id', verifyToken, getGalleryById)

router.put('/gallery/:id', verifyToken, updateGalleryCaption)

router.delete('/gallery/:id', verifyToken, deleteGallery)


module.exports = router
