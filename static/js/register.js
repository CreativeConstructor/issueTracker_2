document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password_confirm').value;
            const role = document.getElementById('role').value;
            
            if (password !== passwordConfirm) {
                alert('Passwords do not match!');
                return;
            }
            
            try {
                const response = await ApiClient.post('/register/', { username, password, password_confirm: passwordConfirm, role });
                const data = await response.json();
                
                if (response.ok) {
                    alert('Account created successfully! Please log in.');
                    window.location.href = '/login/';
                } else {
                    // Display validation errors
                    let errorMessage = 'Registration failed:\n';
                    for (const field in data) {
                        if (Array.isArray(data[field])) {
                            errorMessage += `${field}: ${data[field].join(', ')}\n`;
                        } else {
                            errorMessage += `${field}: ${data[field]}\n`;
                        }
                    }
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration service error. Please try again.');
            }
        });
    }
});