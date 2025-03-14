import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { auth } from "./webpage/firebaseClient.js";

// Log-In setting.
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const popupBtn = document.getElementById('login-popup');
const dataSection = document.getElementById('data');
const body = document.body;

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
      body.style.background = 'linear-gradient(to bottom, #ffffff, #d7ebff)';
    }, 180);
  } else {
    container.style.display = 'flex';
    setTimeout(() => {
      container.classList.add('active-popup');
    }, 10)
    dataSection.style.display = 'none';
    body.style.background = 'linear-gradient(to top, #d7ebff, #ffffff)';
  }
});

// Smooth Scroll.
document.addEventListener("DOMContentLoaded", function () {
  const fadeInElements = document.querySelectorAll('.fade-in');
  const scrollToTopBtn = document.getElementById("scrollToTop");

  function checkVisibility() {
    fadeInElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("visible");
      } else {
        el.classList.remove("visible");
      }
    });

    if (window.scrollY > 300) {
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.classList.remove("show");
    }
  }

  window.addEventListener("scroll", checkVisibility);
  checkVisibility();

  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});

//part sign in sign up
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const errorMessage = document.getElementById("error-message");

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

    alert("สมัครสมาชิกเรียบร้อย");
    window.location.href = "/main/Main.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("อีเมลนี้มีคนใช้แล้ว");
    } else {
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  }
};

const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem("token", token);
    alert("ล็อคอินเรียบร้อย");
    window.location.href = "/main/Main.html";
  } catch (error) {
    alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + error.message);
  }
};

const validateKkuEmail = (email) => {
  return email.endsWith("@kkumail.com");
};

if (signupForm) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const username = document.getElementById("username").value.trim();
    
    if (!validateKkuEmail(email)) {
      errorMessage.style.display = "block";
      return;
    } else {
      errorMessage.style.display = "none";
    }
    
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

if (emailInput) {
  emailInput.addEventListener("input", function() {
    const email = emailInput.value.trim();
    if (email && !validateKkuEmail(email)) {
      errorMessage.style.display = "block";
    } else {
      errorMessage.style.display = "none";
    }
  });
}