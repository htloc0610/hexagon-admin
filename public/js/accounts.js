document.getElementById('filterName').addEventListener('input', filterAccounts);
document.getElementById('filterEmail').addEventListener('input', filterAccounts);


document.querySelectorAll('.btn-sort').forEach(button => {
    button.addEventListener('click', () => sortAccounts(button.dataset.sort));
});

let currentPage = 1;
const accountsPerPage = 5;

function fetchAccounts(page = 1) {
    currentPage = page;
    const filterName = document.getElementById('filterName').value.toLowerCase();
    const filterEmail = document.getElementById('filterEmail').value.toLowerCase();

    fetch(`/accounts?page=${page}&name=${filterName}&email=${filterEmail}`)
        .then(response => response.json())
        .then(data => {
            displayAccounts(data.accounts);
            setupPagination(data.totalPages);
        });
}

function displayAccounts(accounts) {
    const tbody = document.getElementById('accountsTable');
    tbody.innerHTML = '';
    accounts.forEach((account, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${index + 1 + (currentPage - 1) * accountsPerPage}</th>
            <td>${account.username}</td>
            <td>${account.email}</td>
            <td>${account.registrationTime}</td>
            <td>${account.role}</td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', () => fetchAccounts(i));
        pagination.appendChild(li);
    }
}

function filterAccounts() {
    fetchAccounts(1);
}

function sortAccounts(sortBy) {
    // Sorting logic here
}

// Initial fetch
fetchAccounts();