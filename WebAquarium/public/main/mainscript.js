// Tab Switching Functionality
const swimTab = document.getElementById("swimTab");
const tagTab = document.getElementById("tagTab");
const swimContent = document.getElementById("swimContent");
const tagContent = document.getElementById("tagContent");
const startButton = document.getElementById("startButton");

// Profile Modal Elements
const profileIcon = document.getElementById("profileIcon");
const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const saveProfileButton = document.getElementById("saveProfileButton");
const logoutButton = document.getElementById("logoutButton");

// Tab Switching
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

// Start Button Functionality - just navigate without an alert
startButton.addEventListener("click", () => {
  // Navigate directly to the random.html page
  window.location.href = "../webpage/rtcpage/pages/pairing.html";
});

// Profile Modal Functionality
profileIcon.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent event from bubbling up
  profileModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent scrolling while modal is open
});

closeProfileModal.addEventListener("click", () => {
  profileModal.classList.add("hidden");
  document.body.style.overflow = ""; // Restore scrolling
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === profileModal) {
    profileModal.classList.add("hidden");
    document.body.style.overflow = ""; // Restore scrolling
  }
});

// Prevent clicks inside modal from closing it
const profileCard = document.querySelector(".profile-card");
if (profileCard) {
  profileCard.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

saveProfileButton.addEventListener("click", () => {
  const accountName = document.getElementById("account").value;
  if (accountName.trim() !== "") {
    alert("Profile saved successfully!");
    // Here you would typically save the profile data to your backend
    profileModal.classList.add("hidden");
    document.body.style.overflow = ""; // Restore scrolling
  } else {
    alert("Please enter an account name");
  }
});

logoutButton.addEventListener("click", () => {
  // Add your logout logic here
  alert("Logged out successfully");
  // You might want to redirect to a login page or clear session data
  profileModal.classList.add("hidden");
  document.body.style.overflow = ""; // Restore scrolling
});

// Character Selection Functionality
const characterIcons = document.querySelectorAll(".character-icon");
const selectedCharacter = document.getElementById("selectedCharacter");

// Set default image initially
if (selectedCharacter) {
  selectedCharacter.src = "/new/Jelly1.gif";
  selectedCharacter.style.width = "150px";
  selectedCharacter.style.height = "150px";
}

characterIcons.forEach((icon) => {
  icon.dataset.originalSrc = icon.src;

  icon.addEventListener("mouseenter", () => {
    if (icon.dataset.hoverSrc) {
      icon.src = icon.dataset.hoverSrc;
    }
  });

  icon.addEventListener("mouseleave", () => {
    icon.src = icon.dataset.originalSrc;
  });

  icon.addEventListener("click", () => {
    console.log("Character clicked:", icon.dataset.character);

    // Set selected character to hover version if available
    if (selectedCharacter) {
      selectedCharacter.src = icon.dataset.hoverSrc || icon.dataset.originalSrc;
      selectedCharacter.alt = icon.alt;

      // Set size dynamically
      selectedCharacter.style.width = "150px";
      selectedCharacter.style.height = "150px";

      // Force reload
      selectedCharacter.onload = () => console.log("Image loaded successfully");
      selectedCharacter.onerror = () => console.error("Image failed to load", selectedCharacter.src);
    }

    // Highlight selected character
    characterIcons.forEach((c) => (c.style.border = ""));
    icon.style.border = "3px solid #272A7B";
  });
});

// Tag Selection Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Select first character by default when page loads
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
        // Here you could add code to store the tags or navigate to another page
      } else {
        alert("Please select at least one tag to save!");
      }
    });
  }
});