const Auth = {

    // Save user to localStorage
    signup(data) {
        const users = JSON.parse(localStorage.getItem('nf_users') || '[]');
        const existing = users.find(u => u.email === data.email);
        if (existing) return { success: false, error: 'An account with this email already exists.' };
        const user = { ...data, password: btoa(data.password), plan: 'free', createdAt: Date.now() };
        users.push(user);
        localStorage.setItem('nf_users', JSON.stringify(users));
        localStorage.setItem('nf_session', JSON.stringify({ email: user.email, name: user.firstName, plan: user.plan }));
        return { success: true };
    },

    // Login user
    login(email, password, remember) {
        const users = JSON.parse(localStorage.getItem('nf_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) return { success: false, error: 'No account found with this email.' };
        if (user.password !== btoa(password)) return { success: false, error: 'Incorrect password. Try again.' };
        const session = { email: user.email, name: user.firstName, plan: user.plan };
        localStorage.setItem('nf_session', JSON.stringify(session));
        if (remember) localStorage.setItem('nf_remember', email);
        else localStorage.removeItem('nf_remember');
        return { success: true, user: session };
    },

    // Get current session
    getSession() {
        const s = localStorage.getItem('nf_session');
        return s ? JSON.parse(s) : null;
    },

    // Update user plan
    upgradePlan(plan) {
        const session = this.getSession();
        if (!session) return;
        const users = JSON.parse(localStorage.getItem('nf_users') || '[]');
        const idx = users.findIndex(u => u.email === session.email);
        if (idx > -1) { users[idx].plan = plan; localStorage.setItem('nf_users', JSON.stringify(users)); }
        session.plan = plan;
        localStorage.setItem('nf_session', JSON.stringify(session));
    },

    // Logout
    logout() {
        localStorage.removeItem('nf_session');
        window.location.href = 'index.html';
    },

    // Redirect if already logged in
    redirectIfLoggedIn(to = 'dashboard.html') {
        if (this.getSession()) window.location.href = to;
    },

    // Redirect if NOT logged in
    requireAuth(to = 'login.html') {
        if (!this.getSession()) window.location.href = to;
    }
};

// ── Validation helpers ──────────────────────
const Validate = {
    email(val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    },
    password(val) {
        return val.length >= 8;
    },
    required(val) {
        return val.trim().length > 0;
    }
};

// ── UI helpers ──────────────────────────────
function showError(inputEl, msg) {
    clearError(inputEl);
    inputEl.style.borderColor = '#ef4444';
    inputEl.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
    const err = document.createElement('p');
    err.className = 'field-error';
    err.style.cssText = 'color:#ef4444;font-size:0.75rem;margin-top:0.3rem;';
    err.textContent = msg;
    inputEl.parentNode.appendChild(err);
}

function clearError(inputEl) {
    inputEl.style.borderColor = '';
    inputEl.style.boxShadow = '';
    const existing = inputEl.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
}

function showToast(msg, type = 'error') {
    const existing = document.querySelector('.nf-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'nf-toast';
    const bg = type === 'error' ? '#ef4444' : type === 'success' ? '#34d399' : '#4f8eff';
    toast.style.cssText = `
    position:fixed;top:1.5rem;right:1.5rem;z-index:9999;
    background:${bg};color:#fff;padding:0.8rem 1.2rem;
    border-radius:10px;font-size:0.88rem;font-weight:500;
    box-shadow:0 8px 24px rgba(0,0,0,0.3);
    animation:slideIn 0.3s ease;
  `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}


// CSS for slide animation
const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`;
document.head.appendChild(style);

function initPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.add('active'); // rotate icon
        } else {
            input.type = 'password';
            toggle.classList.remove('active');
        }
    });
}
