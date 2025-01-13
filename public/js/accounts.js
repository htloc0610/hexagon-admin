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

    filterNameInput.addEventListener('input', () => fetchAccounts(currentPage));
    filterEmailInput.addEventListener('input', () => fetchAccounts(currentPage));

    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentSortKey = button.getAttribute('data-sort');
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            fetchAccounts(currentPage);
        });
    });



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
        const filterName = filterNameInput.value;
        const filterEmail = filterEmailInput.value;
        const params = new URLSearchParams({
            page,
            filterName,
            filterEmail,
            sortKey: currentSortKey,
            sortOrder
        });
    
        fetch(`/api/accounts?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                accountsData = data;
                currentPage = page;
                renderTable(accountsData);
                updatePagination(data.length);
                history.pushState(null, '', `?page=${currentPage}&${params.toString()}`);
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
                    <a href="/account/${account.id}?role=${account.role}" class="btn btn-sm btn-primary">Details</a>
                    ${account.role === 'User' ? `
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