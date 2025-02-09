const cloudinary = require('cloudinary').v2;




if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
    
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Test configuration only if variables are present
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('Cloudinary Configuration Error:', error);
    } else {
      console.log('Cloudinary Configuration Valid:', result);
    }
  });
} else {
  console.error('Missing required Cloudinary environment variables');
}

module.exports = cloudinary;
