document.addEventListener('DOMContentLoaded', () => {
    const sortButtons = document.querySelectorAll('.btn-sort');
    const productsTable = document.getElementById('productsTable');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    const filterNameInput = document.getElementById('filterName');
    const filterCategoryInput = document.getElementById('filterCategory');
    const filterManufacturerInput = document.getElementById('filterManufacturer');
    let sortOrder = 'asc'; // Default sort order
    let currentPage = 1;
    let currentSortKey = ''; // Track the current sort key
    let productsData = []; // Store the fetched products data

    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sortKey = button.getAttribute('data-sort');
            currentSortKey = sortKey;
            // Toggle sort order
            sortTable(sortKey);
        });
    });


    const applyFilterButton = document.getElementById('applyFilter');
    applyFilterButton.addEventListener('click', () => {
        currentPage = 1;
        filterTable();
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchProducts(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        fetchProducts(currentPage + 1);
    });

    function sortTable(sortKey) {
        currentSortKey = sortKey;
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        fetchProducts(currentPage);
    }

    function filterTable() {
        fetchProducts(currentPage);
    }

    function fetchProducts(page) {
        const filterName = filterNameInput.value;
        const filterCategory = filterCategoryInput.value;
        const filterManufacturer = filterManufacturerInput.value;
        
        const url = new URL(`/api/products`, window.location.origin);
        url.searchParams.append('page', page);
        url.searchParams.append('filterName', filterName);
        url.searchParams.append('filterCategory', filterCategory);
        url.searchParams.append('filterManufacturer', filterManufacturer);
        if (currentSortKey) {
          url.searchParams.append('sortKey', currentSortKey);
          url.searchParams.append('sortOrder', sortOrder);
        }
      
        fetch(url)
          .then(response => response.json())
          .then(data => {
            productsData = data;
            currentPage = page;
            renderTable(productsData);
            updatePagination(data.length);
          })
          .catch(error => console.error('Error fetching products:', error));
    }
      

    function renderTable(data) {
        productsTable.innerHTML = '';
        data.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td class="tm-product-name">${product.productName}</td>
                <td>${moment(product.createdAt).format('DD/MM/YYYY, h:mm:ss a')}</td>
                <td>${product.price}</td>
                <td>${product.totalPurchase}</td>
                <td>${product.category}</td>
                <td>${product.manufacturer}</td>
                <td>
                    <button class="btn btn-primary" onclick="window.location.href='/edit-product/${product.id}'">Details</button>
                </td>
            `;
            productsTable.appendChild(row);
        });
    }

    function updatePagination(dataLength) {
        pageIndicator.textContent = `Page ${currentPage}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.style.visibility = dataLength < 10 ? 'hidden' : '';
        prevPageButton.style.visibility = currentPage === 1 ? 'hidden' : '';
    }

    fetchProducts(currentPage);
});