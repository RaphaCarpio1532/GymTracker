/* ===== GYMTRACKER V02 — Onboarding Flow ===== */

function startOnboarding() {
    onboardingStep = 1;
    showScreen('onboarding');
    renderStep();
}

function renderStep() {
    const c = document.getElementById('ob-content');
    const btn = document.getElementById('ob-next-btn');
    const total = 8;
    document.getElementById('ob-step-label').textContent = `${onboardingStep}/${total}`;
    document.getElementById('ob-progress').style.width = `${(onboardingStep / total) * 100}%`;
    document.getElementById('ob-back-btn').style.visibility = onboardingStep === 1 ? 'hidden' : 'visible';
    btn.textContent = onboardingStep === total ? t('ob-start') : t('ob-next');
    if (onboardingStep === 1) renderS1(c);
    else if (onboardingStep === 2) renderS2Location(c);
    else if (onboardingStep === 3 && state.location === 'casa') renderS3Equipment(c);
    else if (onboardingStep === 3) nextStep();
    else if (onboardingStep === 4) renderS4Freq(c);
    else if (onboardingStep === 5) renderS5Days(c);
    else if (onboardingStep === 6) renderS6Goals(c);
    else if (onboardingStep === 7) renderS7Plan(c);
    else if (onboardingStep === 8) renderS8Measurements(c);
}

function renderS1(c) {
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-8">${t('s1-title')}</h2><div class="mb-6"><label class="form-label">${t('s1-gender')}</label><div class="flex gap-4"><div class="gender-btn ${state.profile.gender === 'mujer' ? 'active' : ''}" onclick="pickGender('mujer')"><span class="material-symbols-outlined lg" style="display:block;margin-bottom:6px;">female</span>${t('s1-female')}</div><div class="gender-btn ${state.profile.gender === 'hombre' ? 'active' : ''}" onclick="pickGender('hombre')"><span class="material-symbols-outlined lg" style="display:block;margin-bottom:6px;">male</span>${t('s1-male')}</div></div></div><div class="mb-5"><label class="form-label">${t('s1-height')}</label><input type="number" id="inp-h" class="form-input" value="${state.profile.height || ''}" placeholder="170"></div><div class="mb-5"><label class="form-label">${t('s1-weight')}</label><input type="number" id="inp-w" class="form-input" value="${state.profile.weight || ''}" placeholder="75"></div><div class="mb-5"><label class="form-label">${t('s1-target')}</label><input type="number" id="inp-t" class="form-input" value="${state.profile.target || ''}" placeholder="70"></div>`;
}
function pickGender(g) {
    state.profile.gender = g;
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    event.target.closest('.gender-btn').classList.add('active');
}

function renderS2Location(c) {
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-8">${t('loc-title')}</h2><div class="grid grid-cols-2 gap-4"><div class="loc-option ${state.location === 'casa' ? 'active' : ''}" onclick="pickLocation('casa')"><span class="material-symbols-outlined xl" style="display:block;margin-bottom:12px;">home</span><div class="font-bold text-lg mb-1">${t('loc-casa')}</div><div class="text-on-surface-variant text-xs">${t('loc-casa-desc')}</div></div><div class="loc-option ${state.location === 'gym' ? 'active' : ''}" onclick="pickLocation('gym')"><span class="material-symbols-outlined xl" style="display:block;margin-bottom:12px;">fitness_center</span><div class="font-bold text-lg mb-1">${t('loc-gym')}</div><div class="text-on-surface-variant text-xs">${t('loc-gym-desc')}</div></div></div>`;
}
function pickLocation(l) {
    state.location = l;
    if (l === 'gym') state.equipment = ['mancuerna', 'liga', 'kettlebell', 'barra', 'maquina', 'cuerpo'];
    renderS2Location(document.getElementById('ob-content'));
}

