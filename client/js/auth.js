// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Auth.js loaded');
    
    // DOM Elements
    const loginFormEl = document.getElementById('loginForm');
    const registerFormEl = document.getElementById('registerForm');
    const notification = document.getElementById('notification');

    // API Base URL
    const API_BASE = '/api/auth';

    // Login form submission
    if (loginFormEl) {
        console.log('✅ Login form found');
        loginFormEl.addEventListener('submit', async(e) => {
            e.preventDefault();
            console.log('🔐 Login form submitted');

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            console.log('Login attempt:', { email, password: '***' });

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
                console.log('Login response:', response.status, result);

                if (response.ok) {
                    // Store token and user first
                    if (result.token) {
                        localStorage.setItem('token', result.token);
                        console.log('✅ Token stored:', result.token.substring(0, 20) + '...');
                    }
                    if (result.user) {
                        localStorage.setItem('user', JSON.stringify(result.user));
                        console.log('✅ User stored:', result.user);
                    }

                    showNotification('🎉 Login successful! Redirecting...', 'success');

                    // Redirect to dashboard immediately
                    setTimeout(() => {
                        console.log('🔄 Redirecting to dashboard...');
                        window.location.href = '/dashboard.html';
                    }, 800);
                } else {
                    const errorMessage = result.errors ?
                        result.errors.map(err => err.msg).join(', ') :
                        result.message || result.error || 'Login failed';
                    console.error('❌ Login failed:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                showNotification('Network error. Please try again.', 'error');
            }
        });
    } else {
        console.log('ℹ️ No login form found on this page');
    }

    // Register form submission
    if (registerFormEl) {
        console.log('✅ Register form found');
        registerFormEl.addEventListener('submit', async(e) => {
            e.preventDefault();
            console.log('📝 Register form submitted');

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

            console.log('Registration attempt:', { ...registerData, password: '***' });

            try {
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registerData)
                });

                const result = await response.json();
                console.log('Registration response:', response.status, result);

                if (response.ok) {
                    showNotification('🎊 Registration successful! Please login.', 'success');

                    // Switch to login tab
                    setTimeout(() => {
                        const loginTab = document.getElementById('loginTab');
                        if (loginTab) loginTab.click();
                        registerFormEl.reset();
                    }, 2000);
                } else {
                    const errorMessage = result.errors ?
                        result.errors.map(err => err.msg).join(', ') :
                        result.message || result.error || 'Registration failed';
                    console.error('❌ Registration failed:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            } catch (error) {
                console.error('❌ Registration error:', error);
                showNotification('Network error. Please try again.', 'error');
            }
        });
    } else {
        console.log('ℹ️ No register form found on this page');
    }

    // Notification system
    function showNotification(message, type = 'info') {
        console.log(`📢 Notification: ${type} - ${message}`);
        
        if (!notification) {
            console.warn('⚠️ Notification element not found');
            return;
        }
        
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
        console.log('🔍 Checking auth status...');
        
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('Token exists:', !!token);
        console.log('User exists:', !!user);
        
        if (token) {
            console.log('🔐 Token found, verifying...');
            // Verify token is still valid
            fetch(`${API_BASE}/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    console.log('Token verification response:', response.status);
                    if (response.ok) {
                        console.log('✅ Token valid, redirecting to dashboard');
                        window.location.href = '/dashboard.html';
                    } else {
                        console.log('❌ Token invalid, clearing storage');
                        // Token is invalid, remove it
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                })
                .catch(error => {
                    console.error('❌ Auth check error:', error);
                });
        } else {
            console.log('ℹ️ No token found, staying on login page');
        }
    }

    // Check auth status on page load
    checkAuthStatus();
});