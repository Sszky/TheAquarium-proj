const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const popupBtn = document.getElementById('login-popup');
const dataSection = document.getElementById('data');

registerBtn.addEventListener('click', () =>{
  container.classList.add("active");
});

loginBtn.addEventListener('click', () =>{
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
    }, 10)
    dataSection.style.display = 'none';
  }
});


//ใส่เพิ่ม อันนี้เป็นโค้ดที่จะเช็คว่า ผู้ใช้ ได้ใช้ kkumail ในการ SignUP ไหม
document.addEventListener("DOMContentLoaded", function() {
  const signupForm = document.getElementById("signupForm");
  const emailInput = document.getElementById("email");
  const errorMessage = document.getElementById("error-message");

  signupForm.addEventListener("submit", function(event) {
      event.preventDefault();
      
      if (!emailInput.value.endsWith("@kkumail.com")) {
          errorMessage.style.display = "block";
          return;
      }
      
      errorMessage.style.display = "none";
      console.log("Form submitted successfully");
      // เอาไว้ส่งข้อมูลไฟเซิฟเวอร์
  });
});

