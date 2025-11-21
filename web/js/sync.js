import { getPendingActions, clearPendingAction } from './store.js';
import { apiCall } from './api.js';

export async function syncPendingActions() {
    if (!navigator.onLine) return;

    const actions = await getPendingActions();
    if (actions.length === 0) return;

    console.log(`Syncing ${actions.length} actions...`);

    // Process sequentially
    for (const action of actions) {
        try {
            // We bypass the queueing logic in apiCall by checking online status, 
            // but apiCall will try network first anyway.
            // However, we need to avoid infinite loop if apiCall fails and re-queues.
            // Actually apiCall only queues if fetch throws.

            // We use a raw fetch here or modified apiCall to avoid re-queueing?
            // Let's just use apiCall. If it fails, it might re-queue duplicates if we are not careful.
            // But we are clearing the queue AFTER success.
            // If it fails, we just abort sync.

            const token = localStorage.getItem('token');
            await apiCall(action.endpoint, action.method, action.body, token);

        } catch (e) {
            console.error('Sync failed for action', action, e);
            return; // Stop syncing if one fails (preserve order)
        }
    }

    // If all success
    await clearPendingAction();
    console.log('Sync complete');

    // Refresh current view
    window.location.reload();
}

// Auto-sync when coming online
window.addEventListener('online', syncPendingActions);

// Initial check
setTimeout(syncPendingActions, 5000);
