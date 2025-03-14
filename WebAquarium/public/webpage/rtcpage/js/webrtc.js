import { SIGNALING_SERVER_URL, ICE_SERVERS } from './config.js';

const room = sessionStorage.getItem("room");
const isCaller = sessionStorage.getItem("isCaller") === "true";

const socket = io(SIGNALING_SERVER_URL, { 
  transports: ["websocket"],
  reconnection: true, 
  reconnectionAttempts: 5, 
  reconnectionDelay: 1000 
});

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const localPlaceholder = document.getElementById("localPlaceholder");
const remotePlaceholder = document.getElementById("remotePlaceholder");
const hangUpCallButton = document.getElementById("hangUpCall");
const toggleCameraButton = document.getElementById("toggleCamera");
const nextCallButton = document.getElementById("nextCall");

let localStream = null;
let peerConnection = null;
let cameraOn = true;
let dataChannel = null;

const configuration = { iceServers: ICE_SERVERS };

let selectedCharacterData = null;
try {
  const savedCharacter = localStorage.getItem("selectedCharacter");
  if (savedCharacter) {
    selectedCharacterData = JSON.parse(savedCharacter);
    console.log("ตัวละครที่เลือก:", selectedCharacterData);
    
    if (selectedCharacterData && selectedCharacterData.gifSrc) {
      selectedCharacterData.gifSrc = selectedCharacterData.gifSrc.replace(/^(?:\.\.\/)*/, "../../../");
      
      const localCharacterImg = document.getElementById("localCharacterImg");
      if (localCharacterImg) {
        localCharacterImg.src = selectedCharacterData.gifSrc;
      }
    }
    
    const remoteCharacterImg = document.getElementById("remoteCharacterImg");
    if (remoteCharacterImg) {
      remoteCharacterImg.src = "../../../logo/Jelly.gif";
    }
  }
} catch (e) {
  console.error("ไม่สามารถดึงข้อมูลตัวละคร:", e);
}

socket.on("connect", () => {
  console.log("เชื่อมต่อแล้ว:", socket.id);
  if (room) {
    socket.emit("join-room", room);
  } else {
    console.error("ไม่มีห้อง!");
  }
});

socket.on("reconnect", () => {
  console.log("เชื่อมต่อใหม่แล้ว");
  if (room) {
    socket.emit("join-room", room);
    if (isCaller) {
      console.log("ผู้โทร: ส่ง offer ใหม่");
      setTimeout(() => {
        startCall();
      }, 500);
    }
  }
});

socket.on("connect_error", (error) => {
  console.error("ผิดพลาดเชื่อมต่อ:", error.message);
});

socket.on("disconnect", () => {
  console.log("ตัดการเชื่อมต่อ");
});

socket.on("offer", async (data) => {
  console.log("ได้รับ offer");
  if (!data || !data.offer) {
    console.log("ไม่มี offer, ขอใหม่");
    socket.emit("request-offer", data.room);
    return;
  }
  if (!peerConnection) createPeerConnection();
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { answer, room: data.room });
    console.log("ส่ง answer");
  } catch (error) {
    console.error("รับ offer ผิดพลาด:", error);
  }
});

socket.on("answer", async (data) => {
  console.log("ได้รับ answer");
  if (!peerConnection) createPeerConnection();
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  } catch (error) {
    console.error("รับ answer ผิดพลาด:", error);
  }
});

socket.on("candidate", async (data) => {
  console.log("ได้รับ candidate");
  try {
    if (!peerConnection) createPeerConnection();
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    console.log("เพิ่ม candidate แล้ว");
  } catch (e) {
    console.error("candidate ผิดพลาด:", e);
  }
});

socket.on("re-offer", async (data) => {
  console.log("ขอ offer ใหม่");
  if (isCaller) {
    if (!peerConnection || peerConnection.connectionState === "disconnected" || peerConnection.iceConnectionState === "disconnected") {
      console.log("connection ขัดข้อง, เริ่มใหม่");
      reinitializeCall();
    } else {
      console.log("ส่ง offer ใหม่");
      await startCall();
    }
  }
});

