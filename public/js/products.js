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
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            sortTable(sortKey);
        });
    });

    filterNameInput.addEventListener('input', filterTable);
    filterCategoryInput.addEventListener('input', filterTable);
    filterManufacturerInput.addEventListener('input', filterTable);

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchProducts(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        fetchProducts(currentPage + 1);
    });

    function sortTable(sortKey) {
        const sortedRows = productsData.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (sortKey === 'id' || sortKey === 'totalPurchase') {
                return sortOrder === 'asc' ? parseInt(aValue) - parseInt(bValue) : parseInt(bValue) - parseInt(aValue);
            } else if (sortKey === 'price') {
                return sortOrder === 'asc' ? parseFloat(aValue) - parseFloat(bValue) : parseFloat(bValue) - parseFloat(aValue);
            } else if (sortKey === 'createdAt') {
                return sortOrder === 'asc' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
            } else {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        renderTable(sortedRows);
    }

    function filterTable() {
        const filterName = filterNameInput.value.toLowerCase();
        const filterCategory = filterCategoryInput.value.toLowerCase();
        const filterManufacturer = filterManufacturerInput.value.toLowerCase();
        const filteredRows = productsData.filter(product => {
            const name = product.productName.toLowerCase();
            const category = product.category.toLowerCase();
            const manufacturer = product.manufacturer.toLowerCase();
            return name.includes(filterName) && category.includes(filterCategory) && manufacturer.includes(filterManufacturer);
        });

        renderTable(filteredRows);
    }

    function fetchProducts(page) {
        fetch(`/api/products?page=${page}`)
            .then(response => response.json())
            .then(data => {
                productsData = data; // Store the fetched data
                currentPage = page;
                if (currentSortKey) {
                    sortTable(currentSortKey); // Apply sorting if a sort key is set
                } else {
                    renderTable(productsData);
                }
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
                    <button class="btn btn-primary">Details</button>
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