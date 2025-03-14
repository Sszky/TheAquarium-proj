import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { auth } from "../../firebaseClient.js";

export const checkAuthState = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve({
          isLoggedIn: true,
          user: user
        });
      } else {
        resolve({
          isLoggedIn: false,
          user: null
        });
      }
    });
  });
};

export const verifyToken = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    const response = await fetch("https://webrtc-deploy.onrender.com/api/auth/verify", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
};

export const isUserLoggedIn = async () => {
  const authState = await checkAuthState();
  if (!authState.isLoggedIn) {
    return false;
  }

  return await verifyToken();
};

export const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await fetch("https://webrtc-deploy.onrender.com/api/user/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const setupUIForAuthState = async () => {
  const loggedIn = await isUserLoggedIn();
  const elements = document.querySelectorAll('.auth-required');
  const guestElements = document.querySelectorAll('.guest-only');
  const profileDisplay = document.getElementById('profileAuthStatus');

  if (loggedIn) {
    elements.forEach(el => el.classList.remove('hidden'));
    guestElements.forEach(el => el.classList.add('hidden'));

    if (profileDisplay) {
      profileDisplay.textContent = '';
      profileDisplay.classList.remove('text-red-500');

      const userData = await getUserData();
      if (userData) {
        const usernameEl = document.getElementById('account');
        if (usernameEl) {
          usernameEl.value = userData.username || '';
        }
      }
    }
  } else {
    elements.forEach(el => el.classList.add('hidden'));
    guestElements.forEach(el => el.classList.remove('hidden'));

    if (profileDisplay) {
      profileDisplay.textContent = 'กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้';
      profileDisplay.classList.add('text-red-500');
    }
  }
};