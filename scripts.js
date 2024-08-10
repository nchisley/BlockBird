// dark-mode.js
(function() {
    // Ensure the script only runs once
    if (!window.darkModeInitialized) {
        document.addEventListener('DOMContentLoaded', function() {
        // Apply dark mode if enabled
        chrome.storage.local.get(['darkMode'], function(result) {
            if (result.darkMode) {
            document.body.classList.add('dark-mode');
            }
        });
        });
        window.darkModeInitialized = true; // Mark as initialized to prevent reruns
    }
    })();

    // default-page.js
    (function() {
    // Ensure the script only runs once
    if (!window.defaultPageInitialized) {
        document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname;

        if (currentPath === '/popup.html') {
            const urlParams = new URLSearchParams(window.location.search);
            const fromDash = urlParams.get('fromDash');

            // Add "panel-open" class if the extension is in the side panel
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
        window.defaultPageInitialized = true; // Mark as initialized to prevent reruns
    }
    })();

    // include-links.js
    (function() {
    // Ensure the script only runs once
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
        window.includeLinksInitialized = true; // Mark as initialized to prevent reruns
    }
    })();

    // header.js
    (function() {
    document.addEventListener('DOMContentLoaded', function() {
        function applyTranslations(translations) {
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    element.innerText = translations[key];
                }
            });
        }

        function loadLanguage(lang) {
            fetch(`languages/${lang}.json`)
              .then(response => response.json())
              .then(translations => {
                applyTranslations(translations);
              })
              .catch(error => console.error('Error loading translations:', error));
          }

        chrome.storage.local.get(['language'], function(result) {
            const userLang = result.language || navigator.language.split('-')[0] || 'en';
            loadLanguage(userLang);
        });

        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                const headerContainer = document.getElementById('header-container');
                headerContainer.innerHTML = data;
            })
            .catch(error => console.error('Error loading header:', error));

        function checkSidePanel() {
            if (window.innerHeight >= 601) { // Adjust the height as needed for your panel size
                document.body.classList.add('panel-open');
            } else {
                document.body.classList.remove('panel-open');
            }
        }

        // Initial check when the content is loaded
        checkSidePanel();

        // Add the resize event listener only if it hasn't been added before
        if (!window.listenerAdded) {
            window.addEventListener('resize', checkSidePanel);
            window.listenerAdded = true; // Prevent adding the listener again
        }
    });
    })();

    // translate.js
(function() {
    window.applyTranslations = function(translations) {
      document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
          if (element.tagName === 'INPUT' && element.placeholder) {
            element.placeholder = translations[key];
          } else {
            element.innerText = translations[key];
          }
        }
      });
    };
  
    function loadLanguage(lang) {
      fetch(`languages/${lang}.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(translations => {
          window.applyTranslations(translations);
          chrome.storage.local.set({ language: lang });
        })
        .catch(error => console.error('Error loading translations:', error));
    }
  
    function initializeTranslations() {
      chrome.storage.local.get(['language'], function(result) {
        const userLang = result.language || navigator.language.split('-')[0] || 'english';
        loadLanguage(userLang);
      });
    }
  
    document.addEventListener('DOMContentLoaded', function() {
      initializeTranslations();
    });
  })();
  