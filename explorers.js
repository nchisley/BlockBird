document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const listContainer = document.getElementById('list');
  const paginationContainer = document.getElementById('pagination-buttons');
  const prevPageButton = document.getElementById('prevPage');
  const nextPageButton = document.getElementById('nextPage');
  const firstPageButton = document.getElementById('firstPage');
  const lastPageButton = document.getElementById('lastPage');
  const loadingIndicator = document.getElementById('loading');
  const itemsPerPage = 20; // Updated to 20 items per page to match grid
  let currentPage = 1;
  let totalPages = 1;
  let allData = [];
  let filteredData = [];

  const webPageUrl = 'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSTKLXEgIRbqLvXOSEOyHxPTkQyND5YfBBLLce-mNxR7f-WIDEAyuy0SrB1u_p2DDVmnCx1413RWIsn/pubhtml?gid=1520699041&single=true'; // Replace with your published web page URL

  function fetchBlockchainData() {
    showLoading(true);
    fetch(webPageUrl)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const rows = Array.from(doc.querySelectorAll('table tbody tr')).slice(1); // Skip the first row
        allData = rows.map(row => {
          const cells = row.querySelectorAll('td');
          return {
            name: cells[0].innerText.trim(),
            link: cells[1].innerText.trim(),
            category: cells[2].innerText.trim()
          };
        });
        filterAndRender();
        showLoading(false);
      })
      .catch(error => {
        console.error('<span class="alert-negative"">Error fetching data from the web page:</span>', error);
        showLoading(false);
      });
  }

  function renderList(data, page = 1) {
    listContainer.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = data.slice(start, end);

    paginatedItems.forEach(item => {
      const listItem = document.createElement(item.link ? 'a' : 'div');
      listItem.className = 'list-item';
      if (item.link) {
        listItem.href = item.link;
        listItem.target = '_blank';
      }
      listItem.innerHTML = `
        <div>${item.name}</div>`;
      listContainer.appendChild(listItem);
    });

    renderPagination(data.length, page);
  }

  function renderPagination(totalItems, page) {
    paginationContainer.innerHTML = '';
    totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('button');
      pageItem.innerText = i;
      pageItem.className = i === page ? 'active' : '';
      pageItem.addEventListener('click', () => {
        currentPage = i;
        renderList(filteredData, currentPage);
      });
      paginationContainer.appendChild(pageItem);
    }

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    firstPageButton.disabled = currentPage === 1;
    lastPageButton.disabled = currentPage === totalPages;
  }

  function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredData = allData.filter(item => item.name.toLowerCase().includes(searchTerm));

    renderList(filteredData, currentPage);
  }

  function showLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    listContainer.style.display = isLoading ? 'none' : 'grid';
  }

  searchInput.addEventListener('input', () => {
    currentPage = 1;
    filterAndRender();
  });

  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderList(filteredData, currentPage);
    }
  });

  nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderList(filteredData, currentPage);
    }
  });

  firstPageButton.addEventListener('click', () => {
    currentPage = 1;
    renderList(filteredData, currentPage);
  });

  lastPageButton.addEventListener('click', () => {
    currentPage = totalPages;
    renderList(filteredData, currentPage);
  });

  // Initial fetch and render
  fetchBlockchainData();
});