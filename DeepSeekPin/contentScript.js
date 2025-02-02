(function () {
    "use strict";
  
    // ============================
    // Inject Custom CSS for Unified Styling
    // ============================
    function injectStyle() {
      const style = document.createElement("style");
      style.textContent = `
        /* Container for the pinned messages */
        .pinned-messages-section {
          margin: 10px;
          padding: 0;
          border: 1px solid #4166D5;
          border-radius: 4px;
          background: #4166D5;
        }
        .pinned-messages-section .section-title {
          font-weight: bold;
          padding: 5px 10px;
          background: #212327;
          border-bottom: 1px solid #4166D5;
        }
        /* The list that holds the pinned items */
        #pinned-chats {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        /* Pinned chat items styling */
        .pinned-messages-section .f9edaa3c,
        .pinned-messages-section .pinned-clone {
          margin: 0;
          padding: 5px 10px;
          border-bottom: 1px solid #4166D5;
          background: #212327;
        }
        /* Remove extra margin/padding from inner elements if needed */
        .pinned-messages-section .f9edaa3c * {
          margin: 0;
          padding: 0;
        }
        /* Dropdown menu options (for Pin/Unpin) */
        .ds-dropdown-menu-option.pin-chat-option {
          padding: 5px 10px;
          display: flex;
          align-items: center;
        }
        .ds-dropdown-menu-option.pin-chat-option svg {
          margin-right: 5px;
        }
      `;
      document.head.appendChild(style);
    }
  
    injectStyle();
  
    // ============================
    // Unique ID Assignment
    // ============================
    let uniqueIdCounter = 0;
    function ensureChatId(chatItem) {
      let chatID = chatItem.getAttribute("data-id");
      if (!chatID) {
        uniqueIdCounter++;
        chatID = "chat-" + uniqueIdCounter;
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
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M14 2l-4 4H5v12h14V6h-5l-4-4z" fill="currentColor"/>
        </svg>
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
  
    // Restore pinned chats by scanning the main chat list for items
    // whose IDs are saved in localStorage.
    function restorePinnedChats() {
      const pinnedIDs = loadPinnedChatIDs();
      if (!pinnedIDs.length) return;
      const pinnedList = document.getElementById("pinned-chats");
      if (!pinnedList) return;
      document.querySelectorAll(".f9edaa3c").forEach(chatItem => {
        const chatID = ensureChatId(chatItem);
        if (pinnedIDs.includes(chatID)) {
          if (!pinnedList.querySelector(`[data-id="${chatID}"].pinned-clone`)) {
            pinChat(chatItem);
            console.log(`Restored pinned chat: ${chatID}`);
          }
        }
      });
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
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M14 2l-4 4H5v12h14V6h-5l-4-4z" fill="currentColor"/>
              </svg>
            </div>
            <div class="ds-dropdown-menu-option__label">Unpin</div>
          `;
        } else {
          toggleOption.innerHTML = `
            <div class="ds-dropdown-menu-option__icon">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-7.5 4 2-7L2 9h7l3-7z" fill="currentColor"/>
              </svg>
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
      const observer = new MutationObserver(() => {
        // 1. Ensure the pinned messages section is present.
        const sidebar = document.querySelector(".ebaea5d2");
        const chatListSection = document.querySelector(".fb0a63fb");
        if (sidebar && chatListSection && !document.querySelector(".pinned-messages-section")) {
          const pinnedSection = document.createElement("div");
          pinnedSection.className = "pinned-messages-section";
          pinnedSection.innerHTML = `
            <div class="section-title">Pinned Messages</div>
            <ul id="pinned-chats"></ul>
          `;
          sidebar.parentNode.insertBefore(pinnedSection, chatListSection);
          console.log("Pinned Messages section added automatically!");
          restorePinnedChats();
        }
  
        // 2. Attach dropdown listeners to original chat items.
        document.querySelectorAll(".f9edaa3c").forEach(chatItem => {
          if (chatItem.classList.contains("pinned-clone")) return;
          if (!chatItem.getAttribute("data-pin-listener")) {
            const menuButton = chatItem.querySelector(".ds-icon");
            if (menuButton) {
              menuButton.addEventListener("click", () => {
                injectToggleOption(chatItem);
              });
            }
            chatItem.setAttribute("data-pin-listener", "true");
          }
        });
  
        // 3. Detect sidebar collapse/expand (using a known element) and restore pinned chats.
        if (document.querySelector("div.b8812f16.a2f3d50e")) {
          if (!document.querySelector(".pinned-messages-section") && sidebar && chatListSection) {
            const pinnedSection = document.createElement("div");
            pinnedSection.className = "pinned-messages-section";
            pinnedSection.innerHTML = `
              <div class="section-title">Pinned Messages</div>
              <ul id="pinned-chats"></ul>
            `;
            sidebar.parentNode.insertBefore(pinnedSection, chatListSection);
            console.log("Re-added pinned messages section on sidebar reopen!");
          }
          restorePinnedChats();
        }
      });
  
      observer.observe(document.body, { childList: true, subtree: true });
    }
  
    // ============================
    // Start Watching
    // ============================
    watchSidebar();
  })();
  