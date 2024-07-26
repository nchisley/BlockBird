// include-links.js
function populateNavLinks() {
  fetch('links.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('nav-container').innerHTML = data;
    })
    .catch(error => console.error('Error loading navigation:', error));
}

document.addEventListener('DOMContentLoaded', populateNavLinks);