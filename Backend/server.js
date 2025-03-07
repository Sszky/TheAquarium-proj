require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: ["https://theaquarium-proj.web.app"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));

const admin = require("./config/firebaseAdmin");
const User = require("./models/User");
const authRoutes = require("./routes/auth");

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB ถูก"))
    .catch((err) => console.error("Error connecting MongoDB:", err));

const verifyFirebaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "โทเคน error" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch {
        res.status(403).json({ message: "โทเคน error" });
    }
};

app.use("/api/auth", authRoutes);

app.get("/protected", verifyFirebaseToken, async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
        return res.status(404).json({ message: "User error" });
    }
    res.status(200).json({ message: "Access granted.", user });
});

app.get("/test-firebase", async (req, res) => {
    const users = await admin.auth().listUsers();
    res.json({ message: "firebase success", totalUsers: users.users.length });
});

app.get("/api/users", verifyFirebaseToken, async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

app.get("/api/users/:uid", verifyFirebaseToken, async (req, res) => {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
        return res.status(404).json({ message: "User error" });
    }
    res.status(200).json(user);
});

app.get("/", (req, res) => {
    res.send("Server running");
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

io.use((socket, next) => {
    console.log(`[Socket.io] A new client connected: ${socket.id}`);
    next();
});

let waitingRoom = null;

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-random", (callback) => {
        if (!waitingRoom) {
            const roomId = "room-" + Math.random().toString(36).substring(2, 10);
            socket.join(roomId);
            waitingRoom = { roomId: roomId, socketId: socket.id, createdAt: Date.now() };
            console.log(`User ${socket.id} created waiting room ${roomId}`);
            callback({ success: true, room: roomId, waiting: true, message: "Waiting for a partner..." });
            setTimeout(() => {
                if (waitingRoom && waitingRoom.roomId === roomId) {
                    console.log(`Waiting room ${roomId} timed out, no partner joined.`);
                    io.to(roomId).emit("room-timeout", roomId);
                    waitingRoom = null;
                }
            }, 60000);
        } else {
            const roomId = waitingRoom.roomId;
            socket.join(roomId);
            console.log(`User ${socket.id} joined waiting room ${roomId}`);
            io.to(roomId).emit("room-ready", roomId);
            callback({ success: true, room: roomId, waiting: false, message: "Partner found. Room is ready." });
            waitingRoom = null;
        }
    });

    socket.on("offer", (data) => {
        socket.to(data.room).emit("offer", {
            offer: data.offer,
            room: data.room,
            sender: socket.id
        });
    });

    socket.on("answer", (data) => {
        socket.to(data.room).emit("answer", {
            answer: data.answer,
            room: data.room,
            sender: socket.id
        });
    });

    socket.on("candidate", (data) => {
        socket.to(data.room).emit("candidate", {
            candidate: data.candidate,
            room: data.room,
            sender: socket.id
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (waitingRoom && waitingRoom.socketId === socket.id) {
            console.log(`Waiting room ${waitingRoom.roomId} cleared due to disconnect.`);
            waitingRoom = null;
        }
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));