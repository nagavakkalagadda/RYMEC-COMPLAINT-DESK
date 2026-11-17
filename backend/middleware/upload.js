const multer = require('multer');

// Use in-memory storage to prevent EROFS (read-only file system) errors on Vercel serverless environments
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/3gpp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only photos (JPEG, PNG, WEBP), videos (MP4, WEBM, MOV), and documents (PDF) are permitted'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

module.exports = upload;
