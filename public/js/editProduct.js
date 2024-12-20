document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('editButton');
    const form = document.getElementById('editProductForm');
    const inputs = form.querySelectorAll('input, textarea, select, button[type="submit"]');
    const btnThumbnail = document.getElementById('thumbnail-btn');
    const btnImages = document.getElementById('images-btn');

    editButton.addEventListener('click', (event) => {
        event.preventDefault();
        inputs.forEach(input => input.disabled = false);
        btnThumbnail.style.display = 'block';
        btnImages.style.display = 'block';
        editButton.style.display = 'none';
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const productId = formData.get('productId'); // Retrieve the product ID from the hidden input
        const productData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/edit-product`, {
                method: 'POST',
                body: JSON.stringify(productData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.error) {
                showNotification(data.error, 'alert-danger');
            } else {
                showNotification('Product updated successfully!', 'alert-success');
                inputs.forEach(input => input.disabled = true);
                editButton.style.display = 'block';
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'alert-danger');
        }
    });

    function showNotification(message, alertClass) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `alert ${alertClass}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    window.previewThumbnail = function(event) {
        const thumbnail = document.getElementById('thumbnail');
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        const file = thumbnail.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                thumbnailPreview.src = e.target.result;
                thumbnailPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    window.previewImages = function(event) {
        const images = document.getElementById('images');
        const imagesPreview = document.getElementById('imagesPreview');
        imagesPreview.innerHTML = '';
        const files = images.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'img-fluid mt-2';
                    img.style.maxWidth = '100px';
                    img.style.marginRight = '10px';
                    imagesPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // Display existing images on page load
    function displayExistingImages() {
        const imagesPreview = document.getElementById('imagesPreview');
        const existingImages = JSON.parse(document.getElementById('existingImages').value || '[]');
        imagesPreview.innerHTML = '';
        existingImages.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'img-fluid mt-2';
            img.style.maxWidth = '100px';
            img.style.marginRight = '10px';
            imagesPreview.appendChild(img);
        });
    }

    displayExistingImages();

    window.toggleStockQuantity = function(show) {
        const stockQuantityGroup = document.getElementById('stockQuantityGroup');
        const stockQuantityInput = document.getElementById('stock_quantity');
        if (show) {
            stockQuantityGroup.style.display = 'block';
        } else {
            stockQuantityGroup.style.display = 'none';
            stockQuantityInput.value = 0; // Set stock quantity to 0
        }
    }
});