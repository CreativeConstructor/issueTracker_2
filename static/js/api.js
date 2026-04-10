const API_BASE_URL = '/api';

class ApiClient {
    static getHeaders() {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = this.getHeaders();
        
        let response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            // Token expired or invalid, auto-logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (window.location.pathname !== '/login/') {
                window.location.href = '/login/';
            }
        }
        return response;
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}
