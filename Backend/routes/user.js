const express = require("express");
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

router.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      uid: user.uid,
      username: user.username,
      email: user.email,
      lastActive: user.lastActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/update-profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({ username, uid: { $ne: uid } });
    if (existingUser) {
      return res.status(400).json({ message: "Username ซ้ำ" });
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { username, lastActive: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;