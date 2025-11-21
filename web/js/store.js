const DB_NAME = 'roomos_db';
const DB_VERSION = 1;

let dbPromise = null;

export function initDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            // Stores for caching API responses
            if (!db.objectStoreNames.contains('api_cache')) {
                db.createObjectStore('api_cache', { keyPath: 'endpoint' });
            }
            // Store for pending offline actions
            if (!db.objectStoreNames.contains('pending_actions')) {
                db.createObjectStore('pending_actions', { autoIncrement: true });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e);
    });

    return dbPromise;
}

export async function cacheData(endpoint, data) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('api_cache', 'readwrite');
        const store = tx.objectStore('api_cache');
        store.put({ endpoint, data, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getCachedData(endpoint) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('api_cache', 'readonly');
        const store = tx.objectStore('api_cache');
        const request = store.get(endpoint);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => reject(request.error);
    });
}

export async function queueAction(endpoint, method, body) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_actions', 'readwrite');
        const store = tx.objectStore('pending_actions');
        store.add({ endpoint, method, body, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getPendingActions() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_actions', 'readonly');
        const store = tx.objectStore('pending_actions');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function clearPendingAction(key) {
    // Implementation needed if we want to remove specific items, 
    // but for MVP we might just clear all after sync or handle one by one.
    // Since getAll returns values without keys if we don't use openCursor, 
    // let's just clear all for now after successful sync batch.
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('pending_actions', 'readwrite');
        const store = tx.objectStore('pending_actions');
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
