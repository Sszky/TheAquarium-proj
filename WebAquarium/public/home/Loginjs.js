// Log-In setting.
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const popupBtn = document.getElementById('login-popup');
const dataSection = document.getElementById('data');
const body = document.body;

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