function renderS3Equipment(c) {
    const equipList = ['cuerpo', 'mancuerna', 'liga', 'kettlebell', 'barra'];
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">${t('equip-title')}</h2><p class="text-on-surface-variant text-sm mb-8">${t('equip-subtitle')}</p><div class="grid grid-cols-2 gap-4">${equipList.map(eq => `<div class="equip-option ${state.equipment.includes(eq) ? 'active' : ''}" onclick="toggleEquip('${eq}')"><span class="material-symbols-outlined" style="font-size:28px;display:block;margin-bottom:8px;">${getEquipIcon(eq)}</span><div class="font-bold text-sm">${t('equip-' + eq)}</div></div>`).join('')}</div>`;
}
function getEquipIcon(eq) {
    const m = { 'cuerpo': 'accessibility_new', 'mancuerna': 'fitness_center', 'liga': 'cable', 'kettlebell': 'exercise', 'barra': 'horizontal_rule' };
    return m[eq] || 'circle';
}
function toggleEquip(eq) {
    if (state.equipment.includes(eq)) state.equipment = state.equipment.filter(e => e !== eq);
    else state.equipment.push(eq);
    renderS3Equipment(document.getElementById('ob-content'));
}

function renderS4Freq(c) {
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-8">${t('s2-title')}</h2><div class="grid grid-cols-3 gap-4">${[3, 4, 5].map(n => `<div class="freq-option ${state.freq === n ? 'active' : ''}" onclick="pickFreq(${n})"><div class="num">${n}</div><div class="lbl">${t('s2-days')}</div></div>`).join('')}</div>`;
}
function pickFreq(n) {
    state.freq = n;
    state.days = [];
    document.querySelectorAll('.freq-option').forEach(f => f.classList.remove('active'));
    event.target.closest('.freq-option').classList.add('active');
}

function renderS5Days(c) {
    const dn = t('day-names');
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">${t('s3-title')}</h2><p class="text-on-surface-variant text-sm mb-8">${t('select-days').replace('{n}', state.freq)}</p><div class="grid grid-cols-7 gap-2">${dn.map((d, i) => `<button class="day-btn ${state.days.includes(i) ? 'active' : ''}" onclick="toggleDay(${i})">${d}</button>`).join('')}</div>`;
}
function toggleDay(d) {
    if (state.days.includes(d)) state.days = state.days.filter(x => x !== d);
    else if (state.days.length < state.freq) state.days.push(d);
    else return;
    renderS5Days(document.getElementById('ob-content'));
}

function renderS6Goals(c) {
    const goals = GOAL_OPTIONS[state.lang];
    let h = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-8">${t('s4-title')}</h2>`;
    Object.entries(ZONES).forEach(([z, zn]) => {
        h += `<div class="zone-section"><div class="zone-title">${zn[state.lang]}</div><div class="goal-chips">`;
        goals.forEach(g => {
            h += `<button class="chip ${state.goals[z] && state.goals[z].includes(g) ? 'active' : ''}" onclick="pickGoal('${z}','${g}')">${g}</button>`;
        });
        h += `</div></div>`;
    });
    c.innerHTML = h;
}
function pickGoal(z, g) {
    state.goals[z] = [g];
    renderS6Goals(document.getElementById('ob-content'));
}

function renderS7Plan(c) {
    const hm = state.profile.height / 100, bmi = state.profile.weight / (hm * hm);
    let bl;
    if (bmi < 18.5) bl = t('bmi-low');
    else if (bmi < 25) bl = t('bmi-normal');
    else if (bmi < 30) bl = t('bmi-over');
    else bl = t('bmi-obese');
    let bmr;
    if (state.profile.gender === 'mujer') bmr = 655 + (9.6 * state.profile.weight) + (1.8 * state.profile.height) - (4.7 * 30);
    else bmr = 88 + (13.4 * state.profile.weight) + (4.8 * state.profile.height) - (5.7 * 30);
    let cal = Math.round(bmr * 1.4);
    const grow = Object.values(state.goals).some(g => g && g.includes(state.lang === 'es' ? 'Aumentar' : 'Aumentare'));
    const loss = Object.values(state.goals).some(g => g && g.includes(state.lang === 'es' ? 'Adelgazar' : 'Dimagrire'));
    if (grow) cal = Math.round(cal * 1.1);
    else if (loss) cal = Math.round(cal * 0.85);
    const prot = grow ? Math.round(state.profile.weight * 1.8) : Math.round(state.profile.weight * 1.4);
    const wat = (Math.round(state.profile.weight * 0.033 * 10) / 10);
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-8">${t('s5-title')}</h2><div class="card mb-5"><h3 class="font-headline font-bold text-on-surface mb-4 text-sm tracking-widest uppercase">${t('bmi-section')}</h3><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('bmi')}</span><span class="font-bold text-on-surface">${bmi.toFixed(1)} (${bl})</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('height')}</span><span class="font-bold text-on-surface">${state.profile.height} cm</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('weight')}</span><span class="font-bold text-on-surface">${state.profile.weight} kg</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('target-weight')}</span><span class="font-bold text-on-surface">${state.profile.target} kg</span></div></div><div class="card mb-5"><h3 class="font-headline font-bold text-on-surface mb-4 text-sm tracking-widest uppercase">${t('nutrition')}</h3><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('calories')}</span><span class="font-bold text-primary">${cal} kcal</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('protein')}</span><span class="font-bold text-on-surface">${prot}g</span></div><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('water')}</span><span class="font-bold text-tertiary">${wat}L</span></div></div><div class="card"><div class="summary-row"><span class="text-on-surface-variant text-sm">${t('freq-days')}</span><span class="font-bold text-on-surface">${state.freq}</span></div></div>`;
}

