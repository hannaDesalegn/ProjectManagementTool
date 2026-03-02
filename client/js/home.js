// DOM Elements
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const goToDashboard = document.getElementById('goToDashboard');
const notification = document.getElementById('notification');

// Check authentication on page load
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '/';
        return;
    }

    try {
        const userData = JSON.parse(user);
        userName.textContent = `Welcome, ${userData.name}!`;
    } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
    }
}

// Navigate to dashboard
function goToDashboardPage() {
    window.location.href = '/dashboard.html';
}

// Logout functionality
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Event listeners
logoutBtn.addEventListener('click', logout);
if (goToDashboard) {
    goToDashboard.addEventListener('click', goToDashboardPage);
}

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth);