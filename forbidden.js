// Add event listener when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to cancel button
    var cancelBtn = document.getElementById('cancelBtn');

    // Cancel button listener
    cancelBtn.addEventListener('click', function() {
        console.log("Cancel button clicked");
        // Navigate to Google
        window.location.href = "https://www.google.com/";
    });
});
