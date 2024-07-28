document.addEventListener('DOMContentLoaded', function() {
  // Apply dark mode if enabled
  chrome.storage.local.get(['darkMode'], function(result) {
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
    }
  });
});
