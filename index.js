const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
app.use(cors());

// app.use(fileUpload());
const activeRecordings = {};

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
      return res.status(500).json({ success: false, message: err });
    }
    res.status(200).json({ success: true, message: 'File uploaded successfully' })
  });
});


/**
 * Internal function to Start recording by user id.
 *
 * @param {userId}
 * @returns {ffmpegProcess}
 */
function startRecording(userId) {
  const ffmpegProcess = spawn('ffmpeg', [
    '-f', 'pulse',
    '-i', 'default',
    '-f', 'x11grab',
    '-video_size', '1920x1080',
    '-i', ':0.0',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-c:a', 'aac',
    '-strict', 'experimental',
    '-b:a', '320k',
    `output_${userId}.mp4`
  ]);

  activeRecordings[userId] = ffmpegProcess;

  ffmpegProcess.on('exit', () => {
    delete activeRecordings[userId];
  });

  return ffmpegProcess;
}

/**
 * Internal function to Stop recording by user id.
 *
 * @param {userId}
 * @returns {ffmpegProcess}
 */
function stopRecording(userId) {
  const ffmpegProcess = activeRecordings[userId];
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT');
    return true;
  }
  return false;
}

/**
 * Start recording by user id.
 *
 * @param {userId}
 * @returns {string}
 */
app.get('/startRecording/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!activeRecordings[userId]) {
    startRecording(userId);
    res.json({ status: 'success', message: 'Recording started', userId });
  } else {
    res.json({ status: 'error', message: 'Recording already in progress', userId });
  }
});

/**
 * Stop recording by user id.
 *
 * @param {userId}
 * @returns {string}
 */
app.get('/stopRecording/:userId', (req, res) => {
  const userId = req.params.userId;
  if (stopRecording(userId)) {
    res.send('Recording stopped');
  } else {
    res.send('No recording in progress for this user');
  }
});



app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

module.exports = app;