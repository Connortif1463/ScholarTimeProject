// settingsPopup.js
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    
    // Load saved state
    chrome.storage.local.get(['enabled'], (result) => {
        const isEnabled = result.enabled !== false;
        toggleSwitch.checked = isEnabled;
    });
    
    // Save state when toggled
    toggleSwitch.addEventListener('change', function() {
        chrome.storage.local.set({ enabled: this.checked });
    });

    // ========== WHITELIST FUNCTIONALITY ==========
    
    const dropBtn = document.querySelector('.dropbtn');
    const dropdown = document.getElementById('whitelistDropdown');
    const searchAddInput = document.getElementById('searchAddInput');
    const addFromSearchBtn = document.getElementById('addFromSearchBtn');
    const whitelistItems = document.getElementById('whitelistItems');
    let currentWhitelist = [];
    let currentSearchTerm = '';

    // Toggle dropdown
    if (dropBtn) {
        dropBtn.addEventListener('click', function() {
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) {
                setTimeout(() => searchAddInput.focus(), 100);
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown') && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            searchAddInput.value = '';
            addFromSearchBtn.classList.remove('show');
            loadWhitelistItems();
        }
    });

    // Helper function to get clean domain (same as other files)
    function getCleanDomain(url) {
        try {
            let domain = url.replace(/^(https?:\/\/)?/, '');
            domain = domain.replace(/^www\./, '');
            domain = domain.split('/')[0];
            domain = domain.split(':')[0];
            return domain.toLowerCase();
        } catch (e) {
            return '';
        }
    }

    // Search/Add input functionality
    if (searchAddInput) {
        searchAddInput.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            
            if (!currentSearchTerm) {
                addFromSearchBtn.classList.remove('show');
                loadWhitelistItems();
                return;
            }
            
            // Format for display
            let displayDomain = getCleanDomain(currentSearchTerm);
            if (!displayDomain) {
                displayDomain = currentSearchTerm;
            }
            
            // Check if domain already exists in whitelist
            const isInWhitelist = currentWhitelist.some(url => {
                const whitelistDomain = getCleanDomain(url);
                return whitelistDomain === displayDomain;
            });
            
            if (isInWhitelist) {
                addFromSearchBtn.classList.remove('show');
                filterWhitelist(currentSearchTerm);
            } else {
                addFromSearchBtn.textContent = `Add "${displayDomain}"`;
                addFromSearchBtn.classList.add('show');
                filterWhitelist(currentSearchTerm);
            }
        });
        
        // Add on Enter key
        searchAddInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && addFromSearchBtn.classList.contains('show')) {
                addFromSearchBtn.click();
            }
        });
    }

    // Add button functionality - stores as https://domain.com/
    if (addFromSearchBtn) {
        addFromSearchBtn.addEventListener('click', function() {
            if (!currentSearchTerm) return;
            
            // Get clean domain
            let domain = getCleanDomain(currentSearchTerm);
            if (!domain) {
                alert('Please enter a valid domain (e.g., youtube.com)');
                return;
            }
            
            // Format for storage
            const formattedUrl = 'https://' + domain + '/';
            
            // Add to whitelist
            chrome.storage.local.get(['whitelist'], function(result) {
                const whitelist = result.whitelist || [];
                
                // Check if domain already exists (case-insensitive)
                const alreadyExists = whitelist.some(existingUrl => {
                    const existingDomain = getCleanDomain(existingUrl);
                    return existingDomain === domain;
                });
                
                if (alreadyExists) {
                    alert('This domain is already in the whitelist');
                    return;
                }
                
                whitelist.push(formattedUrl);
                
                chrome.storage.local.set({ whitelist: whitelist }, function() {
                    searchAddInput.value = '';
                    currentSearchTerm = '';
                    addFromSearchBtn.classList.remove('show');
                    
                    updateWhitelistCount(whitelist.length);
                    loadWhitelistItems();
                    
                    searchAddInput.focus();
                });
            });
        });
    }

    // Helper function to format URL for display
    function formatDisplayUrl(url) {
        const domain = getCleanDomain(url);
        return domain || url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    // Filter whitelist based on search
    function filterWhitelist(searchTerm) {
        if (!searchTerm) {
            loadWhitelistItems();
            return;
        }
        
        const filtered = currentWhitelist.filter(url => {
            const domain = getCleanDomain(url);
            return domain.includes(searchTerm) || url.includes(searchTerm);
        });
        
        displayWhitelistItems(filtered, searchTerm);
    }

    // Load and display whitelist items
    function loadWhitelistItems() {
        chrome.storage.local.get(['whitelist'], function(result) {
            currentWhitelist = result.whitelist || [];
            displayWhitelistItems(currentWhitelist, '');
        });
    }

    // Display whitelist items
    function displayWhitelistItems(items, searchTerm) {
        whitelistItems.innerHTML = '';
        
        if (items.length === 0) {
            if (searchTerm) {
                whitelistItems.innerHTML = `
                    <div class="no-results">
                        No websites found matching "${searchTerm}"
                    </div>
                `;
            } else {
                whitelistItems.innerHTML = `
                    <div class="no-results">
                        No websites in whitelist. Search and add one above.
                    </div>
                `;
            }
            return;
        }
        
        items.forEach((url, index) => {
            const originalIndex = currentWhitelist.indexOf(url);
            const item = document.createElement('div');
            item.className = 'whitelist-item';
            
            const displayUrl = formatDisplayUrl(url);
            
            item.innerHTML = `
                <span class="whitelist-url" title="${url}">${displayUrl}</span>
                <button class="remove-btn" data-index="${originalIndex}">Remove</button>
            `;
            
            whitelistItems.appendChild(item);
        });
        
        // Add remove button listeners
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromWhitelist(index);
            });
        });
    }

    // Remove from whitelist
    function removeFromWhitelist(index) {
        chrome.storage.local.get(['whitelist'], function(result) {
            const whitelist = result.whitelist || [];
            
            if (index >= 0 && index < whitelist.length) {
                whitelist.splice(index, 1);
                
                chrome.storage.local.set({ whitelist: whitelist }, function() {
                    updateWhitelistCount(whitelist.length);
                    
                    if (currentSearchTerm) {
                        filterWhitelist(currentSearchTerm);
                    } else {
                        loadWhitelistItems();
                    }
                });
            }
        });
    }

    // Update dropdown button text
    function updateWhitelistCount(count) {
        if (dropBtn) {
            dropBtn.textContent = `View Whitelist (${count} ${count === 1 ? 'site' : 'sites'})`;
        }
    }

    // Initial load
    loadWhitelistItems();
    chrome.storage.local.get(['whitelist'], function(result) {
        const whitelist = result.whitelist || [];
        updateWhitelistCount(whitelist.length);
    });
});