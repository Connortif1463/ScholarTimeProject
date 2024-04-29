// forbidden.js
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Message received in background.js: ", message);
    // Open forbidden.html in a new tab
    if (message.action == "openForbiddenPage") {
        console.log("Opening forbidden page...");
        chrome.tabs.create({ url: "forbidden.html" });
    }
});
