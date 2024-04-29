// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to cancel button
    var cancelBtn = document.getElementById('cancelBtn');

    // Cancel button listener
    cancelBtn.addEventListener('click', function() {
        console.log("Cancel button clicked");
        // Navigate to Google
        chrome.tabs.update({ url: "https://www.google.com/" });
    });
});
