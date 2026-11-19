/* ============================================================
 * 本地数据层 v0.1 —— localStorage，无后端、无账号、儿童数据不出设备
 * v0.3 计划：加后端同步 + 家长账号（届时需公司主体与备案）
 * ============================================================ */
window.Store = (function () {
  const KEY = 'kidsEnglishBuddy.v1';
  const DEFAULT = {
    profile: null, // {name, band, dailyLimit, createdAt}
    xp: 0,
    streak: { count: 0, lastDate: null },
    lessons: {},   // id -> {stars, bestAcc, plays, lastAt}
    words: {},     // word -> {zh, s, seen, correct, lastAt, due}
    minutes: {},   // 'YYYY-MM-DD' -> seconds
    sessions: []   // {at, lessonId, stars, acc, mode}
  };
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(JSON.parse(JSON.stringify(DEFAULT)), JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function yesterday() { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  const PET_STAGES = [
    { name: '神秘蛋', min: 0, emoji: '🥚' },
    { name: '小小 Pip', min: 100, emoji: '🐣' },
    { name: '活力 Pip', min: 300, emoji: '🦊' },
    { name: '超级 Pip', min: 700, emoji: '🦸' }
  ];
  function petStage() {
    let s = 0;
    PET_STAGES.forEach((st, i) => { if (state.xp >= st.min) s = i; });
    const next = PET_STAGES[s + 1] || null;
    return { index: s, ...PET_STAGES[s], next, xp: state.xp };
  }

  return {
    get state() { return state; },
    save,
    today,
    petStage,
    PET_STAGES,
    createProfile(name, band, dailyLimit) {
      state.profile = { name, band, dailyLimit, createdAt: Date.now() };
      save();
    },
    updateProfile(patch) { Object.assign(state.profile, patch); save(); },
    addXp(n) { const before = petStage().index; state.xp += n; save(); return petStage().index > before; },
    addSeconds(sec) { const t = today(); state.minutes[t] = (state.minutes[t] || 0) + sec; save(); },
    todaySeconds() { return state.minutes[today()] || 0; },
    weekSeconds() {
      let sum = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 864e5);
        const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        sum += state.minutes[k] || 0;
      }
      return sum;
    },
    last7Days() {
      const out = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5);
        const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        out.push({ date: k, label: (d.getMonth() + 1) + '/' + d.getDate(), sec: state.minutes[k] || 0 });
      }
      return out;
    },
    touchStreak() {
      const t = today();
      if (state.streak.lastDate === t) return;
      state.streak.count = state.streak.lastDate === yesterday() ? state.streak.count + 1 : 1;
      state.streak.lastDate = t;
      save();
    },
    recordWord(w, zh, s, ok) {
      const cur = state.words[w] || { zh, s, seen: 0, correct: 0, lastAt: 0, due: 0 };
      cur.zh = zh || cur.zh; cur.s = s || cur.s;
      cur.seen++; if (ok) cur.correct++;
      cur.lastAt = Date.now();
      // 间隔重复：答对→3天后复习；答错→明天复习
      cur.due = Date.now() + (ok ? 3 : 1) * 864e5;
      state.words[w] = cur; save();
    },
    dueWords() {
      const now = Date.now();
      return Object.entries(state.words)
        .filter(([, v]) => v.due && v.due <= now && v.correct < v.seen * 0.9)
        .map(([w, v]) => ({ w, ...v }))
        .slice(0, 10);
    },
    masteredCount() { return Object.values(state.words).filter(v => v.correct >= 2).length; },
    completeLesson(lessonId, stars, acc, mode) {
      const cur = state.lessons[lessonId] || { stars: 0, bestAcc: 0, plays: 0, lastAt: 0 };
      cur.stars = Math.max(cur.stars, stars);
      cur.bestAcc = Math.max(cur.bestAcc, acc);
      cur.plays++; cur.lastAt = Date.now();
      state.lessons[lessonId] = cur;
      state.sessions.push({ at: Date.now(), lessonId, stars, acc, mode });
      if (state.sessions.length > 200) state.sessions = state.sessions.slice(-200);
      this.touchStreak();
      save();
    },
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(txt) {
      const obj = JSON.parse(txt);
      if (!obj || typeof obj !== 'object') throw new Error('bad file');
      state = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), obj);
      save();
    },
    reset() { state = JSON.parse(JSON.stringify(DEFAULT)); save(); }
  };
})();