function renderS8Measurements(c) {
    c.innerHTML = `<h2 class="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">${t('s6-title')}</h2><p class="text-on-surface-variant text-sm mb-8">${t('s6-skip')}</p><div class="mb-5"><label class="form-label">${t('chest')}</label><input type="number" id="inp-chest" class="form-input" value="${state.measurements.chest || ''}" placeholder="0"></div><div class="mb-5"><label class="form-label">${t('waist')}</label><input type="number" id="inp-waist" class="form-input" value="${state.measurements.waist || ''}" placeholder="0"></div><div class="mb-5"><label class="form-label">${t('hips')}</label><input type="number" id="inp-hips" class="form-input" value="${state.measurements.hips || ''}" placeholder="0"></div><div class="mb-5"><label class="form-label">${t('thighs')}</label><input type="number" id="inp-thighs" class="form-input" value="${state.measurements.thighs || ''}" placeholder="0"></div>`;
}

function nextStep() {
    if (onboardingStep === 1) {
        state.profile.height = parseFloat(document.getElementById('inp-h').value) || 0;
        state.profile.weight = parseFloat(document.getElementById('inp-w').value) || 0;
        state.profile.target = parseFloat(document.getElementById('inp-t').value) || 0;
        if (!state.profile.gender || !state.profile.height || !state.profile.weight || !state.profile.target) { alert(t('fill-all')); return; }
    } else if (onboardingStep === 2) {
        if (!state.location) { alert('Selecciona una ubicación'); return; }
    } else if (onboardingStep === 3) {
        if (state.location === 'casa') {
            if (!state.equipment || state.equipment.length === 0) { alert(t('select-equip')); return; }
        }
    } else if (onboardingStep === 4) {
        if (!state.freq) { alert(t('select-freq')); return; }
    } else if (onboardingStep === 5) {
        if (state.days.length !== state.freq) { alert(t('select-days').replace('{n}', state.freq)); return; }
    } else if (onboardingStep === 6) {
        if (!Object.keys(ZONES).every(z => state.goals[z] && state.goals[z].length > 0)) { alert(t('select-goals')); return; }
        generateRoutine();
    } else if (onboardingStep === 8) {
        state.measurements.chest = parseFloat(document.getElementById('inp-chest').value) || 0;
        state.measurements.waist = parseFloat(document.getElementById('inp-waist').value) || 0;
        state.measurements.hips = parseFloat(document.getElementById('inp-hips').value) || 0;
        state.measurements.thighs = parseFloat(document.getElementById('inp-thighs').value) || 0;
        completeOnboarding();
        return;
    }
    onboardingStep++;
    if (onboardingStep === 3 && state.location !== 'casa') onboardingStep++;
    renderStep();
}

function prevStep() {
    if (onboardingStep > 1) {
        onboardingStep--;
        if (onboardingStep === 3 && state.location !== 'casa') onboardingStep--;
        renderStep();
    }
}

