import { API_BASE, APP_VERSION } from '../api.js';

export async function checkUpdates() {
    try {
        const response = await fetch(`${API_BASE}/app/updates`);
        const data = await response.json();

        if (data.success && data.update) {
            const latestVersion = data.update.version;
            const currentVersion = APP_VERSION;

            if (compareVersions(latestVersion, currentVersion) > 0) {
                showUpdatePopup(data.update);
            }
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}

function showUpdatePopup(update) {
    // Check if popup already exists
    if (document.getElementById('update-popup')) return;

    const popupHtml = `
        <div id="update-popup" class="modal-overlay">
            <div class="modal-content">
                <div style="font-size: 3rem; margin-bottom: var(--space-md);">🚀</div>
                <h2 style="margin-bottom: var(--space-sm);">New Update Available!</h2>
                <p style="color: var(--text-secondary); margin-bottom: var(--space-md);">
                    Version ${update.version} is now available.
                </p>
                ${update.release_notes ? `
                    <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-lg); text-align: left; font-size: 0.9rem; color: var(--text-secondary);">
                        ${update.release_notes}
                    </div>
                ` : ''}
                <div class="modal-actions">
                    <button class="btn" style="background: var(--bg-elevated); color: var(--text-secondary);" onclick="document.getElementById('update-popup').remove()">
                        Later
                    </button>
                    <button class="btn btn-primary" onclick="window.open('${update.download_url}', '_blank')">
                        Download Now
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHtml);
}
