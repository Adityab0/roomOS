import { apiCall } from '../api.js';
import { navigate } from '../app.js';

export function renderLogin() {
    const container = document.getElementById('view-container');

    container.innerHTML = `
        <div class="fade-in" style="margin-top: 20vh;">
            <div class="flex-center" style="margin-bottom: 2rem;">
                <h1 style="background: linear-gradient(to right, var(--accent-primary), var(--success)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">RoomOS</h1>
            </div>
            
            <div class="card">
                <h2 class="mb-4" id="form-title">Welcome Back</h2>
                
                <form id="auth-form">
                    <div id="name-field" class="input-group hidden">
                        <input type="text" id="name" class="input-field" placeholder="Full Name">
                    </div>
                    
                    <div class="input-group">
                        <input type="email" id="email" class="input-field" placeholder="Email Address" required>
                    </div>
                    
                    <div class="input-group">
                        <input type="password" id="password" class="input-field" placeholder="Password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary mb-4" id="submit-btn">Login</button>
                    
                    <div class="flex-center">
                        <a href="#" id="toggle-auth" style="color: var(--accent-primary); text-decoration: none; font-size: 0.9rem;">
                            New here? Create account
                        </a>
                    </div>
                </form>
            </div>
        </div>
    `;

    let isLogin = true;
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');
    const nameField = document.getElementById('name-field');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            nameField.classList.add('hidden');
            formTitle.textContent = 'Welcome Back';
            submitBtn.textContent = 'Login';
            toggleBtn.textContent = 'New here? Create account';
            document.getElementById('name').required = false;
        } else {
            nameField.classList.remove('hidden');
            formTitle.textContent = 'Create Account';
            submitBtn.textContent = 'Register';
            toggleBtn.textContent = 'Already have an account? Login';
            document.getElementById('name').required = true;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            if (isLogin) {
                const res = await apiCall('/auth/login', 'POST', { email, password });
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                navigate('dashboard');
            } else {
                await apiCall('/auth/register', 'POST', { name, email, password });
                alert('Account created! Please login.');
                // Switch to login mode
                toggleBtn.click();
            }
        } catch (error) {
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Login' : 'Register';
        }
    });
}
