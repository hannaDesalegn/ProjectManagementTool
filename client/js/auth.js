// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginFormEl = document.getElementById('loginForm');
    const registerFormEl = document.getElementById('registerForm');
    const notification = document.getElementById('notification');

    // API Base URL
    const API_BASE = '/api/auth';

    // Login form submission
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', async(e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const loginData = { email, password };

            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Store token and user first
                    if (result.token) {
                        localStorage.setItem('token', result.token);
                        console.log('Token stored:', result.token.substring(0, 20) + '...');
                    }
                    if (result.user) {
                        localStorage.setItem('user', JSON.stringify(result.user));
                        console.log('User stored:', result.user);
                    }

                    showNotification('🎉 Login successful! Redirecting...', 'success');

                    // Redirect to dashboard immediately
                    setTimeout(() => {
                        console.log('Redirecting to dashboard...');
                        window.location.href = '/dashboard.html';
                    }, 800);
                } else {
                    const errorMessage = result.errors ?
                        result.errors.map(err => err.msg).join(', ') :
                        result.message || 'Login failed';
                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showNotification('Network error. Please try again.', 'error');
            }
        });
    }

    // Register form submission
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', async(e) => {
            e.preventDefault();

            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const phone = document.getElementById('registerPhone').value;
            const termsAccepted = document.getElementById('registerTerms').checked;

            if (!termsAccepted) {
                showNotification('Please accept the terms and conditions', 'error');
                return;
            }

            const registerData = {
                name,
                email,
                password,
                phone: phone || undefined,
                termsAccepted
            };

            try {
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registerData)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification('🎊 Registration successful! Please login.', 'success');

                    // Switch to login tab
                    setTimeout(() => {
                        document.getElementById('loginTab').click();
                        registerFormEl.reset();
                    }, 2000);
                } else {
                    const errorMessage = result.errors ?
                        result.errors.map(err => err.msg).join(', ') :
                        result.message || 'Registration failed';
                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showNotification('Network error. Please try again.', 'error');
            }
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const colors = {
            'success': 'bg-green-500/20 border-2 border-green-500 text-green-400',
            'error': 'bg-red-500/20 border-2 border-red-500 text-red-400',
            'info': 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl font-medium shadow-2xl transform transition-transform duration-300 ${colors[type] || colors['info']}`;
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 4000);
    }

    // Check if user is already logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token is still valid
            fetch(`${API_BASE}/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/dashboard.html';
                    } else {
                        // Token is invalid, remove it
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                })
                .catch(error => {
                    console.error('Auth check error:', error);
                });
        }
    }

    // Check auth status on page load
    checkAuthStatus();
});