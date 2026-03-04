// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const verificationStatus = document.getElementById('verificationStatus');
const notification = document.getElementById('notification');

// Verify email on page load
async function verifyEmail() {
    if (!token) {
        showError('Invalid verification link');
        return;
    }

    try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (response.ok) {
            showSuccess();
        } else {
            showError(result.message || 'Verification failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        showError('Network error. Please try again.');
    }
}

function showSuccess() {
    verificationStatus.innerHTML = `
        <div class="success-message">
            <p style="font-size: 4rem; margin-bottom: 20px;">✅</p>
            <h2 style="color: #28a745; margin-bottom: 15px;">Email Verified!</h2>
            <p style="margin-bottom: 20px;">Your email has been successfully verified.</p>
            <button onclick="goToLogin()" class="auth-btn">Go to Login</button>
        </div>
    `;
}

function showError(message) {
    verificationStatus.innerHTML = `
        <div class="error-message">
            <p style="font-size: 4rem; margin-bottom: 20px;">❌</p>
            <h2 style="color: #dc3545; margin-bottom: 15px;">Verification Failed</h2>
            <p style="margin-bottom: 20px;">${message}</p>
            <button onclick="goToLogin()" class="auth-btn" style="background: #6c757d;">Back to Login</button>
        </div>
    `;
}

function goToLogin() {
    window.location.href = '/';
}

// Notification system
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Start verification on page load
document.addEventListener('DOMContentLoaded', verifyEmail);