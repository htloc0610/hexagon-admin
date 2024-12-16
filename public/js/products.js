document.addEventListener('DOMContentLoaded', () => {
    const sortButtons = document.querySelectorAll('.btn-sort');
    const productsTable = document.getElementById('productsTable');
    let sortOrder = 'asc'; // Default sort order
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

    function sortTable(sortKey) {
        const sortedRows = productsData.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (sortKey === 'id') {
                return sortOrder === 'asc' ? parseInt(aValue) - parseInt(bValue) : parseInt(bValue) - parseInt(aValue);
            } else {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        renderTable(sortedRows);
    }

    function fetchProducts() {
        fetch('/api/products')
            .then(response => response.json())
            .then(data => {
                productsData = data; // Store the fetched data
                if (currentSortKey) {
                    sortTable(currentSortKey); // Apply sorting if a sort key is set
                } else {
                    renderTable(productsData);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function renderTable(data) {
        productsTable.innerHTML = '';
        data.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row"><input type="checkbox" /></th>
                <td class="tm-product-name">${product.productName}</td>
                <td>${product.category}</td>
                <td>${product.manufacturer}</td>
                <td>
                    <a href="#" class="tm-product-delete-link">
                        <i class="far fa-trash-alt tm-product-delete-icon"></i>
                    </a>
                </td>
            `;
            productsTable.appendChild(row);
        });
    }

    fetchProducts();
});