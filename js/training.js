/* ===== GYMTRACKER V02 — Training & Rest Timer ===== */

let restDuration = 60, restTimer = null, restRemaining = 0, restCountingDown = false, workoutStartTime = null;

function startWorkout(d) {
    const w = state.plan.find(w => w.day === d);
    if (!w) return;
    state.currentWorkoutDay = d;
    state.currentExerciseIndex = 0;
    state.startTime = null;
    workoutStartTime = Date.now();
    if (restTimer) clearInterval(restTimer);
    saveState();
    goTo('training');
}

function showRestScreen() {
    restCountingDown = false;
    restRemaining = 0;
    if (restTimer) clearInterval(restTimer);
    restTimer = null;
    const c = document.getElementById('train-content');
    renderRestUI(c);
}

function renderRestUI(c) {
    if (!restCountingDown) {
        c.innerHTML = `<div class="rest-overlay"><p class="text-on-surface-variant text-sm uppercase tracking-widest font-bold mb-6">${t('rest-title')}</p><div class="rest-ring"><svg viewBox="0 0 204 204"><circle cx="102" cy="102" r="101" style="stroke-dashoffset:0;opacity:0.2;"></circle></svg><div class="rest-countdown" style="font-size:48px;color:#a09c9b;">?</div></div><p class="text-on-surface font-headline font-bold text-lg mb-4">${t('rest-choose')}</p><div class="rest-chips">${[30, 60, 90, 120].map(v => `<button class="rest-chip" onclick="startRestWithDuration(${v})">${v}s</button>`).join('')}</div><button onclick="skipRest()" style="margin-top:32px;background:none;border:1px solid #525151;color:#a09c9b;border-radius:9999px;padding:10px 28px;font-family:Manrope,sans-serif;font-size:14px;font-weight:600;cursor:pointer;">${t('skip-rest')}</button></div>`;
    } else {
        const m = String(Math.floor(restRemaining / 60)).padStart(2, '0');
        const s = String(restRemaining % 60).padStart(2, '0');
        const pct = restRemaining / restDuration;
        const dashOffset = 636 * (1 - pct);
        c.innerHTML = `<div class="rest-overlay"><p class="text-on-surface-variant text-sm uppercase tracking-widest font-bold mb-6">${t('rest-title')}</p><div class="rest-ring"><svg viewBox="0 0 204 204"><circle cx="102" cy="102" r="101" style="stroke-dashoffset:${dashOffset};"></circle></svg><div class="rest-countdown" id="rest-count">${m}:${s}</div></div><div class="rest-chips">${[30, 60, 90, 120].map(v => `<button class="rest-chip ${restDuration === v ? 'active' : ''}" onclick="startRestWithDuration(${v})">${v}s</button>`).join('')}</div><button onclick="skipRest()" style="margin-top:32px;background:none;border:1px solid #525151;color:#a09c9b;border-radius:9999px;padding:10px 28px;font-family:Manrope,sans-serif;font-size:14px;font-weight:600;cursor:pointer;">${t('skip-rest')}</button></div>`;
    }
}

function startRestWithDuration(v) {
    restDuration = v;
    restRemaining = v;
    restCountingDown = true;
    renderRestUI(document.getElementById('train-content'));
    startRestCountdown();
}

function startRestCountdown() {
    if (restTimer) clearInterval(restTimer);
    restTimer = setInterval(() => {
        restRemaining--;
        if (restRemaining <= 0) {
            clearInterval(restTimer);
            restTimer = null;
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
            advanceAfterRest();
        } else {
            const el = document.getElementById('rest-count');
            if (el) {
                const m = String(Math.floor(restRemaining / 60)).padStart(2, '0');
                const s = String(restRemaining % 60).padStart(2, '0');
                el.textContent = `${m}:${s}`;
            }
            const ring = document.querySelector('.rest-ring svg circle');
            if (ring) {
                const pct = restRemaining / restDuration;
                ring.style.strokeDashoffset = 636 * (1 - pct);
            }
        }
    }, 1000);
}

function skipRest() {
    if (restTimer) clearInterval(restTimer);
    restTimer = null;
    advanceAfterRest();
}

function advanceAfterRest() {
    state.currentExerciseIndex++;
    saveState();
    renderTraining();
}

