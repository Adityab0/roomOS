import { apiCall } from '../api.js';

export async function renderDashboard() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="flex-center p-4"><div class="loader">Loading...</div></div>';

    try {
        const token = localStorage.getItem('token');
        const [rosterRes, taskRes] = await Promise.all([
            apiCall('/roster/today', 'GET', null, token),
            apiCall('/tasks/today', 'GET', null, token)
        ]);

        const today = rosterRes.today;
        const tasks = taskRes.tasks;

        // If no roster set yet
        if (!today) {
            container.innerHTML = `
                <div class="fade-in p-4">
                    <h1>Dashboard</h1>
                    <div class="card mt-4">
                        <p>Roster not set up yet.</p>
                    </div>
                </div>
            `;
            return;
        }

        const morning = JSON.parse(today.morning || '[]');
        const night = JSON.parse(today.night || '[]');

        let taskHtml = '';
        if (tasks) {
            taskHtml = '<div class="task-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">';
            for (const [task, person] of Object.entries(tasks)) {
                taskHtml += `
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${task}</div>
                        <div style="font-weight: 600;">${person}</div>
                    </div>
                `;
            }
            taskHtml += '</div>';
        } else {
            taskHtml = `
                <p style="color: var(--text-secondary);">Lottery not run yet.</p>
                <button id="run-lottery-btn" class="btn btn-primary mt-4">Run Lottery 🎲</button>
            `;
        }

        container.innerHTML = `
            <div class="fade-in" style="padding-bottom: 80px;">
                <div class="flex-center" style="justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h1>Today</h1>
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                <!-- Morning Shift -->
                <div class="card mb-4" style="border-left: 4px solid var(--warning);">
                    <div class="flex-center" style="justify-content: flex-start; gap: 10px; margin-bottom: 1rem;">
                        <span style="font-size: 1.5rem;">☀️</span>
                        <h3>Morning Shift</h3>
                    </div>
                    <div class="shift-members">
                        ${morning.length ? morning.map(name => `<div class="chip">${name}</div>`).join('') : '<p>No one assigned</p>'}
                    </div>
                    ${today.passenger_m ? `<div class="mt-4 p-2" style="background: rgba(255,255,255,0.05); border-radius: 8px;"><small>Passenger: ${today.passenger_m}</small></div>` : ''}
                </div>

                <!-- Night Shift -->
                <div class="card mb-4" style="border-left: 4px solid var(--accent-primary);">
                    <div class="flex-center" style="justify-content: flex-start; gap: 10px; margin-bottom: 1rem;">
                        <span style="font-size: 1.5rem;">🌙</span>
                        <h3>Night Shift</h3>
                    </div>
                    <div class="shift-members">
                        ${night.length ? night.map(name => `<div class="chip">${name}</div>`).join('') : '<p>No one assigned</p>'}
                    </div>
                    ${today.passenger_n ? `<div class="mt-4 p-2" style="background: rgba(255,255,255,0.05); border-radius: 8px;"><small>Passenger: ${today.passenger_n}</small></div>` : ''}
                </div>

                <!-- Tasks -->
                <div class="card">
                    <div class="flex-center" style="justify-content: flex-start; gap: 10px; margin-bottom: 1rem;">
                        <span style="font-size: 1.5rem;">🧹</span>
                        <h3>Daily Tasks</h3>
                    </div>
                    ${taskHtml}
                </div>
            </div>
        `;

        // Attach Handler
        const lotteryBtn = document.getElementById('run-lottery-btn');
        if (lotteryBtn) {
            lotteryBtn.addEventListener('click', async () => {
                try {
                    lotteryBtn.disabled = true;
                    lotteryBtn.textContent = 'Spinning...';
                    await apiCall('/tasks/assign', 'POST', { date: new Date().toISOString().split('T')[0] }, token);
                    renderDashboard(); // Refresh
                } catch (e) {
                    alert(e.message);
                    lotteryBtn.disabled = false;
                }
            });
        }

    } catch (error) {
        container.innerHTML = `<div class="p-4" style="color: var(--danger)">Error: ${error.message}</div>`;
    }
}
