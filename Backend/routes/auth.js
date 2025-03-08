const express = require("express");
const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

const router = express.Router();

const verifyFirebaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid Token" });
    }
};

router.post("/register", async (req, res) => {
    try {
        const { username, email, uid } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ message: "Missing uid or email" });
        }

        console.log("บั๊ค", { uid, email, username });

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username ซ้ำ" });
        }

        const newUser = new User({
            uid,
            username,
            email,
            lastActive: new Date()
        });

        await newUser.save();
        res.status(201).json({ message: "สมัครเสร็จ", user: newUser });
    } catch (error) {
        console.error("error", error);
        res.status(500).json({ message: "server error" });
    }
});

router.post("/login", verifyFirebaseToken, async (req, res) => {
    try {
        const { uid, email } = req.user;
        let user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.lastActive = new Date();
        await user.save();

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "servwe error" });
    }
});

module.exports = router;