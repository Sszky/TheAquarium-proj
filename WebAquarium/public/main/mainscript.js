import { setupUIForAuthState, isUserLoggedIn, getUserData } from "../webpage/rtcpage/js/authUtils.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

const swimTab = document.getElementById("swimTab");
const tagTab = document.getElementById("tagTab");
const swimContent = document.getElementById("swimContent");
const tagContent = document.getElementById("tagContent");
const startButton = document.getElementById("startButton");

const profileIcon = document.getElementById("profileIcon");
const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const saveProfileButton = document.getElementById("saveProfileButton");
const logoutButton = document.getElementById("logoutButton");
let userLoggedIn = false;

document.addEventListener("DOMContentLoaded", async () => {
  const profileCard = document.querySelector(".profile-card");
  if (profileCard) {
    if (!document.getElementById("profileAuthStatus")) {
      const statusElement = document.createElement("p");
      statusElement.id = "profileAuthStatus";
      statusElement.className = "mt-2 text-center";
      profileCard.insertBefore(statusElement, profileCard.querySelector("button"));
    }
  }

  await setupUIForAuthState();

  userLoggedIn = await isUserLoggedIn();

  if (userLoggedIn) {
    const userData = await getUserData();
    if (userData && document.getElementById("account")) {
      document.getElementById("account").value = userData.username;
    }
  }
});

swimTab.addEventListener("click", () => {
  swimTab.classList.add("tab-active");
  tagTab.classList.remove("tab-active");
  swimContent.classList.remove("hidden");
  tagContent.classList.add("hidden");
});

tagTab.addEventListener("click", () => {
  tagTab.classList.add("tab-active");
  swimTab.classList.remove("tab-active");
  tagContent.classList.remove("hidden");
  swimContent.classList.add("hidden");
});

startButton.addEventListener("click", async () => {
  userLoggedIn = await isUserLoggedIn();

  if (userLoggedIn) {
    window.location.href = "../webpage/rtcpage/pages/pairing.html";
  } else {
    const confirmed = confirm("คุณยังไม่ได้เข้าสู่ระบบ ต้องการเข้าสู่ระบบก่อนหรือไม่? (ถ้าไม่ คุณจะไม่สามารถบันทึกการสนทนาและข้อมูลได้)");
    if (confirmed) {
      window.location.href = "../index.html";
    } else {
      window.location.href = "../webpage/rtcpage/pages/pairing.html";
    }
  }
});

profileIcon.addEventListener("click", async (e) => {
  e.stopPropagation();

  await setupUIForAuthState();

  profileModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
});

closeProfileModal.addEventListener("click", () => {
  profileModal.classList.add("hidden");
  document.body.style.overflow = "";
});

window.addEventListener("click", (event) => {
  if (event.target === profileModal) {
    profileModal.classList.add("hidden");
    document.body.style.overflow = "";
  }
});

const profileCard = document.querySelector(".profile-card");
if (profileCard) {
  profileCard.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

saveProfileButton.addEventListener("click", async () => {
  const accountName = document.getElementById("account").value;

  if (!(await isUserLoggedIn())) {
    alert("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");
    return;
  }

  if (accountName.trim() !== "") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://webrtc-deploy.onrender.com/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username: accountName })
      });

      if (response.ok) {
        alert("บันทึกข้อมูลเรียบร้อย");
        profileModal.classList.add("hidden");
        document.body.style.overflow = "";
      } else {
        const error = await response.json();
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  } else {
    alert("กรุณาระบุชื่อบัญชี");
  }
});

logoutButton.addEventListener("click", async () => {
  if (await isUserLoggedIn()) {
    localStorage.removeItem("token");
    const auth = getAuth();
    await signOut(auth);
    alert("ออกจากระบบเรียบร้อย");
    window.location.href = "../index.html";
  } else {
    alert("คุณยังไม่ได้เข้าสู่ระบบ");
  }
  profileModal.classList.add("hidden");
  document.body.style.overflow = "";
});

const characterIcons = document.querySelectorAll(".character-icon");
const selectedCharacter = document.getElementById("selectedCharacter");

if (selectedCharacter) {
  selectedCharacter.src = "logo/Jelly1.gif";
  selectedCharacter.style.width = "150px";
  selectedCharacter.style.height = "150px";
}

characterIcons.forEach((icon) => {
  const originalSrc = icon.src;
  const hoverSrc = icon.getAttribute("data-hover-src");

  icon.addEventListener("mouseenter", () => {
    if (hoverSrc) {
      icon.src = hoverSrc;
    }
  });

  icon.addEventListener("mouseleave", () => {
    icon.src = originalSrc;
  });

  icon.addEventListener("click", () => {
    console.log("Character clicked:", icon.dataset.character);

    const characterData = {
      type: icon.dataset.character,
      name: icon.alt,
      gifSrc: icon.getAttribute("data-hover-src")
    };

    localStorage.setItem("selectedCharacter", JSON.stringify(characterData));
    console.log("Character saved:", characterData);

    if (selectedCharacter) {
      selectedCharacter.src = characterData.gifSrc;
      selectedCharacter.alt = characterData.name;
      selectedCharacter.style.width = "150px";
      selectedCharacter.style.height = "150px";
    }

    characterIcons.forEach((c) => (c.style.border = ""));
    icon.style.border = "3px solid #272A7B";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  if (characterIcons.length > 0) {
    characterIcons[0].click();
  }

  const tagSearchInput = document.getElementById("tagSearchInput");
  const addTagButton = document.getElementById("addTagButton");
  const selectedTagsContainer = document.getElementById("selectedTags");
  const suggestedTags = document.querySelectorAll(".tag-item");
  const saveButton = document.getElementById("savetagbutton");

  let selectedTags = [];

  function addTag(tagText) {
    if (!tagText || !tagText.trim() || selectedTags.includes(tagText.trim())) return;

    selectedTags.push(tagText.trim());

    const tagElement = document.createElement("div");
    tagElement.className = "tag-item selected-tag";
    tagElement.innerHTML = `${tagText} <span class="remove-tag">×</span>`;

    tagElement.querySelector(".remove-tag").addEventListener("click", function () {
      selectedTags = selectedTags.filter((tag) => tag !== tagText.trim());
      tagElement.remove();
      updateSaveButton();
    });

    selectedTagsContainer.appendChild(tagElement);
    tagSearchInput.value = "";
    updateSaveButton();
  }

  function updateSaveButton() {
    if (saveButton) {
      saveButton.textContent = selectedTags.length > 0 ? `Explore ${selectedTags.length} Tags` : "Save";
    }
  }

  if (addTagButton) {
    addTagButton.addEventListener("click", function () {
      const tagText = tagSearchInput.value;
      addTag(tagText.startsWith("#") ? tagText : `#${tagText}`);
    });
  }

  if (tagSearchInput) {
    tagSearchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const tagText = tagSearchInput.value;
        addTag(tagText.startsWith("#") ? tagText : `#${tagText}`);
      }
    });
  }

  if (suggestedTags) {
    suggestedTags.forEach((tag) => {
      tag.addEventListener("click", function () {
        addTag(tag.textContent);
      });
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", function () {
      if (selectedTags.length > 0) {
        alert(`Tags saved: ${selectedTags.join(", ")}`);
      } else {
        alert("Please select at least one tag to save!");
      }
    });
  }
});