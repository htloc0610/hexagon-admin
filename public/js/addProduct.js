document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addProductForm');
    const notification = document.getElementById('notification');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
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

            formData.append('url', thumbnailUploadData.imageUrl);
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

                imagesUrls.push(imagesUploadData.imageUrl);
            }

            formData.append('urls', JSON.stringify(imagesUrls));
        }

        const formObject = Object.fromEntries(formData.entries());

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
            }
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'alert-danger');
        }
    });

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
});