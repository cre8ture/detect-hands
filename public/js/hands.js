window.onload = function() {
    const threshold = 10;
    // Your code herelet model = null;
const canvas = document.getElementById('canvas');

const context = canvas.getContext('2d');

async function loadModelAndStartVideo() {
  model = await handpose.load();
  console.log('Handpose model loaded');

  // Assuming you have a video element with id 'remoteVideo'
  const video = document.getElementById('remoteVideo');

  // Start video stream
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();

        // Set the canvas size to match the video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.color = 'khaki';
        // Start detecting hands when video is ready
        
        console.log('Video size:', video.videoWidth, video.videoHeight);
console.log('Canvas size:', canvas.width, canvas.height);
        detectHands(video);
      };
    });
}

let animId;
loadModelAndStartVideo();
async function detectHands(video) {
    console.log('detectHands');
    if (model) {
      console.log('model');
      const predictions = await model.estimateHands(video);
      console.log('predictions', predictions);
      if (predictions.length > 0) {
        console.log('Predictions: ', predictions);
        for (let i = 0; i < predictions.length; i++) {
          const keypoints = predictions[i].landmarks;
          console.log('Keypoints: ', keypoints);
          // Draw the keypoints on the canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          keypoints.forEach((point, index) => {

            const indexTip = keypoints[6];
const middleTip = keypoints[9];

if (indexTip[1] < middleTip[1] - threshold) {
  console.log('Pointing with one finger');
} else if (Math.abs(indexTip[1] - middleTip[1]) < threshold) {
  console.log('Pointing with two fingers');
}
            context.beginPath();
            context.arc(point[0], point[1], 5, 0, 2 * Math.PI); // draw a circle at each keypoint location
            context.fillStyle = 'red';
            context.fill();
            // if (index > 0) { // draw a line to the previous point
            //     context.lineTo(keypoints[index - 1][0], keypoints[index - 1][1]);
            //     context.fillStyle = 'red';
            //     context.fill();
            //     context.strokeStyle = 'red';
            //     context.stroke();
            //   }
          });

        
        }
      }
  
      // Call detectHands again on the next frame
      requestAnimationFrame(() => detectHands(video));
    }
  }
}