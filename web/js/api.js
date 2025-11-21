import { cacheData, getCachedData, queueAction } from './store.js';

export const API_BASE = 'https://sumit11.serv00.net/roomOS/server/public';

export async function apiCall(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        // Try Network
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        // If GET, Cache it
        if (method === 'GET') {
            cacheData(endpoint, data).catch(console.error);
        }

        return data;
    } catch (error) {
        console.warn('Network failed, falling back to offline mode:', error);

        // If GET, try Cache
        if (method === 'GET') {
            const cached = await getCachedData(endpoint);
            if (cached) {
                console.log('Serving from cache:', endpoint);
                return cached;
            }
        }
        // If POST/PUT, Queue it
        else if (method === 'POST' || method === 'PUT') {
            await queueAction(endpoint, method, body);
            console.log('Action queued for sync');
            // Return a fake success so UI updates optimistically (if we handled that)
            // For now, throw error but maybe UI can handle "Offline" state
            // Ideally we return a dummy object or throw specific OfflineError
            throw new Error('You are offline. Action saved and will sync when online.');
        }

        throw error;
    }
}
