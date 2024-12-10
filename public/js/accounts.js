document.addEventListener('DOMContentLoaded', () => {
    const sortButtons = document.querySelectorAll('.btn-sort');
    const accountsTable = document.getElementById('accountsTable');
    const filterNameInput = document.getElementById('filterName');
    const filterEmailInput = document.getElementById('filterEmail');
    let sortOrder = 'asc'; // Default sort order

    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sortKey = button.getAttribute('data-sort');
            sortTable(sortKey);
            // Toggle sort order
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        });
    });

    filterNameInput.addEventListener('input', filterTable);
    filterEmailInput.addEventListener('input', filterTable);

    function sortTable(sortKey) {
        const rows = Array.from(accountsTable.querySelectorAll('tr'));
        const sortedRows = rows.sort((a, b) => {
            const aValue = a.querySelector(`td[data-key="${sortKey}"]`).textContent.trim();
            const bValue = b.querySelector(`td[data-key="${sortKey}"]`).textContent.trim();

            if (sortKey === 'id') {
                return sortOrder === 'asc' ? parseInt(aValue) - parseInt(bValue) : parseInt(bValue) - parseInt(aValue);
            } else if (sortKey === 'createdAt') {
                return sortOrder === 'asc' ? Date.parse(aValue) - Date.parse(bValue) : Date.parse(bValue) - Date.parse(aValue);
            } else {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        accountsTable.innerHTML = '';
        sortedRows.forEach(row => accountsTable.appendChild(row));
    }

    function filterTable() {
        const filterName = filterNameInput.value.toLowerCase();
        const filterEmail = filterEmailInput.value.toLowerCase();
        const rows = Array.from(accountsTable.querySelectorAll('tr'));

        rows.forEach(row => {
            const name = row.querySelector('td[data-key="username"]').textContent.toLowerCase();
            const email = row.querySelector('td[data-key="email"]').textContent.toLowerCase();
            const matchesName = name.includes(filterName);
            const matchesEmail = email.includes(filterEmail);

            if (matchesName && matchesEmail) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
});