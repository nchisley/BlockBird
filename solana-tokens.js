document.addEventListener('DOMContentLoaded', function () {
    const tokenButton = document.getElementById('tokenButton');
    const lstButton = document.getElementById('lstButton');
    const solanaTokensTab = document.getElementById('SolanaTokens');
    const sanctumLstsTab = document.getElementById('SanctumLSTs');
    const tokenSearchContainer = document.getElementById('token-search-container');
    const lstSearchContainer = document.getElementById('lst-search-container');
    
    // Initially display Token tab
    solanaTokensTab.style.display = 'flex';
    sanctumLstsTab.style.display = 'none';
    tokenSearchContainer.style.display = 'flex';
    lstSearchContainer.style.display = 'none';
  
    tokenButton.addEventListener('click', () => {
      solanaTokensTab.style.display = 'flex';
      sanctumLstsTab.style.display = 'none';
      tokenSearchContainer.style.display = 'flex';
      lstSearchContainer.style.display = 'none';
    });
  
    lstButton.addEventListener('click', () => {
      solanaTokensTab.style.display = 'none';
      sanctumLstsTab.style.display = 'flex';
      tokenSearchContainer.style.display = 'none';
      lstSearchContainer.style.display = 'flex';
    });
  
    // Original solana-tokens.js content (unchanged)
    const tokenListContainer = document.getElementById('token-list');
    const loadingIndicator = document.getElementById('loading');
    const tokenSearchInput = document.getElementById('token-search');
    let tokenList = [];
  
    async function fetchSolanaTokens() {
        try {
            const response = await fetch('https://tokens.jup.ag/tokens_with_markets');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            tokenList = data;
            displayTokens(tokenList);
        } catch (error) {
            console.error('Error fetching Solana tokens:', error);
            loadingIndicator.textContent = 'Failed to load tokens.';
        }
    }
  
    function displayTokens(tokens) {
      loadingIndicator.style.display = 'none';
      tokenListContainer.innerHTML = '';
      const recentTokens = tokens.slice(0, 10);
  
      recentTokens.forEach(token => {
          const solscanUrl = `https://solscan.io/token/${token.address}`;
  
          const tokenItem = document.createElement('a');
          tokenItem.className = 'list-item';
          tokenItem.href = solscanUrl;
          tokenItem.target = '_blank';
          tokenItem.style.textDecoration = 'none';
  
          const textContent = document.createElement('div');
          textContent.innerHTML = `
              <div><b>${token.name}</b> (${token.symbol})</div>
              <div class="token-address">${token.address}</div>`;
  
          tokenItem.appendChild(textContent);
          tokenListContainer.appendChild(tokenItem);
      });
    }
  
    function filterTokens() {
        const searchTerm = tokenSearchInput.value.toLowerCase();
        const filteredList = tokenList.filter(token => 
            token.name.toLowerCase().includes(searchTerm) || 
            token.symbol.toLowerCase().includes(searchTerm)
        );
        displayTokens(filteredList);
    }
  
    tokenSearchInput.addEventListener('input', filterTokens);
  
    fetchSolanaTokens();
  });
  