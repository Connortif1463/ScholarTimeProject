// Listener for showing forbidden page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action == "showForbiddenPage") {
        chrome.tabs.create({ url: "forbidden.html" });
    }
});