async function initMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 } },
      audio: { echoCancellation: true, noiseSuppression: true }
    });
    
    localStream.getVideoTracks().forEach(track => track.enabled = false);
    cameraOn = false;
    toggleCameraButton.innerText = "Turn Camera On";
    
    localVideo.srcObject = localStream;
    
    localPlaceholder.style.display = "block";
    
    console.log("สื่อพร้อม");
    
    if (isCaller) {
      startCall();
    }
  } catch (error) {
    console.error("เข้าถึงสื่อไม่ได้:", error);
    alert("เข้าถึงกล้องหรือไมค์ไม่ได้: " + error.message);
  }
  
  const localCharacterImg = document.getElementById("localCharacterImg");
  const remoteCharacterImg = document.getElementById("remoteCharacterImg");

  if (localCharacterImg && (!localCharacterImg.src || localCharacterImg.src === "")) {
    localCharacterImg.src = "../../../logo/Jelly.gif";
  }

  if (remoteCharacterImg && (!remoteCharacterImg.src || remoteCharacterImg.src === "")) {
    remoteCharacterImg.src = "../../../logo/Jelly.gif";
  }
}

function createPeerConnection() {
  try {
    peerConnection = new RTCPeerConnection(configuration);
    
    if (isCaller) {
      dataChannel = peerConnection.createDataChannel("cameraState");
      setupDataChannel(dataChannel);
    } else {
      peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
      };
    }
    
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && room) {
        socket.emit("candidate", { candidate: event.candidate, room });
        console.log("ส่ง candidate");
      }
    };
    
    peerConnection.ontrack = (event) => {
      remoteVideo.srcObject = event.streams[0];
      console.log("รับสตรีมจากอีกฝั่ง");
    };
    
    hangUpCallButton.disabled = false;
    
    console.log("สร้าง connection แล้ว");
  } catch (error) {
    console.error("สร้าง connection ผิดพลาด:", error);
  }
}

function setupDataChannel(channel) {
  if (!channel) return;
  
  channel.onopen = () => {
    console.log("Data channel เปิดแล้ว");
    sendCameraState(cameraOn);
  };
  
  channel.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("ได้รับข้อมูล:", data);
      
      if (data.type === 'camera') {
        console.log("ได้รับสถานะกล้อง:", data.enabled);
        
        const remotePlaceholder = document.getElementById("remotePlaceholder");
        if (remotePlaceholder) {
          remotePlaceholder.style.display = data.enabled ? "none" : "block";
          
          if (data.character && data.character.gifSrc) {
            const remoteCharacterImg = document.getElementById("remoteCharacterImg");
            if (remoteCharacterImg) {
              remoteCharacterImg.src = data.character.gifSrc;
            }
          }
        }
      }
    } catch (e) {
      console.error("รับข้อมูลผิดพลาด:", e);
    }
  };
  
  channel.onerror = (error) => {
    console.error("Data channel ผิดพลาด:", error);
  };
  
  channel.onclose = () => {
    console.log("Data channel ปิดแล้ว");
  };
}

function sendCameraState(isEnabled) {
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(JSON.stringify({
      type: 'camera',
      enabled: isEnabled,
      character: selectedCharacterData
    }));
    console.log("ส่งสถานะกล้อง:", isEnabled);
  }
}

function reinitializeCall() {
  console.log("เริ่ม connection ใหม่");
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  dataChannel = null;
  createPeerConnection();
  startCall();
}

async function startCall() {
  if (!room) {
    console.error("ไม่พบห้อง");
    alert("ไม่พบห้อง");
    return;
  }
  
  if (!peerConnection) {
    createPeerConnection();
  }
  
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { offer, room });
    console.log("โทรแล้ว");
  } catch (error) {
    console.error("เริ่มโทรผิดพลาด:", error);
  }
}

function cleanupCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }
  if (socket && socket.connected) {
    socket.disconnect();
  }
  sessionStorage.clear();
  console.log("ล้างสถานะเรียบร้อย");
}

toggleCameraButton.onclick = () => {
  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      cameraOn = track.enabled;
      toggleCameraButton.innerText = cameraOn ? "Turn Camera Off" : "Turn Camera On";
      
      const localPlaceholder = document.getElementById("localPlaceholder");
      if (localPlaceholder) {
        localPlaceholder.style.display = cameraOn ? "none" : "block";
      }
      
      sendCameraState(cameraOn);
      
      console.log("สลับกล้อง:", track.enabled);
    });
  }
};

nextCallButton.onclick = () => {
  cleanupCall();
  window.location.href = "../pages/pairing.html";
};

hangUpCallButton.onclick = () => {
  cleanupCall();
  remoteVideo.srcObject = null;
  hangUpCallButton.disabled = true;
  console.log("จบสาย");
  window.location.href = "../../../main/Main.html";
};

setTimeout(() => {
  if (!peerConnection || !peerConnection.remoteDescription) {
    console.log("ไม่ได้รับ offer, ขอใหม่");
    socket.emit("request-offer", room);
  }
}, 5000);

initMedia();