function renderTraining() {
    if (restTimer) clearInterval(restTimer);
    restTimer = null;
    const c = document.getElementById('train-content');
    const wo = state.plan ? state.plan.find(w => w.day === state.currentWorkoutDay) : null;
    if (!wo || !wo.exercises) {
        const today = new Date(), td = today.getDay(), dn = t('day-names');
        let nextDay = null, nextWo = null;
        if (state.plan && state.days.length > 0) {
            const sorted = [...state.days].sort();
            for (const d of sorted) { if (d > td) { nextDay = d; break; } }
            if (nextDay === null) nextDay = sorted[0];
            nextWo = state.plan.find(w => w.day === nextDay);
        }
        let nextHtml = '';
        if (nextWo && nextDay !== null) {
            nextHtml = `<div class="card mt-6" style="text-align:left;"><span class="text-primary font-label text-xs uppercase tracking-widest font-bold">${t('next-workout')} — ${dn[nextDay]}</span><h3 class="font-headline font-bold text-lg text-on-surface mt-2 mb-3">${nextWo.exercises.length} ${t('exercises')}</h3><div class="text-sm text-on-surface-variant">${nextWo.exercises.map(e => state.lang === 'es' ? e.name_es : e.name_it).join(' · ')}</div></div>`;
        }
        c.innerHTML = `<div class="text-center" style="padding-top:80px;"><span class="material-symbols-outlined xl" style="color:#00e3fd;">self_care</span><h3 class="font-headline font-bold text-lg text-on-surface mt-4">${t('rest-day')}</h3><p class="text-on-surface-variant text-sm mt-2">${t('rest-msg')}</p>${nextHtml}</div>`;
        return;
    }
    const ex = wo.exercises[state.currentExerciseIndex];
    if (!ex) {
        c.innerHTML = `<div class="text-center" style="padding-top:100px;"><span class="material-symbols-outlined xl" style="color:#22c55e;">check_circle</span><h3 class="font-headline font-bold text-2xl text-on-surface mt-4">${t('workout-done')}</h3><button onclick="goTo('dashboard')" class="cta-primary" style="margin-top:16px;width:auto;padding:12px 24px;">${t('back-dash')}</button></div>`;
        return;
    }
    const nm = state.lang === 'es' ? ex.name_es : ex.name_it;
    const ds = state.lang === 'es' ? ex.desc_es : ex.desc_it;
    const isLast = state.currentExerciseIndex >= wo.exercises.length - 1;
    if (!workoutStartTime) workoutStartTime = Date.now();
    c.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><button onclick="goTo('dashboard')" style="background:none;border:none;cursor:pointer;padding:4px;"><span class="material-symbols-outlined" style="color:#e5e2e1;">arrow_back</span></button><span class="text-on-surface-variant text-sm font-label">${state.currentExerciseIndex + 1} / ${wo.exercises.length}</span><div style="width:32px;"></div></div><div class="text-center mb-4"><div class="set-counter">${state.currentExerciseIndex + 1}<span style="font-size:22px;color:#a09c9b;">/${wo.exercises.length}</span></div></div><div class="card mb-4"><h2 class="font-headline font-bold text-lg text-on-surface mb-1">${nm}</h2><p class="text-xs text-on-surface-variant mb-3">${ds}</p><div class="target-grid"><div><div class="target-val">${ex.sets}</div><div class="target-lbl">${t('sets')}</div></div><div><div class="target-val">${ex.reps}</div><div class="target-lbl">${t('reps')}</div></div></div></div><div class="mb-3"><label class="form-label">${t('actual-reps')}</label><input type="number" id="log-reps" class="form-input" placeholder="${ex.reps}"></div><div class="mb-4"><label class="form-label">${t('actual-weight')}</label><input type="number" id="log-weight" class="form-input" placeholder="0"></div><button onclick="nextExercise()" class="cta-primary">${isLast ? t('complete-workout') : t('next-exercise')}</button>`;
}

function nextExercise() {
    const r = parseInt(document.getElementById('log-reps').value) || 0;
    const w = parseFloat(document.getElementById('log-weight').value) || 0;
    state.logs[`${state.currentWorkoutDay}-${state.currentExerciseIndex}`] = { reps: r, weight: w };
    saveState();
    const wo = state.plan.find(w => w.day === state.currentWorkoutDay);
    if (state.currentExerciseIndex < wo.exercises.length - 1) { showRestScreen(); }
    else completeWorkout();
}

function completeWorkout() {
    state.attendance[new Date().toISOString().split('T')[0]] = true;
    const elapsed = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    state.currentWorkoutDay = null;
    state.currentExerciseIndex = 0;
    state.startTime = null;
    workoutStartTime = null;
    if (restTimer) clearInterval(restTimer);
    saveState();
    showCelebration(mm + ':' + ss);
}

function showCelebration(time) {
    const c = document.getElementById('train-content');
    const colors = ['#cafd00', '#00e3fd', '#f3ffca', '#22c55e', '#81ecff'];
    let conf = '<div class="confetti-container" id="confetti">';
    for (let i = 0; i < 40; i++) {
        const color = colors[i % colors.length], left = Math.random() * 100, delay = Math.random() * 1.5, size = 6 + Math.random() * 8;
        conf += `<div class="confetti-piece" style="left:${left}%;top:-10px;background:${color};width:${size}px;height:${size}px;animation-delay:${delay}s;"></div>`;
    }
    conf += '</div>';
    c.innerHTML = `${conf}<div class="celebrate-screen"><div class="celebrate-icon">🎉</div><h2 class="font-headline font-bold text-2xl text-on-surface mt-6 mb-2">${t('workout-done')}</h2><p class="text-on-surface-variant text-sm mb-6">${t('celebrate-msg')}</p><div class="card mb-6" style="width:100%;"><div class="summary-row"><span class="text-on-surface-variant text-sm">⏱ Tiempo</span><span class="font-bold text-tertiary">${time}</span></div></div><button onclick="goTo('dashboard')" class="cta-primary" style="width:auto;padding:14px 32px;">${t('back-dash')}</button></div>`;
    setTimeout(() => { const cf = document.getElementById('confetti'); if (cf) cf.remove(); }, 3000);
}
