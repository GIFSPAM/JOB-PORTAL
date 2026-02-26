const BASE_URL = 'http://127.0.0.1:5000/api';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        const data = await response.json();

        if (!response.ok) {
            // Forward specific backend messages (e.g., "User already exists")
            throw new Error(data.message || data.err || 'API Error');
        }
        return data;
    } catch (err) {
        throw err;
    }
};