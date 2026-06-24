const express = require('express');
const { verifyToken } = require('../Middlewares/middleware')

const { upload, uploadAvatar, getProfile, deleteAvatar } = require('../Controllers/media')

const router = express.Router();

router.post('/upload/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

router.get('/profile', verifyToken, getProfile)

router.delete('/avatar', verifyToken, deleteAvatar)


module.exports = router
