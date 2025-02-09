const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test the configuration
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Cloudinary Configuration Error:', error);
  } else {
    console.log('Cloudinary Configuration Valid:', result);
  }
});

module.exports = cloudinary;
