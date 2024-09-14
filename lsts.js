document.addEventListener('DOMContentLoaded', function () {
  const sanctumLSTUrl = 'https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/master/sanctum-lst-list.toml';
  const lstTokenListContainer = document.getElementById('lst-token-list');
  const lstSearchInput = document.getElementById('lst-search');
  const lstSortSelect = document.getElementById('lst-sort');
  const progressBar = document.getElementById('lst-progress-bar');
  const progressText = document.getElementById('lst-progress-text');
  const progressContainer = document.getElementById('lst-progress-container');
  const refreshButton = document.getElementById('lst-refresh');  // Reference to the refresh icon
  const CACHE_KEY = 'cachedLSTData';
  const CACHE_APY_KEY = 'cachedAPYData';
  const CACHE_TVL_KEY = 'cachedTVLData';
  const CACHE_TIMESTAMP_KEY = 'cachedLSTTimestamp';
  const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;
  let lstList = [];
  let lstAPYMap = {};
  let lstTVLMap = {};

  // Progress bar update function
  function updateProgressBar(percentage) {
    progressBar.style.width = percentage + '%';
    progressText.textContent = percentage + '%';
  }

  // Hide the progress bar container
  function hideProgressBar() {
    progressContainer.style.display = 'none';
  }

  // Show the progress bar container
  function showProgressBar() {
    progressContainer.style.display = 'block';
    updateProgressBar(0);  // Reset progress bar to 0 when shown
  }

  // Clear the cache (LSTs, APY, and TVL)
  function clearLSTCache() {
    chrome.storage.local.remove([CACHE_KEY, CACHE_APY_KEY, CACHE_TVL_KEY, CACHE_TIMESTAMP_KEY], function() {
      console.log('Caches cleared: LSTs, APY, TVL');
    });
  }

  // Refresh LST data by clearing cache and re-fetching
  function refreshLSTData() {
    clearLSTCache();  // Clear the caches
    lstTokenListContainer.innerHTML = '';  // Clear the list display
    showProgressBar();  // Show progress bar and reset progress
    loadSanctumLSTList();  // Re-fetch the data
  }

  // Attach event listener to refresh button
  refreshButton.addEventListener('click', refreshLSTData);  // Add click listener to trigger refresh

  // Check if cached data is valid (within 24 hours)
  async function isCacheValid() {
    const timestamp = await getFromStorage(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    const age = Date.now() - timestamp;
    return age < CACHE_EXPIRATION_MS;
  }

  // Function to get data from chrome.local.storage
  async function getFromStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function(result) {
        resolve(result[key]);
      });
    });
  }

  // Function to save data to chrome.local.storage
  async function saveToStorage(key, data) {
    return new Promise((resolve) => {
      let obj = {};
      obj[key] = data;
      chrome.storage.local.set(obj, function() {
        resolve();
      });
    });
  }

  // Load cached LST list immediately and fetch new data if cache is expired
  async function loadSanctumLSTList() {
    const cachedData = await getFromStorage(CACHE_KEY);
    const cachedAPY = await getFromStorage(CACHE_APY_KEY);
    const cachedTVL = await getFromStorage(CACHE_TVL_KEY);
    
    if (cachedData) {
      console.log('Displaying cached LST data immediately');
      lstList = cachedData;
      lstAPYMap = cachedAPY || {};
      lstTVLMap = cachedTVL || {};
      hideProgressBar();  // Hide progress bar when cached data is shown
      displayLSTList(lstList);
    }

    const cacheValid = await isCacheValid();
    
    if (!cacheValid) {
      console.log('Cache expired. Fetching new LST data from API');
      showProgressBar();
      await fetchSanctumLSTList();
    }
  }

  // Cache the LST data along with APY and TVL maps
  async function cacheLSTData() {
    await saveToStorage(CACHE_KEY, lstList);
    await saveToStorage(CACHE_APY_KEY, lstAPYMap);
    await saveToStorage(CACHE_TVL_KEY, lstTVLMap);
    await saveToStorage(CACHE_TIMESTAMP_KEY, Date.now());
  }

  async function fetchSanctumLSTList() {
      try {
          lstTokenListContainer.style.display = 'none';
          updateProgressBar(0);

          const response = await fetch(sanctumLSTUrl);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.text();
          lstList = parseTOML(data);

          updateProgressBar(50);  

          await loadLSTData();
          await cacheLSTData();
          displayLSTList(lstList);

          updateProgressBar(100);  

          setTimeout(() => {
            hideProgressBar();
          }, 500);
      } catch (error) {
          console.error('Error fetching Sanctum LST List:', error);
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
        const apy = data.apys[symbol] * 100;
        lstAPYMap[symbol] = apy;
        return `${apy.toFixed(2)}%`;
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
        const tvl = Math.floor(parseFloat(data.tvls[symbol]) / 1e9);
        lstTVLMap[symbol] = tvl;
        return `${tvl.toLocaleString()} SOL`;
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
    const totalItems = lstList.length;
    let loadedItems = 0;

    for (const item of lstList) {
      await fetchAPY(item.symbol);
      await fetchTVL(item.symbol);
      loadedItems++;

      updateProgressBar(Math.floor((loadedItems / totalItems) * 100));
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
    lstTokenListContainer.innerHTML = '';  // Clear any existing content
    lstTokenListContainer.style.display = 'flex';  // Show the list container
  
    lstList = sortLSTList(lstList, lstSortSelect.value);  // Apply sorting

    // Update the total count next to the refresh icon
    const lstTotalElement = document.getElementById('lst-total');
    lstTotalElement.textContent = `${lstList.length}`;

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
      textContent.className = 'name-symbol';  // Add the name-symbol class for styling
      textContent.innerHTML = `<b>${item.name}</b> (${item.symbol})`;

      const apyElement = document.createElement('div');
      apyElement.className = 'apy-info';
      apyElement.innerHTML = `APY: ${lstAPYMap[item.symbol] ? lstAPYMap[item.symbol].toFixed(2) + '%' : 'N/A'}`;

      const tvlElement = document.createElement('div');
      tvlElement.className = 'tvl-info';
      tvlElement.innerHTML = `TVL: ${lstTVLMap[item.symbol] ? lstTVLMap[item.symbol].toLocaleString() + ' SOL' : 'N/A'}`;

      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'buttons-container';

      const tradeButton = document.createElement('a');
      tradeButton.href = sanctumTradeUrl;
      tradeButton.target = '_blank';
      tradeButton.className = 'btn trade-button tooltip';
      tradeButton.innerHTML = `
          <img src="images/sanctum001.webp" alt="Swap on Sanctum" data-translate="swap_sanctum" class="button-icon">
          <span class="tooltiptext" data-translate="swap_sanctum">Swap on Sanctum</span>
      `;

      const swapButton = document.createElement('a');
      swapButton.href = jupiterSwapUrl;
      swapButton.target = '_blank';
      swapButton.className = 'btn swap-button tooltip';
      swapButton.innerHTML = `
          <img src="images/jupiter001.webp" alt="Swap on Jupiter" data-translate="swap_jupiter" class="button-icon">
          <span class="tooltiptext" data-translate="swap_jupiter">Swap on Jupiter</span>
      `;

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
      tokenItem.appendChild(textContent);  // Add name and symbol div
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

  // Fetch and display LSTs on page load (with caching)
  loadSanctumLSTList();
});
