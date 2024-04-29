// List of forbidden websites
var forbiddenWebsites = [
    "https://www.youtube.com/", 
    "https://www.facebook.com/", 
    "https://www.whatsapp.com/",
    "https://www.skype.com/",
    "https://www.netflix.com/",
    "https://www.amazon.com/",
    "https://www.instagram.com/",
    "https://www.snapchat.com/",
    "https://www.twitter.com/",
    "https://www.x.com/"
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
