document.addEventListener('DOMContentLoaded', function () {
    const sanctumLSTUrl = 'https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/master/sanctum-lst-list.toml';
    const lstTokenListContainer = document.getElementById('lst-token-list');
    const lstSearchInput = document.getElementById('lst-search');
    const lstSortSelect = document.getElementById('lst-sort');
    const progressBar = document.getElementById('lst-progress-bar');
    const progressText = document.getElementById('lst-progress-text');
    const progressContainer = document.getElementById('lst-progress-container');
    const refreshButton = document.getElementById('lst-refresh');
    const CACHE_KEY = 'cachedLSTData';
    const CACHE_APY_KEY = 'cachedAPYData';
    const CACHE_TVL_KEY = 'cachedTVLData';
    const CACHE_TIMESTAMP_KEY = 'cachedLSTTimestamp';
    const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;
    let lstList = [];
    let lstAPYMap = {};
    let lstTVLMap = {};

    // Elements for Chart Modal
    const performanceModal = document.getElementById('performanceModal');
    const closeModal = document.getElementById('closeModal');
    const performanceChartCanvas = document.getElementById('performanceChart').getContext('2d');
    let chartInstance = null;

    // Simulated historical data for the chart (replace with real API later)
    const historicalData = {
        "fpSOL": {
            dates: ["2023-09-01", "2023-09-08", "2023-09-15", "2023-09-22", "2023-09-29"],
            apy: [4.5, 4.7, 4.6, 4.8, 5.0],
            tvl: [1000, 1500, 1200, 1800, 2000]
        },
        "wifSOL": {
            dates: ["2023-09-01", "2023-09-08", "2023-09-15", "2023-09-22", "2023-09-29"],
            apy: [2.3, 2.4, 2.2, 2.5, 2.6],
            tvl: [500, 700, 600, 800, 900]
        }
    };

    // Function to open the chart modal for a specific LST
    function openPerformanceModal(symbol) {
        performanceModal.style.display = 'block';
        
        const data = historicalData[symbol];
        if (!data) {
            alert('No historical data available for this LST.');
            return;
        }
    
        const chartTitle = `Performance of ${symbol}`;  // Dynamic title based on the LST symbol
        
        // Update buttons
        const sanctumTradeUrl = `https://app.sanctum.so/trade/SOL-${symbol}`;
        const jupiterSwapUrl = `https://jup.ag/swap/SOL-${symbol}`;
        const solscanUrl = `https://solscan.io/token/${symbol}`;
    
        // Get the container for buttons and add them
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons-container';
    
        // Sanctum trade button
        const tradeButton = document.createElement('a');
        tradeButton.href = sanctumTradeUrl;
        tradeButton.target = '_blank';
        tradeButton.className = 'btn trade-button tooltip';
        tradeButton.innerHTML = `
            <img src="images/sanctum001.webp" alt="Swap on Sanctum" data-translate="swap_sanctum" class="button-icon">
            <span class="tooltiptext" data-translate="swap_sanctum">Swap on Sanctum</span>
        `;
    
        // Jupiter swap button
        const swapButton = document.createElement('a');
        swapButton.href = jupiterSwapUrl;
        swapButton.target = '_blank';
        swapButton.className = 'btn swap-button tooltip';
        swapButton.innerHTML = `
            <img src="images/jupiter001.webp" alt="Swap on Jupiter" data-translate="swap_jupiter" class="button-icon">
            <span class="tooltiptext" data-translate="swap_jupiter">Swap on Jupiter</span>
        `;
    
        // Solscan explorer button
        const explorerButton = document.createElement('a');
        explorerButton.href = solscanUrl;
        explorerButton.target = '_blank';
        explorerButton.className = 'btn explorer-button tooltip';
        explorerButton.innerHTML = `
            <img src="images/solscan001.webp" alt="View on Solscan" data-translate="view_solscan" class="button-icon">
            <span class="tooltiptext" data-translate="view_solscan">View on Solscan</span>
        `;
    
        // Append buttons to the buttons container
        buttonsContainer.appendChild(tradeButton);
        buttonsContainer.appendChild(swapButton);
        buttonsContainer.appendChild(explorerButton);
    
        // Get the modal content container and insert the buttons before the chart
        const modalContent = document.querySelector('.modal-content');
        modalContent.insertBefore(buttonsContainer, modalContent.firstChild);
    
        // Create chart after buttons
        const chartData = {
            labels: data.dates,
            datasets: [{
                label: 'APY (%)',
                data: data.apy,
                borderColor: '#00ab33',
                backgroundColor: '#00ab33',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'TVL (SOL)',
                data: data.tvl,
                borderColor: '#94E5A0',
                backgroundColor: '#94E5A0',
                borderWidth: 1,
                yAxisID: 'y1'
            }]
        };
    
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                    },
                    title: {
                        display: true,
                        text: '',
                        color: '#ffffff'
                    }
                },
                y1: {
                    ticks: {
                        color: '#94E5A0',
                    },
                    title: {
                        display: true,
                        text: 'TVL (SOL)',
                        color: '#94E5A0'
                    }
                },
                y: {
                    ticks: {
                        color: '#00ab33',
                    },
                    title: {
                        display: true,
                        text: 'APY (%)',
                        color: '#00ab33'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    color: '#ffffff',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        color: '#bbbbbb',
                        font: {
                            size: 12
                        },
                        boxWidth: 20,  // Box size of legend markers
                        padding: 20    // Space between legend items
                    }
                }
            }
        };
    
        if (chartInstance) {
            chartInstance.destroy();  // Destroy previous chart instance
        }
    
        chartInstance = new Chart(performanceChartCanvas, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }        

    // Close the modal
    closeModal.onclick = function () {
        performanceModal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target == performanceModal) {
            performanceModal.style.display = 'none';
        }
    };

    // Progress bar and caching functionality remains unchanged
    function updateProgressBar(percentage) {
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }

    function hideProgressBar() {
        progressContainer.style.display = 'none';
    }

    function showProgressBar() {
        progressContainer.style.display = 'block';
        updateProgressBar(0);
    }

    function clearLSTCache() {
        chrome.storage.local.remove([CACHE_KEY, CACHE_APY_KEY, CACHE_TVL_KEY, CACHE_TIMESTAMP_KEY], function() {
            console.log('Caches cleared: LSTs, APY, TVL');
        });
    }

    function refreshLSTData() {
        clearLSTCache();
        lstTokenListContainer.innerHTML = '';
        showProgressBar();
        loadSanctumLSTList();
    }

    refreshButton.addEventListener('click', refreshLSTData);

    async function isCacheValid() {
        const timestamp = await getFromStorage(CACHE_TIMESTAMP_KEY);
        if (!timestamp) return false;
        const age = Date.now() - timestamp;
        return age < CACHE_EXPIRATION_MS;
    }

    async function getFromStorage(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], function(result) {
                resolve(result[key]);
            });
        });
    }

    async function saveToStorage(key, data) {
        return new Promise((resolve) => {
            let obj = {};
            obj[key] = data;
            chrome.storage.local.set(obj, function() {
                resolve();
            });
        });
    }

    async function loadSanctumLSTList() {
        const cachedData = await getFromStorage(CACHE_KEY);
        const cachedAPY = await getFromStorage(CACHE_APY_KEY);
        const cachedTVL = await getFromStorage(CACHE_TVL_KEY);
        
        if (cachedData) {
            console.log('Displaying cached LST data immediately');
            lstList = cachedData;
            lstAPYMap = cachedAPY || {};
            lstTVLMap = cachedTVL || {};
            hideProgressBar();
            displayLSTList(lstList);
        }

        const cacheValid = await isCacheValid();
        
        if (!cacheValid) {
            console.log('Cache expired. Fetching new LST data from API');
            showProgressBar();
            await fetchSanctumLSTList();
        }
    }

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

    // Sort function for LSTs
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
        return lstList;
    }

    async function displayLSTList(lstList) {
        lstTokenListContainer.innerHTML = '';  // Clear any existing content
        lstTokenListContainer.style.display = 'flex';  // Show the list container

        lstList = sortLSTList(lstList, lstSortSelect.value);  // Apply sorting
        const lstTotalElement = document.getElementById('lst-total');
        lstTotalElement.textContent = `${lstList.length}`;  // Update total count

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
            textContent.className = 'name-symbol';
            textContent.innerHTML = `<b>${item.name}</b> (${item.symbol})`;

            const apyElement = document.createElement('div');
            apyElement.className = 'apy-info';
            apyElement.innerHTML = `APY: ${lstAPYMap[item.symbol] ? lstAPYMap[item.symbol].toFixed(2) + '%' : 'N/A'}`;

            const tvlElement = document.createElement('div');
            tvlElement.className = 'tvl-info';
            tvlElement.innerHTML = `TVL: ${lstTVLMap[item.symbol] ? lstTVLMap[item.symbol].toLocaleString() + ' SOL' : 'N/A'}`;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttons-container';

            // Sanctum trade button
            const tradeButton = document.createElement('a');
            tradeButton.href = sanctumTradeUrl;
            tradeButton.target = '_blank';
            tradeButton.className = 'btn trade-button tooltip';
            tradeButton.innerHTML = `
                <img src="images/sanctum001.webp" alt="Swap on Sanctum" data-translate="swap_sanctum" class="button-icon">
                <span class="tooltiptext" data-translate="swap_sanctum">Swap on Sanctum</span>
            `;

            // Jupiter swap button
            const swapButton = document.createElement('a');
            swapButton.href = jupiterSwapUrl;
            swapButton.target = '_blank';
            swapButton.className = 'btn swap-button tooltip';
            swapButton.innerHTML = `
                <img src="images/jupiter001.webp" alt="Swap on Jupiter" data-translate="swap_jupiter" class="button-icon">
                <span class="tooltiptext" data-translate="swap_jupiter">Swap on Jupiter</span>
            `;

            // Solscan explorer button
            const explorerButton = document.createElement('a');
            explorerButton.href = solscanUrl;
            explorerButton.target = '_blank';
            explorerButton.className = 'btn explorer-button tooltip';
            explorerButton.innerHTML = `
                <img src="images/solscan001.webp" alt="View on Solscan" data-translate="view_solscan" class="button-icon">
                <span class="tooltiptext" data-translate="view_solscan">View on Solscan</span>
            `;

            // Performance view button (using image)
            const viewPerformanceButton = document.createElement('a');
            viewPerformanceButton.href = '#';
            viewPerformanceButton.className = 'btn performance-button tooltip';
            viewPerformanceButton.innerHTML = `
                <img src="images/chart-icon-001.jpg" alt="View Performance" data-translate="view_performance" class="button-icon">
                <span class="tooltiptext" data-translate="view_performance">View Performance</span>
            `;
            viewPerformanceButton.onclick = (e) => {
                e.preventDefault();  // Prevent the link from navigating
                openPerformanceModal(item.symbol);  // Call modal function
            };

            // Append all buttons to the container
            buttonsContainer.appendChild(tradeButton);
            buttonsContainer.appendChild(swapButton);
            buttonsContainer.appendChild(explorerButton);
            buttonsContainer.appendChild(viewPerformanceButton);

            // Append all elements to the token item
            tokenItem.appendChild(logo);
            tokenItem.appendChild(textContent);
            tokenItem.appendChild(apyElement);
            tokenItem.appendChild(tvlElement);
            tokenItem.appendChild(buttonsContainer);

            // Append the token item to the list container
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

    lstSearchInput.addEventListener('input', filterLSTs);
    lstSortSelect.addEventListener('change', () => {
        lstSearchInput.value = '';
        displayLSTList(lstList);
    });

    loadSanctumLSTList();
});
