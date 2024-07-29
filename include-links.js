document.addEventListener('DOMContentLoaded', function() {
  fetch('links.html')
    .then(response => response.text())
    .then(data => {
      const navContainer = document.getElementById('nav-container');
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
});
