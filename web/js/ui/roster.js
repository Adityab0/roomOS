import { apiCall } from '../api.js';

export async function renderRoster() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="flex-center p-4"><div class="loader">Loading...</div></div>';

    try {
        const token = localStorage.getItem('token');
        const res = await apiCall('/roster/week', 'GET', null, token);
        const roster = res.roster;
        const isAdmin = res.role === 'admin';

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        let html = `
            <div class="fade-in" style="padding-bottom: 80px;">
                <h1 class="mb-4">Weekly Roster</h1>
                ${isAdmin ? '<p class="mb-4" style="font-size: 0.8rem; color: var(--accent-primary);">Tap a day to edit</p>' : ''}
                <div class="roster-grid">
        `;

        roster.forEach(day => {
            const morning = JSON.parse(day.morning || '[]');
            const night = JSON.parse(day.night || '[]');
            const dayName = days[day.day_index];

            html += `
                <div class="card mb-4 ${isAdmin ? 'editable-day' : ''}" data-day="${day.day_index}">
                    <h3 class="mb-2" style="color: var(--text-secondary);">${dayName}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
                            <div style="font-size: 0.8rem; color: var(--warning); margin-bottom: 4px;">MORNING</div>
                            ${morning.length ? morning.join(', ') : '-'}
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px;">
                            <div style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 4px;">NIGHT</div>
                            ${night.length ? night.join(', ') : '-'}
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
        container.innerHTML = html;

        // Edit Handler (Simple Prompt for MVP, can be upgraded to Modal later)
        if (isAdmin) {
            document.querySelectorAll('.editable-day').forEach(el => {
                el.addEventListener('click', async () => {
                    const dayIndex = el.dataset.day;
                    const dayName = days[dayIndex];

                    // Very basic editing for MVP - using prompt is ugly but functional for now
                    // In a real app we'd use a modal with checkboxes
                    const m1 = prompt(`Edit ${dayName} Morning (Person 1):`);
                    const m2 = prompt(`Edit ${dayName} Morning (Person 2):`);
                    const n1 = prompt(`Edit ${dayName} Night (Person 1):`);
                    const n2 = prompt(`Edit ${dayName} Night (Person 2):`);

                    if (m1 !== null) { // If not cancelled
                        const morning = [m1, m2].filter(x => x);
                        const night = [n1, n2].filter(x => x);

                        try {
                            await apiCall('/roster/update', 'POST', {
                                day_index: dayIndex,
                                morning,
                                night,
                                passenger_m: '',
                                passenger_n: ''
                            }, token);
                            renderRoster(); // Refresh
                        } catch (e) {
                            alert(e.message);
                        }
                    }
                });
            });
        }

    } catch (error) {
        container.innerHTML = `<div class="p-4" style="color: var(--danger)">Error: ${error.message}</div>`;
    }
}
