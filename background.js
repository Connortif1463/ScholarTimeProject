// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Open forbidden.html in the current tab
    if (message.action == "openForbiddenPage") {
        chrome.tabs.update(sender.tab.id, { url: "forbidden.html" });
    }
});
