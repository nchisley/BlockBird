document.addEventListener('DOMContentLoaded', function() {
    const defaultPageSelect = document.getElementById('default-page-select');
  
    chrome.storage.local.get(['defaultPage'], function(result) {
      if (result.defaultPage) {
        defaultPageSelect.value = result.defaultPage;
      }
    });
  
    defaultPageSelect.addEventListener('change', function() {
      const selectedPage = defaultPageSelect.value;
      chrome.storage.local.set({ defaultPage: selectedPage });
    });
  });
  