document.addEventListener('DOMContentLoaded', function () {
    const sanctumLSTUrl = 'https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/master/sanctum-lst-list.toml';
    const lstTokenListContainer = document.getElementById('lst-token-list');
    const lstLoadingIndicator = document.getElementById('lst-loading');
    const lstSearchInput = document.getElementById('lst-search');
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
          tokenItem.appendChild(buttonsContainer);

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

  // Fetch and display LSTs on page load
  fetchSanctumLSTList();
});