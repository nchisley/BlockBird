document.addEventListener('DOMContentLoaded', function() {
  const setupLinkContainer = document.getElementById('setup-link-container');
  const setupLink = document.getElementById('setup-link');

  // Check if the link has already been clicked or if the user has visited the settings page
  chrome.storage.local.get(['setupLinkClicked'], function(result) {
    if (result.setupLinkClicked) {
      setupLinkContainer.style.display = 'none';
    }
  });

  // Set up event listener for the link
  setupLink.addEventListener('click', function() {
    // Hide the link and store that it has been clicked
    setupLinkContainer.style.display = 'none';
    chrome.storage.local.set({ setupLinkClicked: true });
  });
});
