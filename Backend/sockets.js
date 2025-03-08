const { Server } = require("socket.io");

let waitingRoom = null;

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: "https://theaquarium-proj.web.app",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    next();
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.id} in`);

    socket.on("join-random", (callback) => {
      if (waitingRoom) {
        const waitingSocket = io.sockets.sockets.get(waitingRoom.socketId);
        if (!waitingSocket) waitingRoom = null;
      }

      let roomId;
      if (!waitingRoom) {
        roomId = "room-" + Math.random().toString(36).substring(2, 10);
        socket.join(roomId);
        waitingRoom = { roomId, socketId: socket.id, createdAt: Date.now() };
        callback({ success: true, room: roomId, waiting: true, message: "waiting for partner" });
        setTimeout(() => {
          if (waitingRoom && waitingRoom.roomId === roomId) {
            io.to(roomId).emit("room-timeout", roomId);
            waitingRoom = null;
          }
        }, 60000);
      } else {
        roomId = waitingRoom.roomId;
        socket.join(roomId);
        io.to(roomId).emit("room-ready", roomId);
        callback({ success: true, room: roomId, waiting: false, message: "partner found" });
        waitingRoom = null;
      }
      console.log(`User ${socket.id} in room ${roomId}`);
    });

    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} in room ${room}`);
      const clients = io.sockets.adapter.rooms.get(room);
      if (clients && clients.size >= 2) {
         io.to(room).emit("room-ready", room);
      }
    });

    socket.on("offer", (data) => {
      socket.to(data.room).emit("offer", data);
    });

    socket.on("request-offer", (room) => {
      socket.to(room).emit("re-offer", { room });
    });

    socket.on("answer", (data) => {
      socket.to(data.room).emit("answer", {
        answer: data.answer,
        room: data.room,
        sender: socket.id,
      });
    });

    socket.on("candidate", (data) => {
      socket.to(data.room).emit("candidate", {
        candidate: data.candidate,
        room: data.room,
        sender: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.id} out`);
      if (waitingRoom && waitingRoom.socketId === socket.id) waitingRoom = null;
    });
  });
}

module.exports = { initSockets };
