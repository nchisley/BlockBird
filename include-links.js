// include-links.js
document.addEventListener('DOMContentLoaded', function() {
  fetch('links.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('nav-container').innerHTML = data;
    })
    .catch(error => console.error('Error loading navigation:', error));
});