function generateRoutine() {
    const zoneKeys = Object.keys(ZONES);
    const r = [];
    const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
    const pickFrom = (zone, n) => {
        const pool = shuffle(EXERCISES.filter(e => {
            if (e.zone !== zone) return false;
            if (state.location === 'casa') { return e.equip.some(eq => state.equipment.includes(eq)); }
            return true;
        }));
        return pool.slice(0, n);
    };
    const splits = [];
    if (state.days.length <= 3) {
        state.days.sort().forEach((d, i) => { splits.push({ day: d, zones: zoneKeys }); });
    } else if (state.days.length === 4) {
        const half1 = ['pecho', 'hombros', 'brazos', 'abdomen'];
        const half2 = ['espalda', 'piernas', 'gluteo', 'abdomen'];
        state.days.sort().forEach((d, i) => { splits.push({ day: d, zones: i % 2 === 0 ? half1 : half2 }); });
    } else {
        const s1 = ['pecho', 'hombros', 'abdomen'];
        const s2 = ['espalda', 'brazos', 'abdomen'];
        const s3 = ['piernas', 'gluteo', 'abdomen'];
        state.days.sort().forEach((d, i) => { const idx = i % 3; splits.push({ day: d, zones: idx === 0 ? s1 : idx === 1 ? s2 : s3 }); });
    }
    splits.forEach(sp => {
        let ex = [];
        sp.zones.forEach(z => {
            const goal = state.goals[z];
            const isMain = goal && (goal.includes('Aumentar') || goal.includes('Aumentare'));
            const count = isMain ? 2 : 1;
            ex = ex.concat(pickFrom(z, count));
        });
        if (ex.length > 7) ex = ex.slice(0, 7);
        if (ex.length < 4) {
            const missing = zoneKeys.filter(z => !sp.zones.includes(z));
            for (const z of missing) { if (ex.length >= 5) break; ex = ex.concat(pickFrom(z, 1)); }
        }
        r.push({ day: sp.day, exercises: ex });
    });
    state.plan = r;
}

function regenerateTodayRoutine() {
    const td = new Date().getDay();
    const wo = state.plan ? state.plan.find(w => w.day === td) : null;
    if (!wo) return;
    const zoneKeys = Object.keys(ZONES);
    const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
    const pickFrom = (zone, n) => {
        const pool = shuffle(EXERCISES.filter(e => {
            if (e.zone !== zone) return false;
            if (state.location === 'casa') { return e.equip.some(eq => state.equipment.includes(eq)); }
            return true;
        }));
        return pool.slice(0, n);
    };
    const splits = [];
    if (state.days.length <= 3) {
        splits.push({ zones: zoneKeys });
    } else if (state.days.length === 4) {
        const dayIdx = state.days.sort().indexOf(td);
        const half1 = ['pecho', 'hombros', 'brazos', 'abdomen'];
        const half2 = ['espalda', 'piernas', 'gluteo', 'abdomen'];
        splits.push({ zones: dayIdx % 2 === 0 ? half1 : half2 });
    } else {
        const dayIdx = state.days.sort().indexOf(td);
        const s1 = ['pecho', 'hombros', 'abdomen'];
        const s2 = ['espalda', 'brazos', 'abdomen'];
        const s3 = ['piernas', 'gluteo', 'abdomen'];
        const idx = dayIdx % 3;
        splits.push({ zones: idx === 0 ? s1 : idx === 1 ? s2 : s3 });
    }
    const sp = splits[0];
    let ex = [];
    sp.zones.forEach(z => {
        const goal = state.goals[z];
        const isMain = goal && (goal.includes('Aumentar') || goal.includes('Aumentare'));
        const count = isMain ? 2 : 1;
        ex = ex.concat(pickFrom(z, count));
    });
    if (ex.length > 7) ex = ex.slice(0, 7);
    if (ex.length < 4) {
        const missing = zoneKeys.filter(z => !sp.zones.includes(z));
        for (const z of missing) { if (ex.length >= 5) break; ex = ex.concat(pickFrom(z, 1)); }
    }
    wo.exercises = ex;
    saveState();
    renderDashboard();
}

function completeOnboarding() {
    state.onboarded = true;
    state.attendance = {};
    saveState();
    goTo('dashboard');
}
