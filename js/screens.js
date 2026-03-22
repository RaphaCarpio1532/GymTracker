/* ===== GYMTRACKER V02 — Screen Renderers ===== */

function renderDashboard() {
    const c = document.getElementById('dash-content');
    const today = new Date();
    const dateStr = today.toLocaleDateString(state.lang === 'es' ? 'es-ES' : 'it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let greet = '';
    if (currentUser) greet = `<div class="user-greet mb-4"><div><span class="text-on-surface-variant text-sm">${t('hello')} 👋</span><div class="font-headline font-bold text-xl text-on-surface tracking-tight">${currentUser.displayName || currentUser.email}</div></div></div>`;
    const ww = Object.values(state.attendance).filter(v => v).length;
    let streak = 0;
    const keys = Object.keys(state.attendance).sort();
    for (let i = keys.length - 1; i >= 0; i--) { if (state.attendance[keys[i]]) streak++; else break; }
    const td = today.getDay(), isTD = state.days.includes(td);
    const todayKey = today.toISOString().split('T')[0], todayDone = state.attendance[todayKey] || false;
    let focus;
    if (isTD && state.plan) {
        const wo = state.plan.find(w => w.day === td);
        if (wo) {
            if (todayDone) {
                focus = `<div class="card"><span class="text-primary font-label text-xs uppercase tracking-widest font-bold">${t('today-focus')}</span><h3 class="font-headline font-bold text-xl text-on-surface mt-2 mb-3">${wo.exercises.length} ${t('exercises')}</h3><button disabled class="cta-primary" style="background:#22c55e;opacity:0.9;cursor:default;">${t('workout-already-done')}</button></div>`;
            } else {
                focus = `<div class="card" style="cursor:pointer;" onclick="startWorkout(${td})"><span class="text-primary font-label text-xs uppercase tracking-widest font-bold">${t('today-focus')}</span><h3 class="font-headline font-bold text-xl text-on-surface mt-2 mb-3">${wo.exercises.length} ${t('exercises')}</h3><div class="text-sm text-on-surface-variant mb-4">${wo.exercises.map(e => state.lang === 'es' ? e.name_es : e.name_it).join(' · ')}</div><button class="cta-primary">${t('start-workout')} →</button></div><div style="text-align:center;margin-top:12px;"><button onclick="event.stopPropagation();regenerateTodayRoutine();" style="background:none;border:1px solid #525151;color:#a09c9b;border-radius:9999px;padding:8px 20px;font-family:Manrope,sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;"><span class="material-symbols-outlined sm" style="vertical-align:middle;margin-right:4px;">refresh</span>${t('change-routine')}</button></div>`;
            }
        } else focus = restCard();
    } else focus = restCard();
    const dl = state.lang === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
    let wh = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - today.getDay() + i);
        const ds = d.toISOString().split('T')[0], done = state.attendance[ds] || false, isT = i === td;
        wh += `<div class="att-day ${done ? 'done' : ''} ${isT && !done ? 'today' : ''}">${dl[i]}</div>`;
    }
    c.innerHTML = `${greet}<p class="text-on-surface-variant text-sm capitalize mb-6">${dateStr}</p><div class="grid grid-cols-2 gap-4 mb-8"><div class="stat-card"><div class="stat-value">${ww}</div><div class="stat-label">${t('this-week')}</div></div><div class="stat-card"><div class="stat-value">${streak}</div><div class="stat-label">${t('streak')}</div></div></div><div class="mb-8">${focus}</div><div><span class="text-primary font-label text-xs uppercase tracking-widest font-bold">${t('week-cal')}</span><div class="att-grid mt-3">${wh}</div></div>`;
}

function restCard() {
    return `<div class="rest-card"><span class="material-symbols-outlined xl" style="color:#00e3fd;">self_care</span><h3 class="font-headline font-bold text-xl text-on-surface">${t('rest-day')}</h3><p class="text-sm text-on-surface-variant">${t('rest-msg')}</p></div>`;
}

function renderProgress() {
    document.getElementById('prog-label-top').textContent = t('prog-label');
    document.getElementById('prog-title').innerHTML = `${t('prog-t1')}<br>${t('prog-t2')}`;
    const c = document.getElementById('prog-content');
    const tot = Object.values(state.attendance).filter(v => v).length;
    const pl = state.freq * 4, pct = pl > 0 ? Math.round((tot / pl) * 100) : 0;
    const prs = {};
    Object.entries(state.logs).forEach(([k, l]) => {
        const [d, i] = k.split('-');
        const w = state.plan ? state.plan.find(w => w.day == d) : null;
        if (w && w.exercises[i]) {
            const id = w.exercises[i].id;
            if (!prs[id] || l.weight > prs[id].weight) prs[id] = l;
        }
    });
    let prh = '';
    if (Object.keys(prs).length === 0) prh = `<p class="text-on-surface-variant text-sm">${t('no-records')}</p>`;
    else Object.entries(prs).forEach(([id, l]) => {
        const ex = EXERCISES.find(e => e.id === id);
        if (ex) {
            const nm = state.lang === 'es' ? ex.name_es : ex.name_it;
            prh += `<div class="pr-card"><span class="font-semibold text-on-surface text-sm">${nm}</span><span class="font-bold text-primary">${l.weight} kg</span></div>`;
        }
    });
    c.innerHTML = `<div class="card mb-8"><span class="font-label text-xs text-primary uppercase tracking-widest font-bold">${t('consistency')}</span><div class="flex items-baseline gap-2 mt-2"><span class="font-headline font-bold text-5xl text-primary">${pct}%</span><span class="text-on-surface-variant text-sm">${t('of-planned')}</span></div><div class="intensity-bar mt-4"><div class="intensity-fill" style="width:${Math.min(pct, 100)}%;transition:width 0.5s;"></div></div></div><div class="zone-title mb-4">${t('personal-records')}</div>${prh}`;
}

