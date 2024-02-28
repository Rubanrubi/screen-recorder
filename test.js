const { spawn } = require('child_process');

// Command to start ffmpeg with screen capture and system audio capture
const ffmpegCommand = [
  '-f', 'pulse',                 // Input format (system audio)
  '-i', 'default',               // Input device (default system audio)
  '-f', 'x11grab',               // Input format (screen capture)
  '-video_size', '1920x1080',    // Video size
  '-i', process.env.DISPLAY,     // Input device (screen), use the DISPLAY environment variable
  '-c:v', 'libx264',             // Video codec
  '-preset', 'ultrafast',        // Preset for faster encoding
  '-c:a', 'aac',                 // Audio codec
  '-strict', 'experimental',     // Required for AAC codec
  '-b:a', '320k',                // Audio bitrate
  'output.mp4'                   // Output file name
];

// Start ffmpeg process
const ffmpegProcess = spawn('ffmpeg', ffmpegCommand);

// Handle ffmpeg process events
ffmpegProcess.stdout.on('data', data => console.log(data.toString()));
ffmpegProcess.stderr.on('data', data => console.error(data.toString()));
ffmpegProcess.on('close', code => {
  if (code === 0) {
    console.log('Recording finished.');
  } else {
    console.error(`Recording failed with code ${code}`);
  }
});