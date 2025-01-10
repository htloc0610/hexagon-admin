let isEditMode = false;
document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('editButton');
    const form = document.getElementById('editProductForm');
    const inputs = form.querySelectorAll('input, textarea, select, button[type="submit"]');
    const btnThumbnail = document.getElementById('thumbnail-btn');
    const btnImages = document.getElementById('images-btn');

    // editButton.addEventListener('click', (event) => {
    //     event.preventDefault();
    //     isEditMode = true;
    //     inputs.forEach(input => input.disabled = false);
    //     btnThumbnail.style.display = 'block';
    //     btnImages.style.display = 'block';
    //     editButton.style.display = 'none';
    //     // Show delete buttons if in edit mode
    //     document.querySelectorAll('.delete-image-btn').forEach(btn => btn.style.display = 'block');
    // });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
    
        const formData = new FormData(form);
        const productId = formData.get('productId'); // Retrieve the product ID from the hidden input
        const productData = Object.fromEntries(formData.entries());
    
    
        const thumbnailFile = formData.get('thumbnail');
        const thumbnailPreviewText = document.getElementById('thumbnailPreviewText');
        
        // Upload the thumbnail first if it exists
        if (thumbnailFile && thumbnailFile.size > 0) {
            
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
            } catch (error) {
                console.error('Error uploading thumbnail:', error);
                showNotification('Error uploading thumbnail', 'alert-danger');
                return;
            }
        }


        // Upload the images if they exist
        const imagesFiles = formData.getAll('images');
        if (imagesFiles.length > 1) {

            // Parse productData.urls if it exists and is a JSON string
            let existingUrls = [];
            if (productData.urls) {
                try {
                    existingUrls = JSON.parse(productData.urls);
                } catch (error) {
                    console.error('Error parsing existing urls:', error);
                    existingUrls = [];
                }
            }

            const uploadPromises = imagesFiles.map(imageFile => {
                const imageUploadFormData = new FormData();
                imageUploadFormData.append('imageUpload', imageFile);

                return fetch('/imageUpload', {
                    method: 'POST',
                    body: imageUploadFormData
                })
                .then(response => response.json())
                .then(imageUploadData => {
                    if (imageUploadData.message !== 'Upload success') {
                        showNotification('Error uploading image', 'alert-danger');
                        throw new Error('Error uploading image');
                    }
                    existingUrls.push(imageUploadData.imageUrl[0]);
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                    showNotification('Error uploading image', 'alert-danger');
                    throw error;
                });
            });

            try {
                await Promise.all(uploadPromises);
                productData.urls = existingUrls; // Keep it as an array
            } catch (error) {
                console.error('Error uploading one or more images:', error);
                return;
            }
        } else {
            // existingUrls = JSON.parse(productData.urls);
            productData.urls = JSON.parse(productData.urls);
        }


        // When sending the data, convert productData.urls to a JSON string
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
                // inputs.forEach(input => input.disabled = true);
                // editButton.style.display = 'block';
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
        const files = images.files;
        let urls = [];
    
        if (urlsInput.value) {
            try {
                urls = JSON.parse(urlsInput.value);
            } catch (error) {
                console.error('Error parsing urls input value:', error);
                urls = [];
            }
        }
    
        // Clear the preview container
        imagesPreview.innerHTML = '';
    
        // Display existing images
        urls.forEach((url, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';
            imgContainer.style.position = 'relative';
            imgContainer.style.display = 'inline-block';
    
            const img = document.createElement('img');
            img.src = url;
            img.className = 'img-fluid mt-2';
            img.style.maxWidth = '100px';
            img.style.marginRight = '10px';
    
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-danger btn-sm delete-image-btn';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '0';
            deleteBtn.style.right = '0';
            deleteBtn.style.width = '20px'; // Fixed width
            deleteBtn.style.height = '20px'; // Fixed height
            deleteBtn.style.fontSize = '12px'; // Fixed font size
            deleteBtn.textContent = 'X';
            deleteBtn.dataset.index = index;
            deleteBtn.style.display = 'none'; // Initially hidden
    
            deleteBtn.addEventListener('click', function() {
                urls.splice(deleteBtn.dataset.index, 1);
                urlsInput.value = JSON.stringify(urls);
                imgContainer.remove();
            });
    
            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            imagesPreview.appendChild(imgContainer);
        });
    
        // Display new images without updating urls input
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
                    deleteBtn.style.width = '20px'; // Fixed width
                    deleteBtn.style.height = '20px'; // Fixed height
                    deleteBtn.style.fontSize = '12px'; // Fixed font size
                    deleteBtn.textContent = 'X';
                    deleteBtn.style.display = isEditMode ? 'block' : 'none'; // Show only in edit mode
    
                    imgContainer.appendChild(img);
                    imgContainer.appendChild(deleteBtn);
                    imagesPreview.appendChild(imgContainer);
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
            let urls = [];
    
            try {
                urls = JSON.parse(urlsInput.value);
            } catch (error) {
                console.error('Error parsing urls input value:', error);
                return;
            }
    
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