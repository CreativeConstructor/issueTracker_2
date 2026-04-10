document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await ApiClient.post('/token/', { username, password });
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    window.location.href = '/dashboard/';
                } else {
                    alert('Invalid credentials. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Authentication service error');
            }
        });
    }

    // Auth state detection
    const authButtons = document.getElementById('auth-buttons');
    if (authButtons) {
        if (localStorage.getItem('access_token')) {
            authButtons.innerHTML = `
                <a href="/dashboard/" class="btn-primary" style="text-decoration: none;">Dashboard</a>
                <a href="#" onclick="logout()" style="color: var(--danger); margin-left: 15px;">Logout</a>
            `;
        }
    }
});

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
}
