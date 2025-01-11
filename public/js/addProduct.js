document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addProductForm');
    const notification = document.getElementById('notification');

    const toggleCategoryInputButton = document.getElementById('toggleCategoryInput');
    const toggleCategoryDropdownButton = document.getElementById('toggleCategoryDropdown');
    const categoryDropdownContainer = document.getElementById('categoryDropdownContainer');
    const categoryInputContainer = document.getElementById('categoryInputContainer');
    const categoryInput = document.getElementById('categoryInput');
    const categoryDropdown = document.getElementById('category');

    const toggleManufacturerInputButton = document.getElementById('toggleManufacturerInput');
    const toggleManufacturerDropdownButton = document.getElementById('toggleManufacturerDropdown');
    const manufacturerDropdownContainer = document.getElementById('manufacturerDropdownContainer');
    const manufacturerInputContainer = document.getElementById('manufacturerInputContainer');
    const manufacturerInput = document.getElementById('manufacturerInput');
    const manufacturerDropdown = document.getElementById('manufacturer');

    toggleCategoryInputButton.addEventListener('click', () => {
        categoryDropdownContainer.style.display = 'none';
        categoryInputContainer.style.display = 'block';
        categoryDropdown.required = false;
        categoryInput.required = true;
    });

    toggleCategoryDropdownButton.addEventListener('click', () => {
        categoryInputContainer.style.display = 'none';
        categoryDropdownContainer.style.display = 'block';
        categoryInput.required = false;
        categoryDropdown.required = true;
    });

    toggleManufacturerInputButton.addEventListener('click', () => {
        manufacturerDropdownContainer.style.display = 'none';
        manufacturerInputContainer.style.display = 'block';
        manufacturerDropdown.required = false;
        manufacturerInput.required = true;
    });

    toggleManufacturerDropdownButton.addEventListener('click', () => {
        manufacturerInputContainer.style.display = 'none';
        manufacturerDropdownContainer.style.display = 'block';
        manufacturerInput.required = false;
        manufacturerDropdown.required = true;
    });

    

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validate user input
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(form);



        // Choose category or categoryInput
        if (categoryInput.value.trim()) {
            formData.set('category', categoryInput.value.trim());
        } else {
            formData.set('category', categoryDropdown.value);
        }

        // Choose manufacturer or manufacturerInput
        if (manufacturerInput.value.trim()) {
            formData.set('manufacturer', manufacturerInput.value.trim());
        } else {
            formData.set('manufacturer', manufacturerDropdown.value);
        }


        const thumbnailFile = formData.get('thumbnail');
        const imagesFiles = formData.getAll('images');

        // Upload the thumbnail first if it exists
        if (thumbnailFile && thumbnailFile.size > 0) {
            const thumbnailUploadFormData = new FormData();
            thumbnailUploadFormData.append('imageUpload', thumbnailFile);

            const thumbnailUploadResponse = await fetch('/imageUpload', {
                method: 'POST',
                body: thumbnailUploadFormData
            });

            const thumbnailUploadData = await thumbnailUploadResponse.json();

            if (thumbnailUploadData.message !== 'Upload success') {
                showNotification('Error uploading thumbnail', 'alert-danger');
                return;
            }

            formData.append('url', thumbnailUploadData.imageUrl); // Use 'url' to match the model
        }

        // Upload images if they exist
        if (imagesFiles.length > 0) {
            const imagesUrls = [];
            for (const file of imagesFiles) {
                const imagesUploadFormData = new FormData();
                imagesUploadFormData.append('imageUpload', file);

                const imagesUploadResponse = await fetch('/imageUpload', {
                    method: 'POST',
                    body: imagesUploadFormData
                });

                const imagesUploadData = await imagesUploadResponse.json();


                if (imagesUploadData.message !== 'Upload success') {
                    showNotification('Error uploading images', 'alert-danger');
                    return;
                }


                imagesUrls.push(imagesUploadData.imageUrl[0]);
            }

            formData.set('urls', JSON.stringify(imagesUrls)); // Lưu mảng JSON trực tiếp
        }

        const formObject = Object.fromEntries(formData.entries());
        formObject.urls = JSON.parse(formObject.urls); // Đảm bảo đây là JSON array

        try {
            const response = await fetch('/api/add', {
                method: 'POST',
                body: JSON.stringify(formObject),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();


            if (data.error) {
                showNotification(data.error, 'alert-danger');
            } else {
                showNotification('Product added successfully!', 'alert-success');
                form.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('imagesPreview').innerHTML = '';
                toggleStockQuantity(false); // Hide stock quantity input after form reset
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'alert-danger');
        }
    });

    function validateForm() {
        const productName = document.getElementById('productName').value.trim();
        const description = document.getElementById('description').value.trim();
        const category = document.getElementById('category').value;
        const manufacturer = document.getElementById('manufacturer').value;
        const price = parseFloat(document.getElementById('price').value);
        const status = document.querySelector('input[name="status"]:checked');
        const stockQuantity = parseInt(document.getElementById('stock_quantity').value);
        const thumbnail = document.getElementById('thumbnail').files[0];
        const categoryInput = document.getElementById('categoryInput').value.trim();
        const manufacturerInput = document.getElementById('manufacturerInput').value.trim();

        if (!productName || !description || (!category && !categoryInput) || (!manufacturer && !manufacturerInput) || !price || !status || !thumbnail) {
            showNotification('All fields are required!', 'alert-danger');
            return false;
        }

        if (price <= 0) {
            showNotification('Price must be greater than 0!', 'alert-danger');
            return false;
        }


        if (status.value === 'On stock' && (stockQuantity <= 0 || !Number.isInteger(stockQuantity))) {
            showNotification('Stock quantity must be greater than 0 when On stock is chosen!', 'alert-danger');
            return false;
        }

        return true;
    }

    function showNotification(message, alertClass) {
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