const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Cấu hình Cloudinary Object Storage từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'vlu-freelance-hub',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured
};
