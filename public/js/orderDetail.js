document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const saveStatusButton = document.getElementById('saveStatusButton');
    const orderStatusSelect = document.getElementById('orderStatus');
    const notificationBox = document.getElementById('notificationBox');
    const orderId = document.getElementById('orderId').textContent;

    console.log('Order ID:', orderId);

    if (saveStatusButton) {
        saveStatusButton.addEventListener('click', async () => {
            const newStatus = orderStatusSelect.value;
            console.log('Save button clicked');
            console.log(newStatus);

            try {
                const response = await fetch(`/orders/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (response.ok) {
                    showNotification('Save Success');
                } else {
                    showNotification('Failed to update order status', 'alert-danger');
                }
            } catch (error) {
                console.error('Error updating order status:', error);
                showNotification('An error occurred while updating the order status', 'alert-danger');
            }
        });
    } else {
        console.error('Save button not found');
    }

    function showNotification(message, alertClass = 'alert-success') {
        notificationBox.textContent = message;
        notificationBox.className = `alert ${alertClass} mt-3`;
        notificationBox.style.display = 'block';
        setTimeout(() => {
            notificationBox.style.display = 'none';
        }, 3000);
    }
});