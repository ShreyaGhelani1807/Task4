console.log("✅ Service Worker is active and loaded!");

let currentTab = null;
let startTime = null;

function getTodayDateKey() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // e.g., "2025-06-18"
}

function switchTab(tab) {
  endTracking();
  if (!tab || !tab.url || !tab.url.startsWith("http")) return;
  currentTab = new URL(tab.url).hostname;
  startTime = Date.now();
  console.log("🕒 Started tracking:", currentTab);
}

function endTracking() {
  if (!currentTab || startTime === null) return;
  const timeSpent = Date.now() - startTime;
  const today = getTodayDateKey();

  chrome.storage.local.get([today], (data) => {
    const todayData = data[today] || {};
    todayData[currentTab] = (todayData[currentTab] || 0) + timeSpent;
    chrome.storage.local.set({ [today]: todayData }, () => {
      console.log("✅ Time saved for", currentTab, timeSpent, "ms");
    });
  });

  currentTab = null;
  startTime = null;
}

// Track tab switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  switchTab(tab);
});

// Track tab content loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    switchTab(tab);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    endTracking(); // user left browser
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) switchTab(tab);
});

// Stop tracking on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  endTracking();
});
