// background.js
console.log("ScholarTime background service worker started");

// Keep service worker alive
setInterval(() => {
    console.log("Service worker keep-alive ping");
}, 25000);

// Block navigation BEFORE page loads
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    chrome.storage.local.get(['enabled'], (result) => {
        // check if extension toggle is enabled
        const isEnabled = result.enabled !== false;

        if(!isEnabled) {
            return; // extension disabled, allow normal browsing
        }

        // except if it's the forbidden.html already
        if (details.url.includes("forbidden.html")) {
            return;
        }
        
        // Send message to content script to check URL
        chrome.tabs.sendMessage(details.tabId, { 
            action: "checkURL", 
            url: details.url 
        }, (response) => {
            if (chrome.runtime.lastError) {
                // Content script might not be ready yet.. just continues
                return;
            }
            if (response && response.shouldBlock) {
                console.log("Background: Blocking URL:", details.url);
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL("forbidden.html")
                });
            }
        });
    });
});

// Listens for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);
    
    if (request.action === "openForbiddenPage") {
        console.log("Background: Opening forbidden page for:", sender.tab.url);
        
        // Checks if extension toggle is enabled
        chrome.storage.local.get(['enabled'], (result) => {
            // Defaults to enabled if not set
            const isEnabled = result.enabled !== false;
            
            if (isEnabled) {
                chrome.tabs.update(sender.tab.id, {
                    url: chrome.runtime.getURL("forbidden.html")
                });
            } else {
                console.log("Extension is disabled, allowing access");
            }
        });
    }
    
    return true;
});