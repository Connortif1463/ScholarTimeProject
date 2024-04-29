// background.js

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Message received in background.js: ", message);
    // Open forbidden.html in the current tab
    if (message.action == "openForbiddenPage") {
        console.log("Opening forbidden page...");
        chrome.tabs.update(sender.tab.id, { url: "forbidden.html" });
    }
});
