// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    
    // Load saved state
    chrome.storage.local.get(['enabled'], (result) => {
        const isEnabled = result.enabled !== false; // Default to true
        toggleSwitch.checked = isEnabled;
    });
    
    // Save state when toggled
    toggleSwitch.addEventListener('change', function() {
        chrome.storage.local.set({ enabled: this.checked });
    });
});