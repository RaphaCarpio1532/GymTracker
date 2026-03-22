/* ===== GYMTRACKER V02 — State & Firebase ===== */

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

let state = {
    lang: 'es',
    profile: { gender: '', height: 0, weight: 0, target: 0 },
    freq: 0, days: [], goals: {}, plan: null,
    attendance: {}, logs: {},
    measurements: { chest: 0, waist: 0, hips: 0, thighs: 0 },
    location: 'gym', equipment: ['mancuerna'],
    onboarded: false,
    currentWorkoutDay: null, currentExerciseIndex: 0, startTime: null
};

let onboardingStep = 1, modalCallback = null;

function t(k) { return i18n[state.lang][k] || k; }

// --- Auth ---
async function loginWithGoogle() {
    try { await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
    catch (e) { if (e.code === 'auth/popup-closed-by-user') return; console.error('Login:', e); }
}
async function logoutUser() {
    try { await auth.signOut(); } catch (e) { console.error('Logout:', e); }
}
function showWhatsApp(s) {
    const f = document.getElementById('whatsapp-fab');
    if (f) f.style.display = s ? 'flex' : 'none';
}

// --- Firestore ---
async function loadFromFirestore() {
    if (!currentUser) return;
    try {
        const d = await db.collection('users').doc(currentUser.uid).get();
        if (d.exists && d.data().state) {
            state = { ...state, ...d.data().state };
            localStorage.setItem('gymv2', JSON.stringify(state));
        } else if (!d.exists) {
            await db.collection('users').doc(currentUser.uid).set({
                email: currentUser.email, displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                state: state
            });
        }
    } catch (e) { console.error('FS:', e); }
}
async function saveToFirestore() {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).set({
            email: currentUser.email, displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            state: state
        }, { merge: true });
    } catch (e) { console.error('FS:', e); }
}

// --- Local Storage ---
function loadState() {
    const s = localStorage.getItem('gymv2');
    if (s) state = { ...state, ...JSON.parse(s) };
}
function saveState() {
    localStorage.setItem('gymv2', JSON.stringify(state));
    if (currentUser) {
        clearTimeout(saveState._t);
        saveState._t = setTimeout(() => saveToFirestore(), 2000);
    }
}

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateWelcome();
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            await loadFromFirestore();
            showWhatsApp(true);
            if (state.onboarded) goTo('dashboard');
            else startOnboarding();
        } else {
            currentUser = null;
            showWhatsApp(false);
            showScreen('welcome');
            document.getElementById('bottom-nav').style.display = 'none';
        }
    });
});
