document.addEventListener('DOMContentLoaded', function () {
    const sanctumLSTUrl = 'https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/master/sanctum-lst-list.toml';
    const lstTokenListContainer = document.getElementById('lst-token-list');
    const lstLoadingIndicator = document.getElementById('lst-loading');
    const lstSearchInput = document.getElementById('lst-search');
    const lstSortSelect = document.getElementById('lst-sort');
    let lstList = [];
    let lstAPYMap = {};  // Store APY values for sorting
    let lstTVLMap = {};  // Store TVL values for sorting
  
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
            await loadLSTData();  // Load APY and TVL data before displaying
            displayLSTList(lstList);
        } catch (error) {
            console.error('Error fetching Sanctum LST List:', error);
            lstLoadingIndicator.textContent = 'Failed to load LSTs';
        }
    }
  
    async function fetchAPY(symbol) {
      const apiUrl = `https://sanctum-extra-api.ngrok.dev/v1/apy/latest?lst=${symbol}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.apys && data.apys[symbol] !== undefined) {
          const apy = data.apys[symbol] * 100;  // Convert APY to percentage
          lstAPYMap[symbol] = apy;  // Store APY in map for sorting
          return `${apy.toFixed(2)}%`;  // Format with two decimal places
        } else {
          lstAPYMap[symbol] = null;
          return 'N/A';
        }
      } catch (error) {
        console.error(`Error fetching APY for ${symbol}:`, error);
        lstAPYMap[symbol] = null;
        return 'N/A';
      }
    }
  
    async function fetchTVL(symbol) {
      const apiUrl = `https://sanctum-extra-api.ngrok.dev/v1/tvl/current?lst=${symbol}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.tvls && data.tvls[symbol] !== undefined) {
          const tvl = Math.floor(parseFloat(data.tvls[symbol]) / 1e9);  // Convert TVL and round down
          lstTVLMap[symbol] = tvl;  // Store TVL in map for sorting
          return `${tvl.toLocaleString()} SOL`;  // Format TVL as SOL
        } else {
          lstTVLMap[symbol] = null;
          return 'N/A';
        }
      } catch (error) {
        console.error(`Error fetching TVL for ${symbol}:`, error);
        lstTVLMap[symbol] = null;
        return 'N/A';
      }
    }
  
    async function loadLSTData() {
      for (const item of lstList) {
        await fetchAPY(item.symbol);
        await fetchTVL(item.symbol);
      }
    }
  
    function sortLSTList(lstList, sortType) {
      if (sortType === 'apy-high') {
        return lstList.sort((a, b) => (lstAPYMap[b.symbol] || 0) - (lstAPYMap[a.symbol] || 0));
      } else if (sortType === 'apy-low') {
        return lstList.sort((a, b) => (lstAPYMap[a.symbol] || 0) - (lstAPYMap[b.symbol] || 0));
      } else if (sortType === 'tvl-high') {
        return lstList.sort((a, b) => (lstTVLMap[b.symbol] || 0) - (lstTVLMap[a.symbol] || 0));
      } else if (sortType === 'tvl-low') {
        return lstList.sort((a, b) => (lstTVLMap[a.symbol] || 0) - (lstTVLMap[b.symbol] || 0));
      }
      return lstList;  // Default to original order if no valid sort type
    }
  
    async function displayLSTList(lstList) {
        lstLoadingIndicator.style.display = 'none';  // Hide loading indicator
        lstTokenListContainer.innerHTML = '';  // Clear any existing content
        lstTokenListContainer.style.display = 'flex';  // Show the list container
    
        lstList = sortLSTList(lstList, lstSortSelect.value);  // Apply sorting
    
        for (const item of lstList) {
            const solscanUrl = `https://solscan.io/token/${item.mint}`;
            const sanctumTradeUrl = `https://app.sanctum.so/trade/SOL-${item.symbol}`;
            const jupiterSwapUrl = `https://jup.ag/swap/SOL-${item.symbol}`;
    
            const tokenItem = document.createElement('div');
            tokenItem.className = 'list-item';
    
            const logo = document.createElement('img');
            logo.src = item.logo_uri;
            logo.alt = `${item.name} logo`;
            logo.className = 'token-logo';
    
            const textContent = document.createElement('div');
            textContent.innerHTML = `<b>${item.name}</b> (${item.symbol})`;
    
            const apyElement = document.createElement('div');
            apyElement.className = 'apy-info';
            apyElement.innerHTML = `APY: ${lstAPYMap[item.symbol] ? lstAPYMap[item.symbol].toFixed(2) + '%' : 'N/A'}`;
  
            const tvlElement = document.createElement('div');
            tvlElement.className = 'tvl-info';
            tvlElement.innerHTML = `TVL: ${lstTVLMap[item.symbol] ? lstTVLMap[item.symbol].toLocaleString() + ' SOL' : 'N/A'}`;
  
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttons-container';
    
            // Trade Button with Tooltip
            const tradeButton = document.createElement('a');
            tradeButton.href = sanctumTradeUrl;
            tradeButton.target = '_blank';
            tradeButton.className = 'btn trade-button tooltip';
            tradeButton.innerHTML = `
                <img src="images/sanctum001.webp" alt="Swap on Sanctum" data-translate="swap_sanctum" class="button-icon">
                <span class="tooltiptext" data-translate="swap_sanctum">Swap on Sanctum</span>
            `;
    
            // Swap Button with Tooltip
            const swapButton = document.createElement('a');
            swapButton.href = jupiterSwapUrl;
            swapButton.target = '_blank';
            swapButton.className = 'btn swap-button tooltip';
            swapButton.innerHTML = `
                <img src="images/jupiter001.webp" alt="Swap on Jupiter" data-translate="swap_jupiter" class="button-icon">
                <span class="tooltiptext" data-translate="swap_jupiter">Swap on Jupiter</span>
            `;
    
            // Explorer Button with Tooltip
            const explorerButton = document.createElement('a');
            explorerButton.href = solscanUrl;
            explorerButton.target = '_blank';
            explorerButton.className = 'btn explorer-button tooltip';
            explorerButton.innerHTML = `
                <img src="images/solscan001.webp" alt="View on Solscan" data-translate="view_solscan" class="button-icon">
                <span class="tooltiptext" data-translate="view_solscan">View on Solscan</span>
            `;
    
            buttonsContainer.appendChild(tradeButton);
            buttonsContainer.appendChild(swapButton);
            buttonsContainer.appendChild(explorerButton);
    
            tokenItem.appendChild(logo);
            tokenItem.appendChild(textContent);
            tokenItem.appendChild(apyElement);  // Add the APY info
            tokenItem.appendChild(tvlElement);  // Add the TVL info
            tokenItem.appendChild(buttonsContainer);
    
            lstTokenListContainer.appendChild(tokenItem);
        }
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
  
    function filterLSTs() {
        const searchTerm = lstSearchInput.value.toLowerCase();
        const filteredList = lstList.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.symbol.toLowerCase().includes(searchTerm)
        );
        displayLSTList(filteredList);
    }
  
    // Attach event listener for search
    lstSearchInput.addEventListener('input', filterLSTs);
  
    // Attach event listener for sorting
    lstSortSelect.addEventListener('change', () => {
      lstSearchInput.value = '';  // Clear the search input when sorting changes
      displayLSTList(lstList);  // Re-render the list based on the sorting
    });
  
    // Fetch and display LSTs on page load
    fetchSanctumLSTList();
});