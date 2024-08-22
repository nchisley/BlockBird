document.addEventListener('DOMContentLoaded', function () {
    const sanctumLSTUrl = 'https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/master/sanctum-lst-list.toml';
    const lstTokenListContainer = document.getElementById('lst-token-list');
    const lstLoadingIndicator = document.getElementById('lst-loading');
    const lstSearchInput = document.getElementById('lst-search');
    const tokenSearchContainer = document.getElementById('token-search-container');
    const lstSearchContainer = document.getElementById('lst-search-container');
    const tabSelector = document.getElementById('tabSelector');
    let lstList = [];

    async function fetchSanctumLSTList() {
        try {
            lstLoadingIndicator.style.display = 'block';  // Show loading indicator
            lstTokenListContainer.style.display = 'none';  // Hide the list container

            const response = await fetch(sanctumLSTUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            lstList = parseTOML(data);
            displayLSTList(lstList);
        } catch (error) {
            console.error('Error fetching Sanctum LST List:', error);
            lstLoadingIndicator.textContent = 'Failed to load LSTs';
        }
    }

    function displayLSTList(lstList) {
        lstLoadingIndicator.style.display = 'none';  // Hide loading indicator
        lstTokenListContainer.innerHTML = '';  // Clear any existing content
        lstTokenListContainer.style.display = 'flex';  // Show the list container
    
        lstList.forEach(item => {
            const solscanUrl = `https://solscan.io/token/${item.mint}`;
    
            const tokenItem = document.createElement('a');
            tokenItem.className = 'list-item';
            tokenItem.href = solscanUrl;
            tokenItem.target = '_blank';  // Open in a new tab
            tokenItem.style.textDecoration = 'none';  // Remove underline from the link
    
            const logo = document.createElement('img');
            logo.src = item.logo_uri;
            logo.alt = `${item.name} logo`;
            logo.className = 'token-logo';
    
            const textContent = document.createElement('div');
            textContent.innerHTML = `<b>${item.name}</b> (${item.symbol})`;
    
            tokenItem.appendChild(logo);
            tokenItem.appendChild(textContent);
    
            lstTokenListContainer.appendChild(tokenItem);
        });
    }    

    function parseTOML(data) {
        const items = [];
        const lines = data.split('\n');
        let currentItem = {};

        lines.forEach(line => {
            if (line.startsWith('[')) {
                if (Object.keys(currentItem).length > 0) {
                    items.push(currentItem);
                    currentItem = {};
                }
            } else if (line.includes('=')) {
                const [key, value] = line.split('=').map(s => s.trim());
                currentItem[key.toLowerCase()] = value.replace(/['"]/g, '');
            }
        });

        if (Object.keys(currentItem).length > 0) {
            items.push(currentItem);
        }

        return items.filter(item => item.name && item.symbol && item.mint);
    }

    function openTab(tabName) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        document.getElementById(tabName).style.display = "block";

        // Toggle the search input visibility
        if (tabName === "SanctumLSTs") {
            lstSearchContainer.style.display = 'flex';
            tokenSearchContainer.style.display = 'none';
            fetchSanctumLSTList();
        } else {
            lstSearchContainer.style.display = 'none';
            tokenSearchContainer.style.display = 'flex';
        }
    }

    function filterLSTs() {
        const searchTerm = lstSearchInput.value.toLowerCase();
        const filteredList = lstList.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.symbol.toLowerCase().includes(searchTerm)
        );
        displayLSTList(filteredList);
    }

    // Attach event listener for tab selection
    tabSelector.addEventListener('change', function () {
        openTab(tabSelector.value);
    });

    // Attach event listener for search
    lstSearchInput.addEventListener('input', filterLSTs);

    // Set default tab open
    openTab(tabSelector.value);
});
