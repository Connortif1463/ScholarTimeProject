document.addEventListener('DOMContentLoaded', function() {
    // Get reference to toggle button
    var toggleBtn = document.getElementById('toggleBtn');

    // Toggle button listener
    toggleBtn.addEventListener('click', function() {
        console.log("Toggle button clicked");
        // Send message to toggle functionality
        chrome.runtime.sendMessage({ action: "toggleFunctionality" });
    });
});
