const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
  host: '/',
  path:'/peerserver',
  port: '3000',
  headers :{
    "Host":"headers-inspect.com",
    "Connection":"keep-alive, Upgrade",
    "Upgrade":"websocket"
  },
})


let Videocontroller;
let callend;

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
peers.name=prompt("Enter Your Name:-");


var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;



navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  Videocontroller=stream

  addVideoStream(myVideo, stream)

  myPeer.on('call', (call) => {
  
    call.answer(stream);
    
    const video = document.createElement('video')
  
    
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });

  })

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream)
  })
});


myPeer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); 
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser=(userId, stream)=>{

  const call = myPeer.call(userId, stream)

  const video = document.createElement('video')
  

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })

  call.on('close', () => {
    video.remove()
  })
  
  peers[userId] = call
}



function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
 
  videoGrid.append(video)
 
}

const leave=()=>{
  
}



const muteUnmute = () => {
  const enabled = Videocontroller.getAudioTracks()[0].enabled;
  if (enabled) {
    Videocontroller.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    Videocontroller.getAudioTracks()[0].enabled = true;
  }
};


const StopPlay = () => {
  let enabled = Videocontroller.getVideoTracks()[0].enabled;
  if (enabled) {
    Videocontroller.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    Videocontroller.getVideoTracks()[0].enabled = true;
  }
};


const setPlayVideo = () => {
  console.log("pause")
  const html = `<i class="fa fa-video-slash"></i>`;
  document.getElementById("playicon").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class="fa fa-video"></i>`;
  document.getElementById("playicon").innerHTML = html;
};


const setUnmuteButton = () => {
  const html = `<i class="fa fa-microphone-slash"></i>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>`;
  document.getElementById("muteButton").innerHTML = html;
};



const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')



socket.emit('new-user', peers.name)


socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  
})

socket.on('user-disconnected', name => {
 
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You :  ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}
