const sharp = require('sharp')
const fs = require('fs')


module.exports = {
    productCrop: (req, res, next) => {
      // Assuming req.files is an array of uploaded files
      const files = req.files;
      
      // Define a function to process each file
      const processFile = (file, index) => {
        const inputFilePath = file.path;
  
        sharp(inputFilePath)
          .resize(1600,900)
          .toFormat('webp')
          .toBuffer((err, processedImageBuffer) => {
            if (err) {
              req.session.bannerCropErr = `Error processing image ${index + 1}`;
              // If there's an error, you might want to handle it appropriately
            } else {
              fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
                if (writeErr) {
                  req.session.bannerCropErr = `Error writing image ${index + 1}`;
                  // Handle write error as needed
                } else {
                  console.log(`Image ${index + 1} cropped and saved successfully to:`, inputFilePath);
                }
                if (index === files.length - 1) {
                  // If this is the last image, call next() to proceed
                  next();
                }
              });
            }
          });
      };
  
      // Process each file in the array
      files.forEach((file, index) => {
        processFile(file, index);
      });
    }
  };
  