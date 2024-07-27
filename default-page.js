document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const fromDash = urlParams.get('fromDash');

  chrome.storage.local.get(['defaultPage'], function(result) {
    if (result.defaultPage && window.location.pathname === '/popup.html' && !fromDash) {
      window.location.replace(result.defaultPage);
    }
  });
});
