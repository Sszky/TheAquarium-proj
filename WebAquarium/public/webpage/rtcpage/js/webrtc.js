const signalingServerUrl = "https://webrtc-deploy.onrender.com";
const socket = io(signalingServerUrl, { transports: ["websocket"] });

const room = sessionStorage.getItem("room");
const isCaller = sessionStorage.getItem("isCaller") === "true";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const localPlaceholder = document.getElementById("localPlaceholder");
const remotePlaceholder = document.getElementById("remotePlaceholder");
const hangUpCallButton = document.getElementById("hangUpCall");
const toggleCameraButton = document.getElementById("toggleCamera");
const nextCallButton = document.getElementById("nextCall");

let localStream = null;
let peerConnection = null;
let cameraOn = false;

const configuration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

// Function to update placeholder visibility
function updatePlaceholderVisibility() {
    if (localStream) {
        // Check if video tracks are enabled
        const videoEnabled = localStream.getVideoTracks().some(track => track.enabled);
        
        // Show/hide local placeholder based on video state
        if (videoEnabled) {
            localPlaceholder.style.display = "none";
        } else {
            localPlaceholder.style.display = "flex";
        }
    }
    
    // For remote video, check if there's a stream
    if (remoteVideo.srcObject) {
        remotePlaceholder.style.display = "none";
    } else {
        remotePlaceholder.style.display = "flex";
    }
}

async function initMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });
        
        // Initially disable video tracks
        localStream.getVideoTracks().forEach(track => {
            track.enabled = false;
        });
        
        toggleCameraButton.innerText = "Turn Camera On";
        localVideo.srcObject = localStream;
        
        // Initial update of placeholder visibility
        updatePlaceholderVisibility();

        if (isCaller) {
            startCall();
        }
    } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not access camera or microphone.");
    }
}
initMedia();

function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate && room) {
            socket.emit("candidate", { candidate: event.candidate, room: room });
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
        // Update placeholder visibility when remote track is added
        updatePlaceholderVisibility();
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", peerConnection.iceConnectionState);
        // If connection is disconnected or failed, show remote placeholder
        if (["disconnected", "failed", "closed"].includes(peerConnection.iceConnectionState)) {
            remoteVideo.srcObject = null;
            updatePlaceholderVisibility();
        }
    };

    hangUpCallButton.disabled = false;
}

async function startCall() {
    if (!room) {
        alert("Room not found.");
        return;
    }
    if (!peerConnection) {
        createPeerConnection();
    }
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { offer: offer, room: room });
}

socket.on("offer", async (data) => {
    if (!peerConnection) {
        createPeerConnection();
    }
    console.log("Received offer:", data.offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { answer: answer, room: room });
});

socket.on("answer", async (data) => {
    console.log("Received answer:", data.answer);
    if (!peerConnection) {
        createPeerConnection();
    }
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
});

socket.on("candidate", async (data) => {
    try {
        if (!peerConnection) {
            createPeerConnection();
        }
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log("Added ICE candidate:", data.candidate);
    } catch (e) {
        console.error("Error adding received ICE candidate", e);
    }
});

toggleCameraButton.onclick = () => {
    if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            cameraOn = track.enabled;
            toggleCameraButton.innerText = cameraOn ? "Turn Camera Off" : "Turn Camera On";
        });
        // Update placeholder visibility when camera is toggled
        updatePlaceholderVisibility();
    }
};

nextCallButton.onclick = () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    socket.disconnect();
    sessionStorage.removeItem("room");
    sessionStorage.removeItem("isCaller");
    window.location.href = "random.html";
};

function cleanupCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (socket && socket.connected) {
        socket.disconnect();
    }
    remoteVideo.srcObject = null;
    // Update placeholder visibility
    updatePlaceholderVisibility();
    sessionStorage.clear();
    console.log("Call state cleaned up.");
}

nextCallButton.onclick = () => {
    cleanupCall();
    window.location.href = "random.html";
};

hangUpCallButton.onclick = () => {
    cleanupCall();
    hangUpCallButton.disabled = true;
    console.log("Call ended and cleaned up.");
    window.location.href = "/TheAquarium-proj/WebAquarium/public/main/Main.html";
};