const extpay = ExtPay('blockbird');

document.addEventListener('DOMContentLoaded', function() {
  extpay.getUser().then(user => {
    if (user.paid) {
      initializeScanner();
    } else {
      document.body.innerHTML = `
        <div class="header">
          <h1>Scanner</h1>
          <p>This feature is for BlockBirds only.</p>
        </div>
        <div class="content description-locked">
          <p>Scan any webpage for the keywords "airdrop", "points", and "rewards" and see a count of occurrences with highlighting on the page.</p>
          <button id="payment-button">Become a BlockBird for $9.99</button>
          <div id="alert" class="alert"></div>
        </div>
        <div class="footer">
          <div id="nav-container"></div>
        </div>
      `;
      document.getElementById('payment-button').addEventListener('click', () => {
        extpay.openPaymentPage();
      });
      populateNavLinks(); // Ensure the nav links are populated even if the user hasn't paid
    }
  }).catch(err => {
    showAlert("Error fetching data :( Check that your ExtensionPay id is correct and you're connected to the internet.");
  });

  function initializeScanner() {
    const scanButton = document.getElementById('scan-button');
    const clearButton = document.getElementById('clear-button');
    const resultsContainer = document.getElementById('results');
    const loadingIndicator = document.getElementById('loading');
    const countContainer = document.getElementById('count');
    const currentUrlContainer = document.getElementById('current-url');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      currentUrlContainer.textContent = `Current URL: ${tabs[0].url}`;
    });

    scanButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        showLoading(true);
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: scanAndHighlightPage,
            args: [getHighlightCSS()]
          },
          (results) => {
            showLoading(false);
            if (results && results[0] && results[0].result) {
              const { counts } = results[0].result;
              displayCounts(counts);
              toggleButtons();
            } else {
              showAlert('Error scanning the page.<br />This type of webpage is not able to be scanned.');
            }
          }
        );
      });
    });

    clearButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: clearHighlighting
          },
          () => {
            clearResults();
            toggleButtons();
          }
        );
      });
    });

    function scanAndHighlightPage(css) {
      const keywords = ['airdrop', 'points', 'rewards'];
      const counts = { airdrop: 0, points: 0, rewards: 0 };

      function isVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      }

      function scanAndHighlightElement(element) {
        if (element.nodeType === Node.TEXT_NODE && isVisible(element.parentElement)) {
          const textContent = element.textContent.toLowerCase();
          const parent = element.parentNode;

          keywords.forEach((keyword) => {
            let index = textContent.indexOf(keyword);
            while (index !== -1) {
              counts[keyword]++;
              index = textContent.indexOf(keyword, index + 1);
            }
          });

          const highlightedText = element.textContent.replace(
            new RegExp(`(${keywords.join('|')})`, 'gi'),
            '<span class="highlight">$1</span>'
          );

          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = highlightedText;

          while (tempContainer.firstChild) {
            parent.insertBefore(tempContainer.firstChild, element);
          }
          parent.removeChild(element);
        } else if (element.nodeType === Node.ELEMENT_NODE) {
          element.childNodes.forEach(scanAndHighlightElement);
        }
      }

      // Inject the CSS into the page
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);

      scanAndHighlightElement(document.body);

      return { counts };
    }

    function getHighlightCSS() {
      return `
        .highlight {
          background-color: yellow;
          font-weight: bold;
        }
      `;
    }

    function clearHighlighting() {
      const highlightedElements = document.querySelectorAll('.highlight');
      highlightedElements.forEach(element => {
        const parent = element.parentNode;
        parent.replaceChild(document.createTextNode(element.textContent), element);
        parent.normalize();
      });
    }

    function displayCounts(counts) {
      const getColor = (count) => count === 0 ? '#990000' : 'green';

      if (counts.airdrop === 0 && counts.points === 0 && counts.rewards === 0) {
        countContainer.innerHTML = `
          <p style="color:red;">Our scan found no signs of an airdrop or points system on this webpage. You can try scanning other pages on this domain.</p>
        `;
      } else {
        countContainer.innerHTML = `
          <p style="color:${getColor(counts.airdrop)};">Airdrop: ${counts.airdrop}</p>
          <p style="color:${getColor(counts.points)};">Points: ${counts.points}</p>
          <p style="color:${getColor(counts.rewards)};">Rewards: ${counts.rewards}</p>
        `;
      }
    }

    function clearResults() {
      countContainer.innerHTML = '';
    }

    function showLoading(isLoading) {
      loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }

    function toggleButtons() {
      scanButton.style.display = scanButton.style.display === 'none' ? 'inline-block' : 'none';
      clearButton.style.display = clearButton.style.display === 'none' ? 'inline-block' : 'none';
    }

    function showAlert(message) {
      const alertContainer = document.getElementById('alert');
      alertContainer.innerHTML = `<span class="alert-message">${message}</span>`;
      alertContainer.style.display = 'block';
      setTimeout(() => {
        alertContainer.style.display = 'none';
      }, 5000);
    }

    // Call the function to populate navigation links after initialization
    populateNavLinks();
  }
});