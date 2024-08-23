// dark-mode.js
(function() {
  if (!window.darkModeInitialized) {
    document.addEventListener('DOMContentLoaded', function() {
      chrome.storage.local.get(['darkMode'], function(result) {
        if (result.darkMode) {
          document.body.classList.add('dark-mode');
        }
      });
    });
    window.darkModeInitialized = true;
  }
})();

// default-page.js
(function() {
  if (!window.defaultPageInitialized) {
    document.addEventListener('DOMContentLoaded', function() {
      const currentPath = window.location.pathname;
      if (currentPath === '/popup.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const fromDash = urlParams.get('fromDash');
        if (window.SidePanelAPI) {
          document.body.classList.add('panel-open');
        }
        chrome.storage.local.get(['defaultPage'], function(result) {
          if (result.defaultPage && !fromDash) {
            window.location.replace(result.defaultPage);
          }
        });
      }
    });
    window.defaultPageInitialized = true;
  }
})();

// include-links.js
(function() {
  if (!window.includeLinksInitialized) {
    document.addEventListener('DOMContentLoaded', function() {
      const navContainer = document.getElementById('nav-container');
      if (navContainer) {
        fetch('links.html')
          .then(response => response.text())
          .then(data => {
            navContainer.innerHTML = data;
            const links = navContainer.querySelectorAll('.nav-list-item');
            const currentUrl = window.location.href;
            links.forEach(link => {
              if (link.href === currentUrl) {
                link.classList.add('current-page');
              }
            });
          })
          .catch(error => console.error('Error loading navigation:', error));
      } else {
        console.error('Navigation container not found.');
      }
    });
    window.includeLinksInitialized = true;
  }
})();

// header.js
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
      .then(response => response.text())
      .then(data => {
        const headerContainer = document.getElementById('header-container');
        headerContainer.innerHTML = data;
      })
      .catch(error => console.error('Error loading header:', error));

    function checkSidePanel() {
      if (window.innerHeight >= 601) {
        document.body.classList.add('panel-open');
      } else {
        document.body.classList.remove('panel-open');
      }
    }
    
    checkSidePanel();

    if (!window.listenerAdded) {
      window.addEventListener('resize', checkSidePanel);
      window.listenerAdded = true;
    }
  });
})();

// translate.js
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    initializeTranslations();
  });
})();
