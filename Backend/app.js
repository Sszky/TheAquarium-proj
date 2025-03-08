require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const admin = require("./config/firebaseAdmin");
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors({
  origin: ["https://theaquarium-proj.web.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB ok"))
  .catch((err) => console.error("DB error:", err));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

module.exports = app;
