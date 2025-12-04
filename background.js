// background.js
console.log("ScholarTime background service worker started");

// Keep service worker alive
setInterval(() => {
    console.log("Service worker keep-alive ping");
}, 25000);

// Block navigation BEFORE page loads
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
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

// Listens for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);
    
    if (request.action === "openForbiddenPage") {
        console.log("Background: Opening forbidden page for:", sender.tab.url);
        chrome.tabs.update(sender.tab.id, {
            url: chrome.runtime.getURL("forbidden.html")
        });
    }
    
    return true;
});