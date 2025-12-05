// importing forbiddenWebsites
var forbiddenWebsites = window.forbiddenWebsites || [];

// Check if the current URL matches any forbidden website
function isForbidden(url) {
    for (var i = 0; i < forbiddenWebsites.length; i++) {
        if (url.startsWith(forbiddenWebsites[i])) {
            console.log("Current url found forbidden: " + url);
            return true;
        }
    }
    return false;
}

// Check if current page forbidden before page fully loads
if (isForbidden(window.location.href)) {
    // Redirect the current tab to the forbidden page
    chrome.runtime.sendMessage({ action: "openForbiddenPage" });
}

// Adds event listener when the document is loaded
cancelBtn.addEventListener('click', function() {
    console.log("Cancel button clicked");

    // Go back 2 pages, to avoid the page that caused the issue.
    history.go(-2);
});
