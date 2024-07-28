document.addEventListener('DOMContentLoaded', function() {
  const defaultPageSelect = document.getElementById('default-page-select');
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');

  // Load settings
  chrome.storage.local.get(['defaultPage', 'darkMode'], function(result) {
    if (result.defaultPage) {
      defaultPageSelect.value = result.defaultPage;
    }
    if (result.darkMode) {
      darkModeCheckbox.checked = result.darkMode;
      document.body.classList.toggle('dark-mode', result.darkMode);
    }
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
});
