document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
    .then(response => response.text())
    .then(data => {
        const headerContainer = document.getElementById('header-container');
        headerContainer.innerHTML = data;
    })
    .catch(error => console.error('Error loading header:', error));
});