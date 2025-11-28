// backend/middleware/upload.js
// Handles image uploads (camera photos from farmer treatment request)

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// ------------------------------
// STORAGE: where to save files
// ------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save inside: backend/uploads/
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    // Generate safe unique filename
    const random = crypto.randomBytes(6).toString('hex');
    const safeOriginal = file.originalname
      .replace(/\s+/g, '_')          // replace spaces
      .replace(/[^a-zA-Z0-9_.-]/g, ''); // remove unsafe characters

    cb(null, `${Date.now()}-${random}-${safeOriginal}`);
  }
});

// ------------------------------
// FILE FILTER: only images
// ------------------------------
function fileFilter(req, file, cb) {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
  }
}

// ------------------------------
// MULTER UPLOAD INSTANCE
// ------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4 MB max file size
  }
});

// ------------------------------
module.exports = upload;
