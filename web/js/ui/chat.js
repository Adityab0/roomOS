import { apiCall } from '../api.js';

let pollInterval = null;
let lastId = 0;

export async function renderChat() {
    const container = document.getElementById('view-container');

    // Cleanup previous poll if any
    if (pollInterval) clearInterval(pollInterval);
    lastId = 0;

    container.innerHTML = `
        <div class="fade-in" style="height: calc(100vh - 80px); display: flex; flex-direction: column;">
            <div class="flex-center mb-2">
                <h1>Chat</h1>
            </div>
            
            <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 10px;">
                <div class="loader flex-center w-full"></div>
            </div>

            <div style="padding: 10px; background: var(--bg-card); border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px;">
                <input type="text" id="chat-input" class="input-field" placeholder="Type a message..." style="margin-bottom: 0;">
                <button id="send-btn" class="btn btn-primary" style="width: auto; padding: 0 20px;">➤</button>
            </div>
        </div>
    `;

    const msgContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const user = JSON.parse(localStorage.getItem('user'));

    // Initial Load
    await loadMessages(msgContainer, user.id);

    // Poll
    pollInterval = setInterval(() => loadMessages(msgContainer, user.id), 3000);

    // Send Handler
    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        input.value = ''; // Optimistic clear
        try {
            await apiCall('/chat/send', 'POST', { message: text }, localStorage.getItem('token'));
            loadMessages(msgContainer, user.id); // Immediate fetch
        } catch (e) {
            alert('Failed to send');
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

async function loadMessages(container, myId) {
    try {
        const token = localStorage.getItem('token');
        const res = await apiCall(`/chat/since?last_id=${lastId}`, 'GET', null, token);

        if (res.messages.length > 0) {
            // Remove loader if present
            const loader = container.querySelector('.loader');
            if (loader) loader.remove();

            res.messages.forEach(msg => {
                lastId = Math.max(lastId, msg.id);
                const isMe = msg.sender_id == myId;

                const div = document.createElement('div');
                div.className = `msg-bubble ${isMe ? 'me' : 'them'}`;
                div.innerHTML = `
                    ${!isMe ? `<div class="sender">${msg.name}</div>` : ''}
                    <div class="text">${msg.message}</div>
                    <div class="time">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                `;
                container.appendChild(div);
            });

            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        } else if (lastId === 0) {
            const loader = container.querySelector('.loader');
            if (loader) loader.innerHTML = '<p style="color: var(--text-secondary)">No messages yet</p>';
        }
    } catch (e) {
        console.error(e);
    }
}

// Stop polling when navigating away
export function stopChatPolling() {
    if (pollInterval) clearInterval(pollInterval);
}
