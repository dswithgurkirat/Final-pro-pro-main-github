// api.js - Centralized Backend Communication

const API_BASE_URL = 'http://localhost:8080/api';

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('dsr_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }
        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

async function apiUploadFile(file) {
    const token = localStorage.getItem('dsr_token');
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/files/upload`, {
            method: 'POST',
            body: formData,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }
        return data;
    } catch (error) {
        console.error("API Upload Error:", error);
        throw error;
    }
}
