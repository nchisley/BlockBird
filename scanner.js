document.addEventListener('DOMContentLoaded', function() {
  initializeScanner();

  function initializeScanner() {
    let translations = {};

    function applyTranslations(translations) {
      document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
          element.innerHTML = translations[key];
        }
      });
    }

    function loadLanguage(lang) {
      fetch(`${lang}.json`)
        .then(response => response.json())
        .then(data => {
          translations = data;
          applyTranslations(translations);
        })
        .catch(error => console.error('Error loading translations:', error));
    }

    function initializeTranslations() {
      chrome.storage.local.get(['language'], function(result) {
        const userLang = result.language || navigator.language.split('-')[0] || 'en';
        loadLanguage(userLang);
      });
    }

    initializeTranslations();

    const scanButton = document.getElementById('scan-button');
    const clearButton = document.getElementById('clear-button');
    const resultsContainer = document.getElementById('results');
    const loadingIndicator = document.getElementById('loading');
    const countContainer = document.getElementById('count');
    const currentUrlContainer = document.getElementById('current-url');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      currentUrlContainer.textContent = `URL: ${tabs[0].url}`;
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
              showAlert(translations['error_scanning_page'], 'negative');
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
      const getColor = (count) => count === 0 ? 'red' : '#689f70';

      if (counts.airdrop === 0 && counts.points === 0 && counts.rewards === 0) {
        countContainer.textContent = translations['our_scan_found_no_signs'];
      } else {
        countContainer.innerHTML = `
          <p style="color:${getColor(counts.airdrop)};">${translations['airdrop']}: ${counts.airdrop}</p>
          <p style="color:${getColor(counts.points)};">${translations['points']}: ${counts.points}</p>
          <p style="color:${getColor(counts.rewards)};">${translations['rewards']}: ${counts.rewards}</p>
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
      scanButton.style.display = scanButton.style.display === 'none' ? 'inline' : 'none';
      clearButton.style.display = clearButton.style.display === 'none' ? 'inline' : 'none';
    }

    function showAlert(message, type) {
      const alertContainer = document.getElementById('alert');
      alertContainer.innerHTML = `<span class="scan-alert alert-${type}">${message}</span>`;
      alertContainer.style.display = 'block';
      setTimeout(() => {
        alertContainer.style.display = 'none';
      }, 5000);
    }

    // Call the function to populate navigation links after initialization
    populateNavLinks();
  }
});
