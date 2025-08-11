const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Differentiate storage based on fieldname
    if (file.fieldname === 'certification') {
      cb(null, 'uploads/certifications/');
    } else if (file.fieldname === 'profilePhoto') {
      cb(null, 'uploads/profile_photos/');
    } else if (file.fieldname === 'bulkUsers') { // New fieldname for bulk user uploads
      cb(null, 'uploads/bulk_users/');
    } else {
      cb(new Error('Invalid fieldname for upload'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow PDFs for certifications, images for profile photos, and xlsx/csv for bulk users
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'certification') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for certifications!'), false);
    }
  } else if (file.fieldname === 'profilePhoto') {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG/PNG image files are allowed for profile photos!'), false);
    }
  } else if (file.fieldname === 'bulkUsers') { // New filter for bulk user uploads
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
        file.mimetype === 'application/vnd.ms-excel' || // .xls (older Excel)
        file.mimetype === 'text/csv') { // .csv
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) or CSV (.csv) files are allowed for bulk user uploads!'), false);
    }
  } else {
    cb(new Error('Invalid file type or fieldname!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for all files
  }
});

module.exports = upload;