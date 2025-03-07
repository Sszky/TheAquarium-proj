import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { auth } from "./firebaseClient.js";

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const popupBtn = document.getElementById('login-popup');
const dataSection = document.getElementById('data');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

popupBtn.addEventListener('click', () => {
    const isLoginActive = container.classList.contains('active-popup');

    if (isLoginActive) {
        container.classList.remove('active-popup');
        setTimeout(() => {
            container.style.display = 'none';
            dataSection.style.display = 'block';
        }, 180);
    } else {
        container.style.display = 'flex';
        setTimeout(() => {
            container.classList.add('active-popup');
        }, 10);
        dataSection.style.display = 'none';
    }
});

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");

const registerUser = async (email, password, username) => {
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid;

      await fetch("https://webrtc-deploy.onrender.com/api/auth/register", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ uid, email, username })
      });

      alert("สมัครสมาชิกสำเร็จ!");
      window.location.href = "./LoginPage.html";
  } catch (error) {
      if (error.code === "auth/email-already-in-use") {
          alert("อีเมลนี้ถูกใช้แล้ว กรุณาใช้ Login หรือสมัครด้วยอีเมลอื่น");
      } else {
          alert("เกิดข้อผิดพลาด: " + error.message);
      }
  }
};


const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem("token", token);
    alert("Login correct");
    window.location.href = "../main/Main.html";
};

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const username = document.getElementById("username").value.trim();
        if (!email.endsWith("@kkumail.com")) return;
        registerUser(email, password, username);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;
        loginUser(email, password);
    });
}