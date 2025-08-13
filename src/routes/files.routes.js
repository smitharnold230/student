/**
 * Secure file download routes
 * Provides protected access to uploaded files
 */
const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');

/**
 * Secure download by filename (must be a previously stored hashed name)
 * Only authenticated users can access files
 */
router.get('/:filename', requireAuth, (req, res, next) => {
  const file = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(req.params.filename));
  
  fs.stat(file, (err, stats) => {
    if (err || !stats.isFile()) {
      return next({ 
        status: 404, 
        code: 'FILE_NOT_FOUND', 
        message: 'No such file' 
      });
    }
    
    res.sendFile(path.resolve(file));
  });
});

module.exports = router;
