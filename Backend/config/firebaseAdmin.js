const admin = require("firebase-admin");
const serviceAccount = require("./theaquarium-proj-firebase-adminsdk-fbsvc-0a3523cfdd.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
