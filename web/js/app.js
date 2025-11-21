import { renderLogin } from './ui/login.js';
import { renderGroupSetup } from './ui/group_setup.js';
import { renderDashboard } from './ui/dashboard.js';
import { renderRoster } from './ui/roster.js';
import { renderTransactions } from './ui/transactions.js';
import { renderChat, stopChatPolling } from './ui/chat.js';
import './sync.js'; // Start sync listener

// Simple State
const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
};

// Router
export function navigate(view) {
    const container = document.getElementById('view-container');
    const nav = document.getElementById('bottom-nav');

    // Clear current view
    container.innerHTML = '';

    // Handle Auth Guard
    if (!localStorage.getItem('token') && view !== 'login') {
        view = 'login';
    }

    // Handle Group Guard
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && !user.group_id && view !== 'login') {
        // If logged in but no group, force group setup
        // We'll handle this by rendering group setup directly if view is dashboard
        if (view === 'dashboard' || view === 'roster' || view === 'chat' || view === 'transactions') {
            renderGroupSetup();
            // Show nav but maybe disable items? For now let's hide nav
            nav.classList.add('hidden');
            return;
        }
    }

    // Show/Hide Nav
    if (view === 'login') {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
        updateActiveNav(view);
    }

    // Cleanup Chat Poll if leaving chat
    if (view !== 'chat') {
        stopChatPolling();
    }

    // Render View
    switch (view) {
        case 'login':
            renderLogin();
            break;
        case 'dashboard':
            renderDashboard();
            break;
        case 'roster':
            renderRoster();
            break;
        case 'chat':
            renderChat();
            break;
        case 'transactions':
            renderTransactions();
            break;
        default:
            renderLogin();
    }
}

function updateActiveNav(view) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.target === view) {
            item.classList.add('active');
        }
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Nav Click Handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navigate(item.dataset.target);
        });
    });

    // Initial Route
    if (state.token) {
        navigate('dashboard');
    } else {
        navigate('login');
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('SW Registered'))
            .catch(err => console.error('SW Fail', err));
    }
});
