document.addEventListener('DOMContentLoaded', function () {
    const sanctumLSTUrl = 'https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/master/sanctum-lst-list.toml';
    const lstTokenListContainer = document.getElementById('lst-token-list');
    const lstLoadingIndicator = document.getElementById('lst-loading');

    async function fetchSanctumLSTList() {
        try {
            lstLoadingIndicator.style.display = 'block';  // Show loading indicator
            lstTokenListContainer.style.display = 'none';  // Hide the list container

            const response = await fetch(sanctumLSTUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = response.text();
            const lstList = parseTOML(await data);
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
            const tokenItem = document.createElement('div');
            tokenItem.className = 'list-item';

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

        return items.filter(item => item.name && item.symbol);
    }

    function openTab(evt, tabName) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        
        const tablinks = document.getElementsByClassName("tablink");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }

        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.classList.add("active");
        
        if (tabName === "SanctumLSTs") {
            fetchSanctumLSTList();
        }
    }

    // Attach event listeners to the tab buttons
    document.getElementById('solanaTokensTab').addEventListener('click', function(event) {
        openTab(event, 'SolanaTokens');
    });
    
    document.getElementById('sanctumLSTsTab').addEventListener('click', function(event) {
        openTab(event, 'SanctumLSTs');
    });

    // Set default tab open
    document.getElementById('solanaTokensTab').click();
});