function renderProfile() {
    const c = document.getElementById('prof-content');
    const gt = state.profile.gender === 'mujer' ? t('female') : t('male');
    const locDisplay = state.location === 'casa' ? t('loc-casa') : t('loc-gym');
    let uh = '';
    if (currentUser) uh = `<div class="card mb-8 flex items-center gap-4"><img src="${currentUser.photoURL || ''}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'"><div><span class="text-xs text-on-surface-variant uppercase tracking-widest font-bold">${t('logged-as')}</span><div class="font-headline font-bold text-on-surface">${currentUser.displayName || ''}</div><div class="text-sm text-on-surface-variant">${currentUser.email || ''}</div></div></div>`;
    c.innerHTML = `${uh}<div class="zone-title mb-3">${t('current-profile')}</div><div class="card mb-8"><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('gender')}</span><span class="font-bold text-on-surface">${gt}</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('height')}</span><span class="font-bold text-on-surface">${state.profile.height} cm</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('weight')}</span><span class="font-bold text-on-surface">${state.profile.weight} kg</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('target-weight')}</span><span class="font-bold text-on-surface">${state.profile.target} kg</span></div></div><div class="zone-title mb-3">${t('location')}</div><div class="card mb-8"><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('loc-title')}</span><span class="font-bold text-on-surface">${locDisplay}</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('equipment-label')}</span><span class="font-bold text-on-surface">${state.equipment.join(', ')}</span></div></div><div class="zone-title mb-3">${t('body-measurements')}</div><div class="card mb-8"><div class="mb-4"><label class="form-label">${t('chest')}</label><input type="number" id="m-ch" class="form-input" value="${state.measurements.chest || ''}"></div><div class="mb-4"><label class="form-label">${t('waist')}</label><input type="number" id="m-wa" class="form-input" value="${state.measurements.waist || ''}"></div><div class="mb-4"><label class="form-label">${t('hips')}</label><input type="number" id="m-hi" class="form-input" value="${state.measurements.hips || ''}"></div><div class="mb-4"><label class="form-label">${t('thighs')}</label><input type="number" id="m-th" class="form-input" value="${state.measurements.thighs || ''}"></div><button onclick="saveMeasurements()" class="cta-primary">${t('save')}</button></div><div class="zone-title mb-3">${t('language')}</div><div class="flex gap-3 mb-8"><button onclick="setLang('es');renderProfile();" style="flex:1;padding:12px;border-radius:9999px;font-weight:700;cursor:pointer;border:none;background:${state.lang === 'es' ? '#cafd00' : '#222222'};color:${state.lang === 'es' ? '#0e0e0e' : '#e5e2e1'};font-family:'Manrope',sans-serif;text-transform:uppercase;font-size:13px;">Español</button><button onclick="setLang('it');renderProfile();" style="flex:1;padding:12px;border-radius:9999px;font-weight:700;cursor:pointer;border:none;background:${state.lang === 'it' ? '#cafd00' : '#222222'};color:${state.lang === 'it' ? '#0e0e0e' : '#e5e2e1'};font-family:'Manrope',sans-serif;text-transform:uppercase;font-size:13px;">Italiano</button></div><button onclick="reconfigurePlan()" style="width:100%;padding:14px;background:linear-gradient(135deg,#cafd00,#f3ffca);color:#0e0e0e;border:none;border-radius:9999px;font-weight:700;cursor:pointer;font-family:'Manrope',sans-serif;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;"><span class="material-symbols-outlined sm">refresh</span>${t('reconfig-btn')}</button>${currentUser ? `<button onclick="logoutUser()" class="logout-btn mb-4"><span class="material-symbols-outlined sm">logout</span>${t('logout')}</button>` : ''}<button onclick="confirmReset()" style="width:100%;padding:14px;background:#ff5449;color:white;border:none;border-radius:9999px;font-weight:700;cursor:pointer;font-family:'Manrope',sans-serif;">${t('reset')}</button>`;
}

function saveMeasurements() {
    state.measurements.chest = parseFloat(document.getElementById('m-ch').value) || 0;
    state.measurements.waist = parseFloat(document.getElementById('m-wa').value) || 0;
    state.measurements.hips = parseFloat(document.getElementById('m-hi').value) || 0;
    state.measurements.thighs = parseFloat(document.getElementById('m-th').value) || 0;
    saveState();
    alert(t('saved-msg'));
}

function reconfigurePlan() {
    showModal(t('reconfig-title'), t('reconfig-msg'), () => {
        state.freq = 0; state.days = []; state.goals = {}; state.plan = null;
        state.currentWorkoutDay = null; state.currentExerciseIndex = 0;
        state.startTime = null; workoutStartTime = null;
        if (restTimer) clearInterval(restTimer);
        onboardingStep = 2;
        showScreen('onboarding');
        renderStep();
        document.getElementById('bottom-nav').style.display = 'none';
    });
}

function confirmReset() {
    showModal(t('reset-title'), t('reset-msg'), () => {
        state = {
            lang: state.lang,
            profile: { gender: '', height: 0, weight: 0, target: 0 },
            freq: 0, days: [], goals: {}, plan: null,
            attendance: {}, logs: {},
            measurements: { chest: 0, waist: 0, hips: 0, thighs: 0 },
            location: 'gym', equipment: ['mancuerna'],
            onboarded: false,
            currentWorkoutDay: null, currentExerciseIndex: 0, startTime: null
        };
        saveState();
        logoutUser();
    });
}
