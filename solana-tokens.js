document.addEventListener('DOMContentLoaded', function() {
    const tokenListContainer = document.getElementById('token-list');
    const loadingIndicator = document.getElementById('loading');
  
    async function fetchSolanaTokens() {
      try {
        const response = await fetch('https://tokens.jup.ag/tokens_with_markets');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayTokens(data);
      } catch (error) {
        console.error('<span class="alert-negative">Error fetching Solana tokens:</span>', error);
        loadingIndicator.textContent = 'Failed to load tokens.';
      }
    }
  
    function displayTokens(tokens) {
      loadingIndicator.style.display = 'none';
      tokenListContainer.innerHTML = '';
  
      // Only display the most recent 8 tokens
      const recentTokens = tokens.slice(0, 5);
      recentTokens.forEach(token => {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'list-item';
        tokenItem.innerHTML = `
          <div><b>${token.name}</b> (${token.symbol})</div>
          <div>${token.address}</div>
          <div>MC: ${token.marketCap || 'N/A'}</div>
        `;
        tokenListContainer.appendChild(tokenItem);
      });
    }
  
    fetchSolanaTokens();
  });
  