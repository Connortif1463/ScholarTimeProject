// content.js
console.log("ScholarTime content script loaded on:", window.location.href);

// List of forbidden DOMAINS
var forbiddenDomains = [
    "youtube.com",
    "youtu.be",
    "facebook.com",
    "instagram.com",
    "snapchat.com",
    "tiktok.com",
    "twitter.com",
    "x.com",
    "reddit.com",
    "pinterest.com",
    "tumblr.com",
    "linkedin.com",
    "whatsapp.com",
    "discord.com",
    "discordapp.com",
    "messenger.com",
    "skype.com",
    "telegram.org",
    "wechat.com",
    "viber.com",
    "myspace.com",
    "threads.net",
    "quora.com",
    
    // streaming and video
    "netflix.com",
    "hulu.com",
    "disneyplus.com",
    "hbomax.com",
    "primevideo.com",
    "peacocktv.com",
    "paramountplus.com",
    "crunchyroll.com",
    "funimation.com",
    "twitch.tv",
    "vimeo.com",
    "dailymotion.com",
    "vudu.com",
    "tubitv.com",
    "plutotv.com",
    "blog.youtube",
    "123movies",
    "movietrunk",
    "safe123moviesfree.org",
    "safe123moviesfree.org",
    "safe123moviesfree.org",
    "ok123movies.cc",
    "123moviesfree4u.icu",
    "yesmovies.to",
    "123moviesfree4u.top",
    "123-hd.lol",
    
    // music
    "spotify.com",
    "open.spotify.com",
    "pandora.com",
    "apple.com",
    "music.amazon.com",
    "soundcloud.com",
    "audible.com",
    "iheart.com",
    "tidal.com",
    "deezer.com",
    
    // gaming
    "roblox.com",
    "minecraft.net",
    "epicgames.com",
    "steampowered.com",
    "steamcommunity.com",
    "origin.com",
    "ea.com",
    "ubisoft.com",
    "riotgames.com",
    "leagueoflegends.com",
    "playvalorant.com",
    "callofduty.com",
    "xbox.com",
    "playstation.com",
    "nintendo.com",
    "king.com",
    "candycrushsaga.com",
    "friv.com",
    "coolmathgames.com",
    "miniclip.com",
    "agame.com",
    "kongregate.com",
    "newgrounds.com",
    "armorgames.com",
    "y8.com",
    "pokemonshowdown.com",
    "chess.com",
    "lichess.org",
    "battle.net",
    "blizzard.com",
    "kingdomofloathing.com",
    "neopets.com",
    "webkinz.com",
    "poptropica.com",
    "habbo.com",
    "guildwars2.com",
    "worldofwarcraft.com",
    "fortnite.com",
    "apexlegends.com",
    "overwatch.com",
    "destinythegame.com",
    
    // shopping and e-commerce
    "amazon.com",
    "ebay.com",
    "walmart.com",
    "target.com",
    "bestbuy.com",
    "alibaba.com",
    "aliexpress.com",
    "shein.com",
    "wish.com",
    "etsy.com",
    "zappos.com",
    "asos.com",
    "nike.com",
    "adidas.com",
    "macys.com",
    "kohls.com",
    "homedepot.com",
    "lowes.com",
    "wayfair.com",
    "overstock.com",
    "stockx.com",

    // dating apps and adult sites
    "www.tinder.com",
    "bumble.com",
    "hinge.com",
    "match.com",
    "okcupid.com",
    "pof.com",
    "adultfriendfinder.com",
    "pornhub.com",
    "xvideos.com",
    "XNXX.com",
    "redtube.com",
    "spankbang.com",
    "rule34.com",
    "beeg.com",
    "8muses.com",

    // Google entertainment services only
    "music.youtube.com",
    "tv.youtube.com",
    "studio.youtube.com",

];

function checkSpecificUrlPatterns(url) {
    const specificPatterns = [
        "play.google.com/movies",
        "play.google.com/tv",
    ];
    
    for (let pattern of specificPatterns) {
        if (url.includes(pattern)) {
            return true;
        }
    }
    return false;
}

// Extract clean domain from URL
function getCleanDomain(url) {
    try {
        // Remove protocol
        let domain = url.replace(/^(https?:\/\/)?/, '');
        // Remove www.
        domain = domain.replace(/^www\./, '');
        // Get domain part before first /
        domain = domain.split('/')[0];
        // Remove port
        domain = domain.split(':')[0];
        // Convert to lowercase
        return domain.toLowerCase();
    } catch (e) {
        return '';
    }
}

// Check if domain matches (handles subdomains)
function domainsMatch(domain1, domain2) {
    if (!domain1 || !domain2) return false;
    
    const d1 = domain1.toLowerCase();
    const d2 = domain2.toLowerCase();
    
    // Exact match
    if (d1 === d2) return true;
    
    // Check if one is a subdomain of the other
    if (d1.endsWith('.' + d2)) return true;
    if (d2.endsWith('.' + d1)) return true;
    
    // Get base domain (last two parts for .com, .org, etc.)
    const getBaseDomain = (domain) => {
        const parts = domain.split('.');
        if (parts.length >= 2) {
            return parts.slice(-2).join('.');
        }
        return domain;
    };
    
    // Check base domain match
    return getBaseDomain(d1) === getBaseDomain(d2);
}

// Check if URL should be blocked (with whitelist)
function shouldBlockUrl(url) {
    return new Promise((resolve) => {
        // Skip extension pages
        if (url.includes("forbidden.html") || 
            url.startsWith("chrome-extension://") ||
            url.startsWith("chrome://")) {
            resolve(false);
            return;
        }
        
        chrome.storage.local.get(['whitelist', 'enabled'], (result) => {
            const whitelist = result.whitelist || [];
            const isEnabled = result.enabled !== false;
            const currentDomain = getCleanDomain(url);
            
            if (!isEnabled || !currentDomain) {
                resolve(false);
                return;
            }
            
            // Check whitelist first - using domain matching
            for (let whitelistUrl of whitelist) {
                const whitelistDomain = getCleanDomain(whitelistUrl);
                if (domainsMatch(currentDomain, whitelistDomain)) {
                    console.log("Domain is whitelisted:", currentDomain, "matches", whitelistDomain);
                    resolve(false);
                    return;
                }
            }
            
            // Check forbidden domains
            for (let forbiddenDomain of forbiddenDomains) {

                // checking for forbidden domains first
                if (domainsMatch(currentDomain, forbiddenDomain)) {
                    console.log("Domain is forbidden:", currentDomain, "matches", forbiddenDomain);
                    resolve(true);
                    return;
                }

                // then checking for google play and other custom domains
                if (checkSpecificUrlPatterns(url)) {
                    resolve(true);
                    return;
                }
            }
        
            resolve(false);
        });
    });
}

// Check current page on load
if (!window.location.href.includes("forbidden.html") && 
    !window.location.href.startsWith("chrome-extension://") &&
    !window.location.href.startsWith("chrome://")) {
    
    shouldBlockUrl(window.location.href).then(shouldBlock => {
        if (shouldBlock) {
            console.log("Content script: Blocking current page");
            chrome.runtime.sendMessage({ action: "openForbiddenPage" });
        }
    });
}

// Listen for background.js messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkURL") {
        shouldBlockUrl(request.url).then(shouldBlock => {
            console.log("Content script: Checking URL", request.url, "-> Block:", shouldBlock);
            sendResponse({ shouldBlock: shouldBlock });
        });
        return true;
    }
    return true;
});