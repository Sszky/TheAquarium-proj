import { SIGNALING_SERVER_URL } from './config.js';

let socket = null;
let room = null;
let isCaller = false;
let pairingActive = false;

const statusMessage = document.getElementById("statusMessage");
const spinner = document.getElementById("spinner");
const actionButton = document.getElementById("actionButton");

function startPairing() {
  socket = io(SIGNALING_SERVER_URL, { transports: ["websocket"] });
  pairingActive = true;
  statusMessage.innerText = "โปรดรอสักครู่ ระบบกำลังค้นหาคู่ให้คุณ...";
  actionButton.innerText = "ยกเลิก";
  spinner.style.display = "block";
  spinner.style.animation = "spin 1s linear infinite";
  statusMessage.classList.remove("paired");

  socket.emit("join-random", (response) => {
    if (response.success) {
      room = response.room;
      if (response.waiting) {
        isCaller = true;
        console.log("รออยู่ในห้อง:", room);
      } else {
        isCaller = false;
        console.log("เจอคู่แล้วในห้อง:", room);
        redirectToCall();
      }
    } else {
      console.error("จับคู่ล้มเหลว:", response.message);
      alert("เกิดข้อผิดพลาดในการจับคู่: " + response.message);
    }
  });

  socket.on("room-ready", (roomId) => {
    if (roomId === room) {
      console.log("ห้องพร้อม:", roomId);
      statusMessage.innerText = "จับคู่สำเร็จ! กำลังเชื่อมต่อ...";
      statusMessage.classList.add("paired");
      spinner.style.animation = "fadeOut 1s forwards";
      setTimeout(() => {
        redirectToCall();
      }, 1500);
    }
  });

  socket.on("room-timeout", (roomId) => {
    if (roomId === room) {
      statusMessage.innerText = "จับคู่ไม่ได้ในเวลาที่กำหนด กรุณาลองใหม่อีกครั้ง";
      spinner.style.animation = "fadeOut 1s forwards";
      actionButton.innerText = "เริ่มใหม่";
      pairingActive = false;
    }
  });
}

function redirectToCall() {
  sessionStorage.setItem("room", room);
  sessionStorage.setItem("isCaller", isCaller);
  window.location.href = "../pages/webRTC.html";
}

function cancelPairing() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  pairingActive = false;
  room = null;
  isCaller = false;
  statusMessage.innerText = "จับคู่ถูกยกเลิกแล้ว";
  spinner.style.display = "none";
  actionButton.innerText = "เริ่ม";
}

startPairing();

actionButton.onclick = () => {
  if (pairingActive) {
    cancelPairing();
  } else {
    startPairing();
  }
};
