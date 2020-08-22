function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
  // Good to go!
} else {
  alert('getUserMedia() is not supported by your browser');
}

const constraints = {
  audio: true
};

const audio = document.querySelector('audio');

let shouldStop = false;
let stopped = true;

const handleSuccess = function(stream) {

  const options = {mimeType: 'audio/webm'};
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }

    if(shouldStop === true && stopped === false) {
      mediaRecorder.stop();
      stopped = true;
      stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
  });

  mediaRecorder.addEventListener('stop', function() {
    sendToServer(new Blob(recordedChunks))
  });

  mediaRecorder.start(500);
};

const controlButton = document.getElementById('controlButton');
controlButton.addEventListener('click', event => {
  if(stopped){
    stopped = false;
    shouldStop = false;
    navigator.mediaDevices.getUserMedia(constraints).
      then(handleSuccess);
    controlButton.textContent = "Stop Recording!";
  }
  else{
    controlButton.textContent = "Record";
    shouldStop = true;
  }
});

function sendToServer(dataBlob){
  let fileReader = new FileReader();

  fileReader.readAsArrayBuffer(dataBlob);

  fileReader.onload = function(event) {
    let arrayBuffer = fileReader.result;
    fetch("/translate",{
      method: "POST",
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: arrayBuffer
    }).then(response => response.text()).then(text => showAnswer(text))
  }
}

const answerSection = document.getElementById('answerSection');
answerSection.hidden = true;
const answerText = document.getElementById('answerText');
function showAnswer(text){
  answerSection.hidden = false;
  answerText.textContent = text;
}


/*
navigator.mediaDevices.getUserMedia(constraints).
  then((stream) => {audio.srcObject = stream});
*/
