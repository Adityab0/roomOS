import { apiCall } from '../api.js';
import { navigate } from '../app.js';

export function renderGroupSetup() {
    const container = document.getElementById('view-container');

    container.innerHTML = `
        <div class="fade-in" style="margin-top: 10vh;">
            <h1 class="mb-4">Setup Group</h1>
            <p class="mb-4">You need to join a flat/room group to continue.</p>
            
            <div class="card mb-4">
                <h2 class="mb-4">Create New Group</h2>
                <div class="input-group">
                    <input type="text" id="new-group-name" class="input-field" placeholder="Group Name (e.g. Flat 302)">
                </div>
                <button id="create-group-btn" class="btn btn-primary">Create Group</button>
            </div>

            <div class="flex-center mb-4">
                <span style="color: var(--text-secondary)">OR</span>
            </div>

            <div class="card">
                <h2 class="mb-4">Join Existing Group</h2>
                <div class="input-group">
                    <input type="number" id="join-group-id" class="input-field" placeholder="Group ID">
                </div>
                <button id="join-group-btn" class="btn" style="background: var(--bg-input); color: white;">Join Group</button>
            </div>
        </div>
    `;

    // Create Handler
    document.getElementById('create-group-btn').addEventListener('click', async () => {
        const name = document.getElementById('new-group-name').value;
        if (!name) return alert('Please enter a name');

        try {
            const token = localStorage.getItem('token');
            const res = await apiCall('/group/create', 'POST', { name }, token);

            // Update local user state
            const user = JSON.parse(localStorage.getItem('user'));
            user.group_id = res.group_id;
            user.role = 'admin';
            localStorage.setItem('user', JSON.stringify(user));

            alert(`Group Created! Your Group ID is ${res.group_id}. Share this with your roommates.`);
            navigate('dashboard');
        } catch (error) {
            alert(error.message);
        }
    });

    // Join Handler
    document.getElementById('join-group-btn').addEventListener('click', async () => {
        const groupId = document.getElementById('join-group-id').value;
        if (!groupId) return alert('Please enter a Group ID');

        try {
            const token = localStorage.getItem('token');
            await apiCall('/group/join', 'POST', { group_id: groupId }, token);

            // Update local user state
            const user = JSON.parse(localStorage.getItem('user'));
            user.group_id = groupId;
            localStorage.setItem('user', JSON.stringify(user));

            alert('Joined group successfully!');
            navigate('dashboard');
        } catch (error) {
            alert(error.message);
        }
    });
}
