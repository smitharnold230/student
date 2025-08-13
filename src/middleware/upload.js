/**
 * Secure file upload middleware using Multer
 * Handles file type validation, size limits, and secure filename generation
 */
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const MB = 1024 * 1024;
const MAX = Number(process.env.MAX_UPLOAD_MB || 10) * MB;
const allowed = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.has(ext)) return cb(new Error('INVALID_FILE_TYPE'));
  cb(null, true);
};

const upload = multer({ 
  storage, 
  limits: { fileSize: MAX }, 
  fileFilter 
});

module.exports = { upload };
