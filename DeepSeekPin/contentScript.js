(function () {
    "use strict";
  
    // ============================
    // Inject Custom CSS for Unified Styling
    // ============================
    function injectStyle() {
      const style = document.createElement("style");
      style.textContent = `
      /* Pinned messages container */
      .pinned-messages-section {
        margin: 10px;
        border-radius: 12px;
        background: var(--dsr-side-bg);
        border: 1px solid var(--dsr-border);
      }
  
      .pinned-messages-section .section-title {
        font-weight: 500;
        padding: 12px 16px;
        color: var(--dsr-text-2);
        border-bottom: 1px solid var(--dsr-border);
      }
  
      #pinned-chats {
        list-style: none;
        margin: 0;
        padding: 8px;
      }
  
      /* Pinned items - use original class + clone class */
      .pinned-messages-section .f9edaa3c.pinned-clone {
        height: 38px;
        margin: 2px 0;
        border-radius: 12px;
        background-color: var(--dsr-side-bg);
        border: none !important;
        box-shadow: none !important;
      }
  
      /* Dark theme support */
      [data-ds-dark-theme] .pinned-messages-section .f9edaa3c.pinned-clone {
        background-color: var(--dsr-side-bg);
      }
  
      /* Hover state */
      .pinned-messages-section .f9edaa3c.pinned-clone:not(.b64fb9ae):hover {
        background-color: var(--dsr-side-hover-bg) !important;
      }
  
      /* Active state */
      .pinned-messages-section .f9edaa3c.pinned-clone.b64fb9ae {
        background-color: var(--dsr-local-active-bg) !important;
      }
  
      /* Remove original position absolute and gradient overlays */
      .pinned-messages-section .f9edaa3c.pinned-clone .f8773756,
      .pinned-messages-section .f9edaa3c.pinned-clone .eaaaba55 {
        display: none;
      }
  
      /* Adjust padding for pinned items */
      .pinned-messages-section .f9edaa3c.pinned-clone .c08e6e93 {
        padding-right: 24px;
      }
  
      /* Unpin button styling */
      .pinned-messages-section .unpin-chat {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        color: var(--dsr-text-2);
        padding: 4px;
        border-radius: 6px;
        background: var(--dsr-side-bg);
      }
  
      .pinned-messages-section .unpin-chat:hover {
        background: var(--dsr-side-hover-bg);
      }
  
      .pinned-messages-section .unpin-chat svg {
        width: 16px;
        height: 16px;
      }
      `;
      document.head.appendChild(style);
    }
  
    injectStyle();
  
// ============================
// Unique ID Assignment (Updated)
// ============================
function ensureChatId(chatItem) {
    // Check if the chat has a unique identifier (e.g., message ID in href)
    const link = chatItem.querySelector('a[href*="/message/"]'); // Adjust selector as needed
    let chatID = chatItem.getAttribute("data-id");
    
    if (!chatID && link) {
      // Extract stable ID from href (example: "https://.../message/12345")
      const href = link.getAttribute('href');
      chatID = href.split('/').pop(); // Gets "12345"
      chatItem.setAttribute("data-id", chatID);
    }
    
    // Fallback: Generate hash from text content
    if (!chatID) {
      const text = chatItem.textContent.trim();
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
      }
      chatID = 'chat-' + hash;
      chatItem.setAttribute("data-id", chatID);
    }
    
    return chatID;
  }
  
    // ============================
    // Local Storage Helpers
    // ============================
    const STORAGE_KEY = "pinnedChats";
  
    function loadPinnedChatIDs() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        console.error("Error loading pinned chats from localStorage", e);
        return [];
      }
    }
  
    function savePinnedChatIDs(pinnedIDs) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedIDs));
    }
  
    function addPinnedChatID(chatID) {
      if (!chatID) return;
      const pinnedIDs = loadPinnedChatIDs();
      if (!pinnedIDs.includes(chatID)) {
        pinnedIDs.push(chatID);
        savePinnedChatIDs(pinnedIDs);
      }
    }
  
    function removePinnedChatID(chatID) {
      if (!chatID) return;
      let pinnedIDs = loadPinnedChatIDs();
      pinnedIDs = pinnedIDs.filter(id => id !== chatID);
      savePinnedChatIDs(pinnedIDs);
    }
  
    // ============================
    // Chat Pin/Unpin Functions
    // ============================
    function pinChat(chatItem) {
      const chatID = ensureChatId(chatItem);
      const pinnedList = document.getElementById("pinned-chats");
      if (!pinnedList) return;
  
      // If a clone already exists, do nothing.
      if (pinnedList.querySelector(`[data-id="${chatID}"].pinned-clone`)) {
        return;
      }
  
      // Create a deep clone.
      const clone = chatItem.cloneNode(true);
      clone.classList.add("pinned-clone");
  
      // Remove any ds-icon elements and elements with class aa7b7ebb.
      clone.querySelectorAll(".ds-icon, .aa7b7ebb").forEach(el => el.remove());
  
      // Remove any preexisting pin options from the clone.
      const existingPinOption = clone.querySelector(".pin-chat-option");
      if (existingPinOption) {
        existingPinOption.remove();
      }
  
      // Create an "Unpin" button with an inline SVG icon.
      const unpinButton = document.createElement("div");
      unpinButton.className = "unpin-chat";
      unpinButton.style.cursor = "pointer";
      unpinButton.style.padding = "5px 10px";
      unpinButton.style.display = "none";
      unpinButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin-off"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>
        <span style="margin-left:4px;">Unpin</span>
      `;
  
      // Show the unpin button on hover.
      clone.addEventListener("mouseenter", () => {
        unpinButton.style.display = "block";
      });
      clone.addEventListener("mouseleave", () => {
        unpinButton.style.display = "none";
      });
      unpinButton.addEventListener("click", (e) => {
        e.stopPropagation();
        unpinChat(chatItem);
      });
      clone.appendChild(unpinButton);
  
      // Clicking the clone (except on the unpin button) simulates a click on the original chat.
      clone.addEventListener("click", (e) => {
        if (e.target.closest(".unpin-chat")) return;
        const originalChat = document.querySelector(`.f9edaa3c[data-id="${chatID}"]:not(.pinned-clone)`);
        if (originalChat) {
          originalChat.click();
        }
      });
  
      pinnedList.appendChild(clone);
      console.log(`Chat ${chatID} pinned successfully!`);
      addPinnedChatID(chatID);
    }
  
    function unpinChat(chatItem) {
      const chatID = ensureChatId(chatItem);
      const pinnedList = document.getElementById("pinned-chats");
      if (!pinnedList) return;
      const clone = pinnedList.querySelector(`[data-id="${chatID}"].pinned-clone`);
      if (clone) {
        clone.remove();
      }
      removePinnedChatID(chatID);
      console.log(`Chat ${chatID} unpinned successfully!`);
    }
  
// ============================
// Restore Pinned Chats (Updated)
// ============================
function restorePinnedChats() {
    const pinnedIDs = loadPinnedChatIDs();
    if (!pinnedIDs.length) return;
    const pinnedList = document.getElementById("pinned-chats");
    if (!pinnedList) return;
  
    const attemptRestore = (attempt = 0) => {
      const chatItems = document.querySelectorAll(".f9edaa3c:not(.pinned-clone)");
      let restored = false;
      
      chatItems.forEach(chatItem => {
        const chatID = ensureChatId(chatItem);
        if (pinnedIDs.includes(chatID) && !pinnedList.querySelector(`[data-id="${chatID}"]`)) {
          pinChat(chatItem);
          restored = true;
        }
      });
  
      // Retry up to 3 times if chats aren't loaded yet
      if (!restored && attempt < 3) {
        setTimeout(() => attemptRestore(attempt + 1), 500);
      }
    };
  
    attemptRestore();
  }
  
    // ============================
    // Dropdown Menu Injection (Toggle)
    // ============================
    function injectToggleOption(chatItem) {
      // Wait briefly for the dropdown menu to appear.
      setTimeout(() => {
        const dropdown = document.querySelector("div.ds-floating-position-wrapper .ds-dropdown-menu");
        if (!dropdown) return;
  
        // Remove any existing toggle option.
        const existingOption = dropdown.querySelector(".pin-chat-option");
        if (existingOption) existingOption.remove();
  
        // Determine if the chat is already pinned.
        const chatID = ensureChatId(chatItem);
        const isPinned = loadPinnedChatIDs().includes(chatID);
  
        // Create a new toggle option.
        const toggleOption = document.createElement("div");
        toggleOption.className = "ds-dropdown-menu-option pin-chat-option";
        toggleOption.style.cursor = "pointer";
  
        // Use SVG icons for both states.
        if (isPinned) {
          toggleOption.innerHTML = `
            <div class="ds-dropdown-menu-option__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin-off"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>
            </div>
            <div class="ds-dropdown-menu-option__label">Unpin</div>
          `;
        } else {
          toggleOption.innerHTML = `
            <div class="ds-dropdown-menu-option__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
            </div>
            <div class="ds-dropdown-menu-option__label">Pin</div>
          `;
        }
  
        // Insert the toggle option between the --none and --error options.
        const optionNone = dropdown.querySelector(".ds-dropdown-menu-option.ds-dropdown-menu-option--none");
        const optionError = dropdown.querySelector(".ds-dropdown-menu-option.ds-dropdown-menu-option--error");
        if (optionNone && optionError) {
          dropdown.insertBefore(toggleOption, optionError);
        } else {
          dropdown.appendChild(toggleOption);
        }
  
        // Toggle pin/unpin on click.
        toggleOption.addEventListener("click", (e) => {
          e.stopPropagation();
          if (isPinned) {
            unpinChat(chatItem);
          } else {
            pinChat(chatItem);
          }
          // Optionally hide the dropdown after toggling.
          dropdown.style.display = "none";
        });
      }, 150);
    }
  
    // ============================
    // Main Observer & UI Injection
    // ============================
    
function watchSidebar() {
    const observer = new MutationObserver((mutations) => {
      // Check if the chat list section exists (indicates sidebar is open)
      const chatListSection = document.querySelector(".fb0a63fb"); // Update selector if needed
      
      // 1. Ensure pinned section exists when sidebar is open
      if (chatListSection && !document.querySelector(".pinned-messages-section")) {
        const sidebar = document.querySelector(".ebaea5d2");
        if (sidebar) {
          const pinnedSection = document.createElement("div");
          pinnedSection.className = "pinned-messages-section";
          pinnedSection.innerHTML = `
            <div class="section-title">Pinned Messages</div>
            <ul id="pinned-chats"></ul>
          `;
          sidebar.parentNode.insertBefore(pinnedSection, chatListSection);
          restorePinnedChats(); // Restore after section is added
        }
      }
  
      // 2. Attach dropdown listeners to new chat items
      document.querySelectorAll(".f9edaa3c:not(.pinned-clone)").forEach(chatItem => {
        if (!chatItem.hasAttribute("data-pin-listener")) {
          const menuButton = chatItem.querySelector(".ds-icon");
          if (menuButton) {
            menuButton.addEventListener("click", () => injectToggleOption(chatItem));
          }
          chatItem.setAttribute("data-pin-listener", "true");
        }
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
    // ============================
    // Start Watching
    // ============================
    watchSidebar();
  })();
  