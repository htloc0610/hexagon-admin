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
                updatePagination(data.length);
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
                    <a href="/account/${account.id}?role=${account.role}" class="btn btn-sm btn-primary">Details</a>                    ${account.id !== loggedInUserId ? `
                    <button class="btn btn-sm ${account.isBanned ? 'btn-success' : 'btn-danger'} ban-unban-btn" data-id="${account.id}" data-banned="${account.isBanned}">
                        ${account.isBanned ? 'Unban' : 'Ban'}
                    </button>` : ''}
                </td>
            `;
            accountsTable.appendChild(row);
        });

        document.querySelectorAll('.ban-unban-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const userId = event.target.getAttribute('data-id');
                const isBanned = event.target.getAttribute('data-banned') === 'true';
                const url = isBanned ? `/unban/${userId}` : `/ban/${userId}`;
                const method = 'POST';

                try {
                    const response = await fetch(url, { method });
                    const result = await response.json();

                    if (response.ok) {
                        // Update button text and class
                        event.target.textContent = isBanned ? 'Ban' : 'Unban';
                        event.target.classList.toggle('btn-danger');
                        event.target.classList.toggle('btn-success');
                        event.target.setAttribute('data-banned', !isBanned);
                    } else {
                        console.error('Error:', result.message);
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });
    }

    function updatePagination(dataLength) {
        paginationContainer.innerHTML = `
            <div class="col-12 d-flex justify-content-between align-items-center">
                <button class="btn btn-primary" ${currentPage === 1 ? 'disabled' : ''} id="prevPage">Previous</button>
                <span class="mx-2 page-indicator-highlight">Page ${currentPage}</span>
                <button class="btn btn-primary" id="nextPage">Next</button>
            </div>
        `;

        const prevPageButton = document.getElementById('prevPage');
        const nextPageButton = document.getElementById('nextPage');

        prevPageButton.style.visibility = currentPage === 1 ? 'hidden' : '';
        nextPageButton.style.visibility = dataLength < 10 ? 'hidden' : '';

        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchAccounts(currentPage - 1);
            }
        });

        nextPageButton.addEventListener('click', () => {
            fetchAccounts(currentPage + 1);
        });
    }

    fetchAccounts(currentPage);
});