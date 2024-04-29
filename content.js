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
    "https://twitter.com/",
    "https://www.x.com/",
    "https://web.snapchat.com/"
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

// Check if the current URL matches any forbidden website
if (isForbidden(window.location.href)) {
    console.log("Sending message to open forbidden page...");
    // Send a message to the background script to open forbidden.html
    chrome.runtime.sendMessage({ action: "openForbiddenPage" });
}
