document.addEventListener('DOMContentLoaded', () => {
    const sortButtons = document.querySelectorAll('.btn-sort');
    const accountsTable = document.getElementById('accountsTable');
    const filterNameInput = document.getElementById('filterName');
    const filterEmailInput = document.getElementById('filterEmail');
    const paginationContainer = document.getElementById('pagination');
    let sortOrder = 'asc'; // Default sort order
    let currentPage = 1;
    let currentSortKey = ''; // Track the current sort key
    let accountsData = []; // Store the fetched accounts data

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
    filterEmailInput.addEventListener('input', filterTable);

    function sortTable(sortKey) {
        const sortedRows = accountsData.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (sortKey === 'id') {
                return sortOrder === 'asc' ? parseInt(aValue) - parseInt(bValue) : parseInt(bValue) - parseInt(aValue);
            } else if (sortKey === 'createdAt') {
                return sortOrder === 'asc' ? moment(aValue, 'DD/MM/YYYY, h:mm:ss a').toDate() - moment(bValue, 'DD/MM/YYYY, h:mm:ss a').toDate() : moment(bValue, 'DD/MM/YYYY, h:mm:ss a').toDate() - moment(aValue, 'DD/MM/YYYY, h:mm:ss a').toDate();
            } else {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        renderTable(sortedRows);
    }

    function filterTable() {
        const filterName = filterNameInput.value.toLowerCase();
        const filterEmail = filterEmailInput.value.toLowerCase();
        const filteredRows = accountsData.filter(account => {
            const name = account.username.toLowerCase();
            const email = account.email.toLowerCase();
            return name.includes(filterName) && email.includes(filterEmail);
        });

        renderTable(filteredRows);
    }

    function fetchAccounts(page) {
        fetch(`/api/accounts?page=${page}`)
            .then(response => response.json())
            .then(data => {
                accountsData = data; // Store the fetched data
                currentPage = page;
                if (currentSortKey) {
                    sortTable(currentSortKey); // Apply sorting if a sort key is set
                } else {
                    renderTable(accountsData);
                }
                updatePagination();
                // Update the URL to reflect the current page
                history.pushState(null, '', `?page=${currentPage}`);
            })
            .catch(error => console.error('Error fetching accounts:', error));
    }

    function renderTable(data) {
        accountsTable.innerHTML = '';
        data.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row" data-key="id">${account.id}</th>
                <td data-key="username">${account.username}</td>
                <td data-key="email">${account.email}</td>
                <td data-key="createdAt">${account.createdAt}</td>
                <td data-key="role">${account.role}</td>
                <td>
                    <a href="/account/${account.id}" class="btn btn-sm btn-primary">Details</a>
                </td>
            `;
            accountsTable.appendChild(row);
        });
    }

    function updatePagination() {
        paginationContainer.innerHTML = `
            <button class="btn btn-primary mr-2" ${currentPage === 1 ? 'disabled' : ''} id="prevPage">Previous</button>
            <span class="mx-2">Page ${currentPage}</span>
            <button class="btn btn-primary ml-2" id="nextPage">Next</button>
        `;

        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                fetchAccounts(currentPage - 1);
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            fetchAccounts(currentPage + 1);
        });
    }

    fetchAccounts(currentPage);
});