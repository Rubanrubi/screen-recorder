const start = document.getElementById("start");
const stop = document.getElementById("stop");
const video = document.querySelector("video");
let recorder, stream;

let mic;

mic = true;


function microchange() {

  if(mic==true){
    document.getElementById('mic').innerHTML = `<i class="fa fa-microphone"></i>`
    mic = false

  }else{
    document.getElementById('mic').innerHTML = `<i class="fa fa-microphone-slash"></i>`
    mic = true
  }

}

const mergeAudioStreams = (desktopStream, voiceStream) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    let hasDesktop = false;
    let hasVoice = false;
    

    if (desktopStream && desktopStream.getAudioTracks().length > 0) {
      // If you don't want to share Audio from the desktop it should still work with just the voice.
      const source1 = context.createMediaStreamSource(desktopStream);
      const desktopGain = context.createGain();
      desktopGain.gain.value = 0.7;
      source1.connect(desktopGain).connect(destination);
      hasDesktop = true;
    }
    
    if (voiceStream && voiceStream.getAudioTracks().length > 0) {
      const source2 = context.createMediaStreamSource(voiceStream);
      const voiceGain = context.createGain();
      voiceGain.gain.value = 0.7;
      source2.connect(voiceGain).connect(destination);
      hasVoice = true;
    }
      
    return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
  };



async function startRecording() {
/*  stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: { mediaSource: "screen" }
  });*/

  desktopStream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio: true });

  if(mic){

    voiceStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

    const tracks = [
      ...desktopStream.getVideoTracks(), 
      ...mergeAudioStreams(desktopStream, voiceStream)
    ];

    stream = new MediaStream(tracks);
  }
  else{
    stream =  desktopStream
  }

  // options = {mimeType: 'video/webm; codecs=vp9'};

  recorder = new MediaRecorder(stream);

  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = e => {
    const completeBlob = new Blob(chunks, { type: chunks[0].type });
    video.src = URL.createObjectURL(completeBlob);
    video.controls = true;
    const a = document.createElement('a');
    a.href = video.src;
    a.download = 'screen_recording.webm';
    a.click();
  };

  recorder.start();
}

start.addEventListener("click", () => {
  start.setAttribute("disabled", true);
  stop.removeAttribute("disabled");

  startRecording();
});

stop.addEventListener("click", () => {
  stop.setAttribute("disabled", true);
  start.removeAttribute("disabled");

  recorder.stop();
  stream.getVideoTracks()[0].stop();
});
