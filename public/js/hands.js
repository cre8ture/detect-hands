window.onload = function() {
    const threshold = 10;
    // Your code herelet model = null;
const canvas = document.getElementById('canvas');
const cursor = document.getElementById('cursor');
const overlayCanvas = document.createElement('canvas');
const canvasContainer = document.getElementById('canvasContainer');
canvasContainer.appendChild(overlayCanvas);
// overlayCanvas.width = canvas.width;
// overlayCanvas.height = canvas.height;

const overlayContext = overlayCanvas.getContext('2d');
// overlayContext.scale(-1, 1);

// overlayContext.translate(-canvas.width, 0);



const context = canvas.getContext('2d');
let previousIndexTip = [0,0]

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
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;
        overlayContext.scale(-1, 1);
        overlayContext.translate(-overlayCanvas.width, 0);
        

        canvas.color = 'khaki';
        // Start detecting hands when video is ready
        
        console.log('Video size:', video.videoWidth, video.videoHeight);
        detectHands(video);
      };
    });
}

let animId;
loadModelAndStartVideo();
async function detectHands(video) {
    if (model) {
      const predictions = await model.estimateHands(video);
      if (predictions.length > 0) {
        for (let i = 0; i < predictions.length; i++) {
          const keypoints = predictions[i].landmarks;
          // Draw the keypoints on the canvas
          context.clearRect(0, 0, canvas.width, canvas.height);
          keypoints.forEach((point, index) => {

            const thumbTip = keypoints[4];
            const indexTip = keypoints[8];
            const middleTip = keypoints[12];
            const ringTip = keypoints[16];
            const pinkyTip = keypoints[20];
            
            const thumbMCP = keypoints[1];
            const indexMCP = keypoints[5];
            const middleMCP = keypoints[9];
            const ringMCP = keypoints[13];
            const pinkyMCP = keypoints[17];
            if (
              thumbTip[1] > thumbMCP[1] &&
              indexTip[1] > indexMCP[1] &&
              middleTip[1] > middleMCP[1] &&
              ringTip[1] > ringMCP[1] &&
              pinkyTip[1] > pinkyMCP[1]
            ) {
              // console.log('User is making a fist');
            }

            
            const threshold = 60; // Adjust this value based on your requirements
            console.log("thumbTip[0], pinkyTip[0]",thumbTip[0], pinkyTip[0])
            if (Math.abs(thumbTip[0] - pinkyTip[0]) < threshold) {
              console.log('Hand is sideways');
              overlayContext.globalCompositeOperation = 'destination-out';
              // overlayContext.beginPath();
              // overlayContext.moveTo(previousIndexTip[0], previousIndexTip[1]);
              // overlayContext.lineTo(indexTip[0], indexTip[1]);
              // overlayContext.stroke();
              overlayContext.globalCompositeOperation = 'source-over';
            } else {
              console.log('Hand is facing the camera');
              // Hand is facing the camera, draw
              overlayContext.beginPath();
              overlayContext.moveTo(previousIndexTip[0], previousIndexTip[1]); // previousIndexTip needs to be stored from the last frame
              overlayContext.lineTo(indexTip[0], indexTip[1]);
              overlayContext.stroke();
            }

            // Store the current index tip position for the next frame
          previousIndexTip = indexTip;

if (indexTip[1] < indexMCP[1]) {
  // console.log('Index finger is pointing up');
}


// Inside your keypoints.forEach loop:
cursor.style.left = `${indexTip[0]}px`;
cursor.style.top = `${indexTip[1]}px`;

// if (indexTip[1] < middleTip[1] - threshold) {
//   console.log('Pointing with one finger');
// } else if (Math.abs(indexTip[1] - middleTip[1]) < threshold) {
//   console.log('Pointing with two fingers');
// }
            context.beginPath();
            context.arc(point[0], point[1], 5, 0, 2 * Math.PI); // draw a circle at each keypoint location
            context.fillStyle = 'red';
            context.fill();
          });

        
        }
      }
  
      // Call detectHands again on the next frame
      requestAnimationFrame(() => detectHands(video));
    }
  }
}