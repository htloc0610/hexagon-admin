const editButton = document.getElementById('edit-profile-btn');
const updateButton = document.getElementById('update-profile-btn');
const changePasswordButton = document.getElementById('change-password-btn');
const profileForm = document.getElementById('profile-details-form');
const passwordForm = document.getElementById('change-password-form');
const inputs = document.querySelectorAll('#profile-details-form input');
const profileImgInput = document.getElementById('profileImg');
const profileImgPreview = document.getElementById('avatar-preview');
const uploadAvatarButton = document.getElementById('upload-avatar-btn');
const imgDiv = document.getElementById('img-div');
const cancelChangePasswordButton = document.getElementById('cancel-change-password-btn');

const errorMessageDiv = document.getElementById('error-message');
const successMessageDiv = document.getElementById('success-message');

// Initially hide the upload avatar button
// uploadAvatarButton.style.display = 'none';

// Helper to show error message
function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    successMessageDiv.style.display = 'none';
    setTimeout(() => {
        errorMessageDiv.style.display = 'none';
    }, 10000); // Display for 10 seconds
}

// Helper to show success message
function showSuccess(message) {
    successMessageDiv.textContent = message;
    successMessageDiv.style.display = 'block';
    errorMessageDiv.style.display = 'none';
    setTimeout(() => {
        successMessageDiv.style.display = 'none';
    }, 10000); // Display for 10 seconds
}

// Enable editing profile fields
editButton.addEventListener('click', () => {
    inputs.forEach(input => {
        if (input.id !== 'email' && input.id !== 'username') {
            input.removeAttribute('disabled');
        }
    });
    imgDiv.style.display = 'block';
    updateButton.style.display = 'block';
    editButton.style.display = 'none';
});

// Show password form
changePasswordButton.addEventListener('click', () => {
    passwordForm.style.display = 'block';
    changePasswordButton.style.display = 'none';
});


// Cancel changing password
cancelChangePasswordButton.addEventListener('click', () => {
    passwordForm.style.display = 'none';
    changePasswordButton.style.display = 'block';
    passwordForm.reset();
});

// Preview profile image
profileImgInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImgPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

uploadAvatarButton.addEventListener('click', function() {
    profileImgInput.click();
});

// Validation for profile form
function validateProfileForm(formObject) {
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(formObject.username)) {
        showError('Username cannot contain special characters.');
        return false;
    }
    for (let key in formObject) {
        if (formObject[key].length > 255) {
            showError(`${key} must be less than 255 characters.`);
            return false;
        }
    }
    return true;
}

// Validation for password form
function validatePasswordForm(formObject) {
    if (formObject.newPassword.length < 6) {
        showError('New password must be at least 6 characters long.');
        return false;
    }
    if (formObject.newPassword === formObject.oldPassword) {
        showError('New password must be different from the old password.');
        return false;
    }
    return true;
}

// Handle profile form submission
profileForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(profileForm);
    const profileImgFile = formData.get('profileImg');

    if (profileImgFile && profileImgFile.size > 0) {
        // Upload the image first
        const imageUploadFormData = new FormData();
        imageUploadFormData.append('imageUpload', profileImgFile);

        const imageUploadResponse = await fetch('/imageUpload', {
            method: 'POST',
            body: imageUploadFormData
        });

        const imageUploadData = await imageUploadResponse.json();

        if (imageUploadData.message !== 'Upload success') {
            showError('Error uploading image');
            return;
        }

        formData.append('profileImgUrl', imageUploadData.imageUrl);
    }

    const formObject = Object.fromEntries(formData.entries());

    if (!validateProfileForm(formObject)) return;

    fetch(profileForm.action, {
        method: 'PUT',
        body: JSON.stringify(formObject),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                showSuccess('Profile updated successfully.');
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error updating profile.');
        });
});

// Handle password form submission
passwordForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(passwordForm);
    const formObject = Object.fromEntries(formData.entries());

    if (!validatePasswordForm(formObject)) return;

    fetch(passwordForm.action, {
        method: 'PUT',
        body: JSON.stringify(formObject),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                showSuccess('Password updated successfully.');
                passwordForm.style.display = 'none';
                changePasswordButton.style.display = 'block';
                passwordForm.reset();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Error updating password.');
        });
});