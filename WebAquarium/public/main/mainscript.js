// Tab Switching Functionality
const swimTab = document.getElementById("swimTab");
const tagTab = document.getElementById("tagTab");
const swimContent = document.getElementById("swimContent");
const tagContent = document.getElementById("tagContent");
const startButton = document.getElementById("startButton");

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

startButton.addEventListener("click", () => {
  const name = document.querySelector(".name-input").value || "Friend";
  alert(`Hello ${name}, let's make new friends! 🌊`);
});

// Explore Button Functionality
document.getElementById("exploreButton")?.addEventListener("click", () => {
  alert("Exploring tags feature coming soon!");
});

// Character Selection Functionality
const characterIcons = document.querySelectorAll(".character-icon");
const selectedCharacter = document.getElementById("selectedCharacter");

// Set default image initially
selectedCharacter.src = "/new/Jelly1.gif";
selectedCharacter.style.width = "150px";  // Set initial size
selectedCharacter.style.height = "150px";

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
    selectedCharacter.src = icon.dataset.hoverSrc || icon.dataset.originalSrc;
    selectedCharacter.alt = icon.alt;

    // Set size dynamically
    selectedCharacter.style.width = "150px";
    selectedCharacter.style.height = "150px";

    // Force reload
    selectedCharacter.onload = () => console.log("Image loaded successfully");
    selectedCharacter.onerror = () => console.error("Image failed to load", selectedCharacter.src);

    // Highlight selected character
    characterIcons.forEach((c) => (c.style.border = ""));
    icon.style.border = "3px solid #272A7B";
  });
});

// Select first character by default when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (characterIcons.length > 0) {
    characterIcons[0].click();
  }
});

// Tag Selection Functionality
document.addEventListener("DOMContentLoaded", function () {
  const tagSearchInput = document.getElementById("tagSearchInput");
  const addTagButton = document.getElementById("addTagButton");
  const selectedTagsContainer = document.getElementById("selectedTags");
  const suggestedTags = document.querySelectorAll(".tag-item");
  const saveButton = document.getElementById("savebutton");

  let selectedTags = [];

  function addTag(tagText) {
    if (!tagText.trim() || selectedTags.includes(tagText.trim())) return;

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
    saveButton.textContent = selectedTags.length > 0 ? `Explore ${selectedTags.length} Tags` : "Explore Tags";
  }

  addTagButton.addEventListener("click", function () {
    const tagText = tagSearchInput.value;
    addTag(tagText.startsWith("#") ? tagText : `#${tagText}`);
  });

  tagSearchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const tagText = tagSearchInput.value;
      addTag(tagText.startsWith("#") ? tagText : `#${tagText}`);
    }
  });

  suggestedTags.forEach((tag) => {
    tag.addEventListener("click", function () {
      addTag(tag.textContent);
    });
  });

  document.getElementById("exploreButton")?.addEventListener("click", function () {
    if (selectedTags.length > 0) {
      alert(`Save tag: ${selectedTags.join(", ")}`);
    } else {
      alert("Please select at least one tag to explore!");
    }
  });
});
