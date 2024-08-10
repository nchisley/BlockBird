document.addEventListener('DOMContentLoaded', function() {
  const defaultPageSelect = document.getElementById('default-page-select');
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
  const languageSelect = document.getElementById('language-select');

  function loadLanguage(lang) {
    fetch(`languages/${lang}.json`)
      .then(response => response.json())
      .then(translations => {
        window.applyTranslations(translations);  // Use global function
        chrome.storage.local.set({ language: lang });
      })
      .catch(error => console.error('Error loading translations:', error));
  }

  // Load settings
  chrome.storage.local.get(['defaultPage', 'darkMode', 'language'], function(result) {
    if (result.defaultPage) {
      defaultPageSelect.value = result.defaultPage;
    }
    if (result.darkMode) {
      darkModeCheckbox.checked = result.darkMode;
      document.body.classList.toggle('dark-mode', result.darkMode);
    }
    const userLang = result.language || navigator.language.split('-')[0] || 'en';
    languageSelect.value = userLang;
    loadLanguage(userLang);
  });

  // Save default page setting
  defaultPageSelect.addEventListener('change', function() {
    const selectedPage = defaultPageSelect.value;
    chrome.storage.local.set({ defaultPage: selectedPage });
  });

  // Save dark mode setting
  darkModeCheckbox.addEventListener('change', function() {
    const isDarkMode = darkModeCheckbox.checked;
    chrome.storage.local.set({ darkMode: isDarkMode });
    document.body.classList.toggle('dark-mode', isDarkMode);
  });

  // Save language setting
  languageSelect.addEventListener('change', function() {
    const selectedLang = languageSelect.value;
    loadLanguage(selectedLang);
  });
});
