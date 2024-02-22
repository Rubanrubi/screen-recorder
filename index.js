const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

app.use(cors({
    origin: 'http://localhost:5500'
  }));
  
app.use(fileUpload());

app.post('/recording', (req, res) => {
    if (!req.files || !req.files.video) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const videoFile = req.files.video;

      // Create uploads folder if it doesn't exist
      const uploadFolder = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadFolder)) {
          fs.mkdirSync(uploadFolder);
      }

    videoFile.mv(`${uploadFolder}/${videoFile.name}`, (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: err});
        }
        res.status(200).json({ success: true, message: 'File uploaded successfully'})
    });


});

 
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
 
module.exports = app;