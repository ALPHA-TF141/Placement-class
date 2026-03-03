document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const errorList = document.getElementById('errors');
    errorList.innerHTML = '';

    let isValid = true;

    const usernameInput = document.getElementById('username');
    if (usernameInput.value.trim() === '') {
        showError(usernameInput, 'Username is required.');
        isValid = false;
    }

    const emailInput = document.getElementById('email');
    if (emailInput.value.trim() === '') {
        showError(emailInput, 'Email is required.');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address.');
        isValid = false;
    }
    const passwordInput = document.getElementById('password');
    if (passwordInput.value.trim() === '') {
        showError(passwordInput, 'Password is required.');
        isValid = false;
    }
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput.value.trim() === '') {
        showError(confirmPasswordInput, 'Confirm password is required.');
        isValid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match.');
        isValid = false;
    }

    if (isValid) {
        console.log('Form submitted successfully!');
    }
});

function showError(inputElement, errorMessage) {
    const errorList = document.getElementById('errors');
    let li = document.createElement('li');
    li.textContent = errorMessage;
    li.style.color = 'red';
    errorList.appendChild(li);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
