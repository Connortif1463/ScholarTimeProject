// List of forbidden websites
var forbiddenWebsites = [
    "*://*.youtube.com/*", 
    "*://*.facebook.com/*", 
    "*://*.whatsapp.com/*",
    "*://*.skype.com/*",
    "*://*.netflix.com/*",
    "*://*.amazon.com/*",
    "*://*.instagram.com/*",
    "*://*.snapchat.com/*",
    "*://*.twitter.com/*",
    "*://*.x.com/*"
];

// Check if current URL matches any forbidden website
function isForbidden(url) {
    for (var i = 0; i < forbiddenWebsites.length; i++) {
        if (url.match(forbiddenWebsites[i])) {
            return true;
        }
    }
    return false;
}

// Send message to background script if current website is forbidden
if (isForbidden(window.location.href)) {
    chrome.runtime.sendMessage({ action: "showForbiddenPage" });
}
