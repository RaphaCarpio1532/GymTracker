/* ===== GYMTRACKER V02 — UI Utilities ===== */

function showScreen(n) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + n);
    if (el) {
        el.classList.add('active');
        el.classList.add('screen-enter');
        setTimeout(() => el.classList.remove('screen-enter'), 300);
    }
}

function goTo(tab) {
    document.getElementById('bottom-nav').style.display = 'block';
    showScreen(tab);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('nav-' + tab).classList.add('active');
    if (tab === 'dashboard') renderDashboard();
    else if (tab === 'training') renderTraining();
    else if (tab === 'progress') renderProgress();
    else if (tab === 'profile') renderProfile();
}

function updateWelcome() {
    document.getElementById('google-btn-text').textContent = t('google-btn-text');
    document.getElementById('w-subtitle').textContent = t('w-subtitle');
    document.getElementById('nav-t-dash').textContent = t('nav-dash');
    document.getElementById('nav-t-train').textContent = t('nav-train');
    document.getElementById('nav-t-prog').textContent = t('nav-prog');
    document.getElementById('nav-t-prof').textContent = t('nav-prof');
    const es = document.getElementById('lang-es'), it = document.getElementById('lang-it');
    if (state.lang === 'es') {
        es.style.background = '#cafd00'; es.style.color = '#0e0e0e';
        it.style.background = '#222222'; it.style.color = '#e5e2e1';
    } else {
        it.style.background = '#cafd00'; it.style.color = '#0e0e0e';
        es.style.background = '#222222'; es.style.color = '#e5e2e1';
    }
}

function setLang(l) {
    state.lang = l;
    document.documentElement.lang = l;
    saveState();
    updateWelcome();
}

// --- Modal ---
function showModal(ti, tx, cb) {
    document.getElementById('modal-title').textContent = ti;
    document.getElementById('modal-text').textContent = tx;
    modalCallback = cb;
    document.getElementById('modal').classList.add('active');
}
function closeModal() {
    document.getElementById('modal').classList.remove('active');
    modalCallback = null;
}
function confirmModal() {
    if (modalCallback) modalCallback();
    closeModal();
}
