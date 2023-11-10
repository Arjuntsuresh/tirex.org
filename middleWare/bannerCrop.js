const sharp = require('sharp');
const fs = require('fs');

module.exports = {
  bannerCrop: (req, res, next) => {
    const inputFilePath = req.file.path;

    // Use sharp to read the input image
    sharp(inputFilePath)
      .resize(1920,970)
      .toFormat('webp')
      .toBuffer((err, processedImageBuffer) => {
        if (err) {
          req.session.bannerCropErr = 'Use any other image format';
          res.redirect('/admin/addBanner');
        } else {
          // Save the processed image back to the same file path
          fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
            if (writeErr) {
              req.session.bannerCropErr = 'Use any other image format';
              res.redirect('/admin/addBanner');
              // Handle the error as needed
            } else {
              console.log('Image cropped and saved successfully to:', inputFilePath);
              // Handle success or return a response as needed
              next();
            }
          });
        }
      });
  },
};
