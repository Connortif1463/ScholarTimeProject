// forbidden.js
console.log("Forbidden script loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded on forbidden page");
    
    const cancelBtn = document.getElementById('cancelBtn');
    const whitelistBtn = document.getElementById('whitelistBtn');
    const siteInfo = document.getElementById('siteInfo');
    const blockedSiteUrl = document.getElementById('blockedSiteUrl');
    
    let currentBlockedUrl = null;
    
    // Get the originally blocked URL from background script
    chrome.runtime.sendMessage({ action: "getBlockedUrl" }, (response) => {
        if (response && response.blockedUrl) {
            currentBlockedUrl = response.blockedUrl;
            console.log("Got blocked URL:", currentBlockedUrl);
            
            // Display the blocked site info
            try {
                const url = new URL(currentBlockedUrl);
                const displayUrl = url.hostname.replace('www.', '');
                blockedSiteUrl.textContent = displayUrl;
                siteInfo.classList.remove('hidden');
                
                // Update whitelist button text
                if (whitelistBtn) {
                    whitelistBtn.textContent = `Add "${displayUrl}" to Whitelist`;
                }
            } catch (e) {
                console.error("Error parsing URL:", e);
                blockedSiteUrl.textContent = currentBlockedUrl;
            }
        } else {
            console.log("No blocked URL found");
            // Hide whitelist button if no URL
            if (whitelistBtn) {
                whitelistBtn.style.display = 'none';
            }
        }
    });
    
    // Cancel button - go back
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log("Cancel button clicked");
            
            // Clear the stored blocked URL
            chrome.runtime.sendMessage({ action: "clearBlockedUrl" }, () => {
                try {
                    // Try to go back 2 pages (skip the forbidden page)
                    window.history.go(-2);
                } catch (e) {
                    // Fallback to Google
                    console.log("Fallback to Google");
                    window.location.href = "https://www.google.com";
                }
            });
        });
    }
    
    // Whitelist button - add to whitelist and continue
    if (whitelistBtn) {

        // bool for determining whether the user actually wants to do it or not
        const doWhitelistingAction = true;

        whitelistBtn.addEventListener('click', function() {
            console.log("Whitelist button clicked");
            
            if (!currentBlockedUrl) {
                alert("Cannot determine which site to whitelist. Please use the extension popup to add sites to your whitelist.");
                return;
            }

            if (confirm("Are you sure you wanna go to this site?")){
                if (confirm("Are you really sure?"))
                {
                    if (confirm("Cause if you're NOT really sure, you probably shouldn't."))
                    {
                        // Continues and allows whitelistBtn to stay pressed
                    }
                    else {doWhitelistingAction = false}
                }
                else {doWhitelistingAction = false}
            }
            else {doWhitelistingAction = false}
            
            if(doWhitelistingAction)
            {
                // Show loading state
                whitelistBtn.textContent = "Adding to Whitelist...";
                whitelistBtn.disabled = true;
                
                // Send message to background to add to whitelist and redirect
                chrome.runtime.sendMessage({ 
                    action: "addToWhitelistAndRedirect",
                    urlToWhitelist: currentBlockedUrl
                }, (response) => {
                    if (response && response.success) {
                        console.log("Redirecting to:", response.redirectTo);
                        
                        if (response.addedToWhitelist) {
                            // Brief delay to show success
                            setTimeout(() => {
                                window.location.href = response.redirectTo;
                            }, 500);
                        } else {
                            // Already in whitelist, just redirect
                            window.location.href = response.redirectTo;
                        }
                    } else {
                        // Error handling
                        alert("Failed to add to whitelist. Please try again.");
                        whitelistBtn.textContent = "Add to Whitelist & Continue";
                        whitelistBtn.disabled = false;
                    }
                });
            }
        });
    }
    
    // Also allows adding via settings while on this page
    // and listens for storage changes (when whitelist is updated in the settings)
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.whitelist && currentBlockedUrl) {
            console.log("Whitelist updated, checking if we should auto-redirect");
            
            const getCleanDomain = (url) => {
                try {
                    let domain = url.replace(/^(https?:\/\/)?/, '');
                    domain = domain.replace(/^www\./, '');
                    domain = domain.split('/')[0];
                    domain = domain.split(':')[0];
                    return domain.toLowerCase();
                } catch (e) {
                    return '';
                }
            };
            
            const currentDomain = getCleanDomain(currentBlockedUrl);
            const newWhitelist = changes.whitelist.newValue || [];
            
            // Check if current domain is now in whitelist
            const isNowWhitelisted = newWhitelist.some(whitelistUrl => {
                const whitelistDomain = getCleanDomain(whitelistUrl);
                return whitelistDomain === currentDomain;
            });
            
            if (isNowWhitelisted) {
                console.log("Domain is now whitelisted, auto-redirecting");
                // Clear the blocked URL and redirect
                chrome.runtime.sendMessage({ action: "clearBlockedUrl" }, () => {
                    setTimeout(() => {
                        window.location.href = currentBlockedUrl;
                    }, 300);
                });
            }
        }
    });
});