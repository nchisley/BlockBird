// Redirect to default page if set
chrome.storage.local.get(['defaultPage'], function(result) {
  const urlParams = new URLSearchParams(window.location.search);
  const fromDash = urlParams.get('fromDash');

  if (result.defaultPage && window.location.pathname === '/popup.html' && !fromDash) {
    window.location.replace(result.defaultPage);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const checkbox = document.getElementById('default-page-checkbox');

  // Load current default page from storage
  chrome.storage.local.get(['defaultPage'], function(result) {
    if (result.defaultPage === window.location.pathname) {
      checkbox.checked = true;
    }
  });

  // Add event listener to checkbox
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      chrome.storage.local.set({ defaultPage: window.location.pathname });
    } else {
      chrome.storage.local.remove('defaultPage');
    }
  });
});
