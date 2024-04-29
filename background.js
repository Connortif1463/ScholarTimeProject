//background.js
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Message received in background.js: ", message);
    // Open forbidden.html in the current tab
    if (message.action == "openForbiddenPage") {
        console.log("Opening forbidden page...");
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {
                code: 'var forbiddenHTML = `<html><head><title>Forbidden Page</title><style>body{margin:0;padding:0;height:100vh;display:flex;justify-content:center;align-items:center;flex-direction:column;font-family:Arial,sans-serif;}h1{margin-bottom:20px;}button{padding:10px 20px;font-size:16px;cursor:pointer;}</style></head><body><h1>Hello there!</h1><h3>It seems like you\'ve tried to open a service that isn\'t permitted.</h3><button id="cancelBtn">Cancel</button><script>document.getElementById(\'cancelBtn\').addEventListener(\'click\', function() {console.log("Cancel button clicked");window.location.href = "https://www.google.com/";});</script></body></html>`;document.write(forbiddenHTML);'
            });
        });
    }
});
