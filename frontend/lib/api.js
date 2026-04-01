const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Get token from localStorage
function getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

export async function fetchAPI(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    const token = getAuthToken();

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    // Add JWT token if available
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        throw error;
    }
}

export async function uploadFile(file) {
    console.log('[uploadFile] Starting upload...');
    console.log('[uploadFile] File:', file.name, 'Size:', file.size, 'Type:', file.type);
    const token = getAuthToken();
    console.log('[uploadFile] Token present:', !!token);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const config = {
            method: 'POST',
            body: formData,
        };

        // Add JWT token if available
        if (token) {
            config.headers = {
                'Authorization': `Bearer ${token}`,
            };
        }

        const res = await fetch(`${API_BASE_URL}/resume/upload`, config);

        console.log('[uploadFile] Response status:', res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[uploadFile] Error response body:', errorText);

            let errorDetail = 'Upload failed';
            try {
                const errorData = JSON.parse(errorText);
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                errorDetail = errorText || errorDetail;
            }
            throw new Error(errorDetail);
        }

        const data = await res.json();
        console.log('[uploadFile] ✅ Upload successful:', data);
        return data;
    } catch (error) {
        if (error.message && !error.message.includes('fetch')) {
            // Re-throw API errors as-is
            console.error('[uploadFile] ❌ API Error:', error.message);
            throw error;
        }
        // Network error
        console.error('[uploadFile] ❌ Network error:', error);
        throw new Error('Network error: Cannot reach the backend server. Is it running on http://localhost:8000?');
    }
}
