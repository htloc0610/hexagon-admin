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
    
        console.log('Form submission started');
    
        const formData = new FormData(form);
        const productId = formData.get('productId'); // Retrieve the product ID from the hidden input
        const productData = Object.fromEntries(formData.entries());
    
        console.log('Form data:', productData);
    
        const thumbnailFile = formData.get('thumbnail');
        const thumbnailPreviewText = document.getElementById('thumbnailPreviewText');
        
        // Upload the thumbnail first if it exists
        if (thumbnailFile && thumbnailFile.size > 0) {
            console.log('Uploading thumbnail...');
            
            const thumbnailUploadFormData = new FormData();
            thumbnailUploadFormData.append('imageUpload', thumbnailFile);
    
            try {
                const thumbnailUploadResponse = await fetch('/imageUpload', {
                    method: 'POST',
                    body: thumbnailUploadFormData
                });
    
                const thumbnailUploadData = await thumbnailUploadResponse.json();
    
                if (thumbnailUploadData.message !== 'Upload success') {
                    showNotification('Error uploading thumbnail', 'alert-danger');
                    return;
                }
    
                productData.url = thumbnailUploadData.imageUrl[0];
                console.log('Thumbnail uploaded successfully:', thumbnailUploadData.imageUrl);
            } catch (error) {
                console.error('Error uploading thumbnail:', error);
                showNotification('Error uploading thumbnail', 'alert-danger');
                return;
            }
        }
    
        try {
            console.log('Submitting form data:', productData);
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
            console.error('Error submitting form:', error);
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
        const urlsInput = document.getElementById('urls');
        imagesPreview.innerHTML = '';
        const files = images.files;
        let urls = [];
    
        if (files) {
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'img-container';
                    imgContainer.style.position = 'relative';
                    imgContainer.style.display = 'inline-block';
    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'img-fluid mt-2';
                    img.style.maxWidth = '100px';
                    img.style.marginRight = '10px';
    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'btn btn-danger btn-sm delete-image-btn';
                    deleteBtn.style.position = 'absolute';
                    deleteBtn.style.top = '0';
                    deleteBtn.style.right = '0';
                    deleteBtn.textContent = 'X';
                    deleteBtn.dataset.index = index;
    
                    deleteBtn.addEventListener('click', function() {
                        urls.splice(deleteBtn.dataset.index, 1);
                        urlsInput.value = JSON.stringify(urls);
                        imgContainer.remove();
                    });
    
                    imgContainer.appendChild(img);
                    imgContainer.appendChild(deleteBtn);
                    imagesPreview.appendChild(imgContainer);
    
                    urls.push(e.target.result);
                    urlsInput.value = JSON.stringify(urls);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    // Handle image deletion
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-image-btn')) {
            const index = event.target.dataset.index;
            const urlsInput = document.getElementById('urls');
            let urls = JSON.parse(urlsInput.value);
            urls.splice(index, 1);
            urlsInput.value = JSON.stringify(urls);
            event.target.parentElement.remove();
        }
    });

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