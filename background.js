// background.js
console.log("ScholarTime background service worker started");

// Store blocked URLs by tab ID
let blockedUrls = {};
let keepAliveInterval = null;

// Extract clean domain from URL
function getCleanDomain(url) {
    try {
        let domain = url.replace(/^(https?:\/\/)?/, '');
        domain = domain.replace(/^www\./, '');
        domain = domain.split('/')[0];
        domain = domain.split(':')[0];
        return domain.toLowerCase();
    } catch (e) {
        console.error("Error getting clean domain:", e);
        return '';
    }
}

// Check if domain matches (handles subdomains)
function domainsMatch(domain1, domain2) {
    if (!domain1 || !domain2) return false;
    
    const d1 = domain1.toLowerCase();
    const d2 = domain2.toLowerCase();
    
    if (d1 === d2) return true;
    if (d1.endsWith('.' + d2)) return true;
    if (d2.endsWith('.' + d1)) return true;
    
    const getBaseDomain = (domain) => {
        const parts = domain.split('.');
        if (parts.length >= 2) {
            return parts.slice(-2).join('.');
        }
        return domain;
    };
    
    return getBaseDomain(d1) === getBaseDomain(d2);
}

// Initialize service worker
function initServiceWorker() {
    console.log("Initializing service worker...");
    
    // Clear any existing interval
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    
    // Keep service worker alive
    keepAliveInterval = setInterval(() => {
        console.log("Service worker keep-alive ping");
        // Send a dummy message to keep service worker active
        chrome.runtime.sendMessage({ type: "keepAlive" }, (response) => {
            // Ignore errors - they're expected when no content script is listening
        });
    }, 20000);
}

// Initialize when service worker starts
initServiceWorker();

// Block navigation BEFORE page loads
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Skip extension pages and forbidden.html
    if (details.url.includes("forbidden.html") || 
        details.url.startsWith("chrome-extension://") ||
        details.url.startsWith("chrome://")) {
        console.log("Skipping navigation check for extension page:", details.url);
        return;
    }
    
    // Check if extension is enabled and whitelist
    chrome.storage.local.get(['enabled', 'whitelist'], (result) => {
        const isEnabled = result.enabled !== false;
        const whitelist = result.whitelist || [];
        const currentDomain = getCleanDomain(details.url);
        
        if (!isEnabled || !currentDomain) {
            return;
        }
        
        // Check if domain is in whitelist
        for (let whitelistUrl of whitelist) {
            const whitelistDomain = getCleanDomain(whitelistUrl);
            if (domainsMatch(currentDomain, whitelistDomain)) {
                console.log("Background: Domain is whitelisted:", currentDomain, "matches", whitelistDomain);
                return;
            }
        }
        
        // Send message to content script to check URL
        chrome.tabs.sendMessage(details.tabId, { 
            action: "checkURL", 
            url: details.url 
        }, (response) => {
            if (chrome.runtime.lastError) {
                // Content script might not be ready yet, that's OK
                return;
            }
            if (response && response.shouldBlock) {
                console.log("Background: Blocking URL:", details.url);
                
                // Store the blocked URL before redirecting
                blockedUrls[details.tabId] = details.url;
                
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL("forbidden.html")
                });
            }
        });
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);
    
    if (request.action === "openForbiddenPage") {
        console.log("Background: Opening forbidden page for:", sender.tab.url);
        
        // Skip if we're already on a forbidden page or extension page
        if (sender.tab.url.includes("forbidden.html") || 
            sender.tab.url.startsWith("chrome-extension://") ||
            sender.tab.url.startsWith("chrome://")) {
            console.log("Already on extension page, skipping");
            return;
        }
        
        // Store the blocked URL before checking whitelist
        blockedUrls[sender.tab.id] = sender.tab.url;
        
        // Check if extension is enabled and whitelist
        chrome.storage.local.get(['enabled', 'whitelist'], (result) => {
            const isEnabled = result.enabled !== false;
            const whitelist = result.whitelist || [];
            const currentDomain = getCleanDomain(sender.tab.url);
            
            if (!isEnabled || !currentDomain) {
                console.log("Background: Extension disabled or invalid domain");
                // Clear the stored URL since we're not blocking
                delete blockedUrls[sender.tab.id];
                return;
            }
            
            // Check if domain is in whitelist
            for (let whitelistUrl of whitelist) {
                const whitelistDomain = getCleanDomain(whitelistUrl);
                if (domainsMatch(currentDomain, whitelistDomain)) {
                    console.log("Background: Domain is whitelisted:", currentDomain, "matches", whitelistDomain);
                    // Clear the stored URL since we're not actually blocking
                    delete blockedUrls[sender.tab.id];
                    return;
                }
            }
            
            // If not whitelisted and extension is enabled, block it
            chrome.tabs.update(sender.tab.id, {
                url: chrome.runtime.getURL("forbidden.html")
            });
        });
        
        return true;
    }
    
    // Get the blocked URL for a tab
    if (request.action === "getBlockedUrl") {
        const blockedUrl = blockedUrls[sender.tab.id];
        console.log("Background: Returning blocked URL for tab", sender.tab.id, ":", blockedUrl);
        sendResponse({ blockedUrl: blockedUrl });
        return true;
    }
    
    // Clear the blocked URL (after user adds to whitelist or cancels)
    if (request.action === "clearBlockedUrl") {
        console.log("Background: Clearing blocked URL for tab", sender.tab.id);
        delete blockedUrls[sender.tab.id];
        sendResponse({ success: true });
        return true;
    }
    
    // Get or update whitelist (used by forbidden page)
    if (request.action === "addToWhitelistAndRedirect") {
        const { urlToWhitelist } = request;
        console.log("Background: Adding to whitelist and redirecting:", urlToWhitelist);
        
        const domain = getCleanDomain(urlToWhitelist);
        if (!domain) {
            sendResponse({ success: false, error: "Invalid URL" });
            return true;
        }
        
        const formattedUrl = 'https://' + domain + '/';
        
        chrome.storage.local.get(['whitelist'], (result) => {
            const whitelist = result.whitelist || [];
            
            // Check if already exists
            const alreadyExists = whitelist.some(existingUrl => {
                const existingDomain = getCleanDomain(existingUrl);
                return existingDomain === domain;
            });
            
            if (!alreadyExists) {
                whitelist.push(formattedUrl);
                chrome.storage.local.set({ whitelist: whitelist }, () => {
                    console.log("Added to whitelist:", domain);
                    // Clear the blocked URL
                    delete blockedUrls[sender.tab.id];
                    sendResponse({ 
                        success: true, 
                        redirectTo: urlToWhitelist,
                        addedToWhitelist: true 
                    });
                });
            } else {
                // Already whitelisted, just redirect
                delete blockedUrls[sender.tab.id];
                sendResponse({ 
                    success: true, 
                    redirectTo: urlToWhitelist,
                    addedToWhitelist: false 
                });
            }
        });
        
        return true;
    }
    
    // Keep-alive ping response
    if (request.type === "keepAlive") {
        sendResponse({ alive: true });
        return true;
    }
    
    return true;
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    delete blockedUrls[tabId];
});

// Re-initialize if service worker wakes up
chrome.runtime.onStartup.addListener(() => {
    console.log("Service worker starting up");
    initServiceWorker();
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed/updated");
    initServiceWorker();
});