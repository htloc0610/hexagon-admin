document.addEventListener('DOMContentLoaded', () => {
    const sortButton = document.querySelector('.btn-sort[data-sort="orderDate"]');
    const ordersTable = document.getElementById('ordersTable');
    const filterStatusSelect = document.getElementById('filterStatus');
    let sortOrder = 'asc';

    sortButton.addEventListener('click', () => {
        const rows = Array.from(ordersTable.querySelectorAll('tr'));
        const sortedRows = rows.sort((a, b) => {
            const dateA = parseDate(a.querySelector('[data-key="orderDate"]').textContent);
            const dateB = parseDate(b.querySelector('[data-key="orderDate"]').textContent);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Toggle sort order
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';

        // Clear the table and append sorted rows
        ordersTable.innerHTML = '';
        sortedRows.forEach(row => ordersTable.appendChild(row));
    });

    filterStatusSelect.addEventListener('change', () => {
        const filterValue = filterStatusSelect.value.toLowerCase();
        const rows = Array.from(ordersTable.querySelectorAll('tr'));

        rows.forEach(row => {
            const status = row.querySelector('[data-key="orderStatus"]').textContent.toLowerCase();
            if (filterValue === '' || status === filterValue) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    function parseDate(dateString) {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [time, period] = timePart.split(' ');
        let [hours, minutes, seconds] = time.split(':').map(Number);

        if (period === 'pm' && hours !== 12) {
            hours += 12;
        } else if (period === 'am' && hours === 12) {
            hours = 0;
        }

        return new Date(year, month - 1, day, hours, minutes, seconds);
    }
});