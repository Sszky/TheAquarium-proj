import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAgCAO09vY6nrfHrEzXhWchJWJlqgw5b8M",
  authDomain: "theaquarium-proj.firebaseapp.com",
  projectId: "theaquarium-proj",
  messagingSenderId: "911351328803",
  appId: "1:911351328803:web:f5e680a43a3650f577c196",
  measurementId: "G-0XQ3C2C5K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
