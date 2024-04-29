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

// Check if the current URL matches any forbidden website
if (isForbidden(window.location.href)) {
    // Inject forbidden HTML and JavaScript directly into the current tab
    var forbiddenHTML = `
        <html>
        <head>
            <title>Forbidden Page</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    font-family: Arial, sans-serif;
                }

                h1 {
                    margin-bottom: 20px;
                }

                button {
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h1>Hello there!</h1>
            <h3>It seems like you've tried to open a service that isn't permitted.</h3>
            <button id="cancelBtn">Cancel</button>
            <script>
                document.getElementById('cancelBtn').addEventListener('click', function() {
                    console.log("Cancel button clicked");
                    // Navigate to Google
                    window.location.href = "https://www.google.com/";
                });
            </script>
        </body>
        </html>
    `;
    document.write(forbiddenHTML);
}

// Check if current URL matches any forbidden website
function isForbidden(url) {
    for (var i = 0; i < forbiddenWebsites.length; i++) {
        if (url.startsWith(forbiddenWebsites[i])) {
            return true;
        }
    }
    return false;
}
