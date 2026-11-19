/* ============================================================
 * 英语小伴 Kids English Buddy —— 主程序 v0.1
 * 核心闭环：IP学伴对话闯关 → 语音评测 → 星星/XP/宠物养成 → 家长周报
 * 合规内建：封闭课程域 / 家长门 / 每日时长锁 / 数据仅存本机
 * ============================================================ */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];
  let screen = 'onboarding';
  let L = null;              // 当前课程会话
  let R = null;              // 当前复习会话
  let gateAction = null;     // 家长门通过后的回调
  let dayOverride = false;   // 家长今日临时解锁

  /* ---------------- 屏幕路由 ---------------- */
  function show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $('screen-' + name).classList.add('active');
    screen = name;
    window.scrollTo(0, 0);
  }

  /* ---------------- 宠物 SVG（四阶段养成） ---------------- */
  function petSVG(stage, size = 120) {
    const body = '#ff9d4d', belly = '#ffe8d1', dark = '#5b3a1e';
    if (stage === 0) return `<svg width="${size}" height="${size}" viewBox="0 0 120 120"><ellipse cx="60" cy="70" rx="34" ry="42" fill="#fff6e8" stroke="#e8c9a0" stroke-width="3"/><path d="M40 60 q6 -8 12 0 q6 8 12 0 q6 -8 12 0" stroke="#e8c9a0" stroke-width="3" fill="none"/><circle cx="50" cy="78" r="3" fill="${dark}"/><circle cx="70" cy="78" r="3" fill="${dark}"/><path d="M52 90 q8 6 16 0" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/><text x="60" y="30" text-anchor="middle" font-size="16">✨</text></svg>`;
    const cape = stage === 3 ? `<path d="M30 62 L14 100 L46 88 Z" fill="#e6455a"/><path d="M90 62 L106 100 L74 88 Z" fill="#e6455a"/>` : '';
    const ears = `<path d="M38 34 L30 10 L52 24 Z" fill="${body}"/><path d="M82 34 L90 10 L68 24 Z" fill="${body}"/><path d="M40 30 L36 18 L48 25 Z" fill="${belly}"/><path d="M80 30 L84 18 L72 25 Z" fill="${belly}"/>`;
    const crown = stage === 3 ? `<text x="60" y="14" text-anchor="middle" font-size="18">👑</text>` : '';
    const blush = stage >= 2 ? `<circle cx="42" cy="66" r="5" fill="#ffb3ba" opacity=".7"/><circle cx="78" cy="66" r="5" fill="#ffb3ba" opacity=".7"/>` : '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 120 120">${cape}${ears}<circle cx="60" cy="62" r="34" fill="${body}"/><ellipse cx="60" cy="74" rx="20" ry="16" fill="${belly}"/><circle cx="48" cy="56" r="4.5" fill="${dark}"/><circle cx="72" cy="56" r="4.5" fill="${dark}"/><circle cx="49.5" cy="54.5" r="1.5" fill="#fff"/><circle cx="73.5" cy="54.5" r="1.5" fill="#fff"/><ellipse cx="60" cy="66" rx="4" ry="3" fill="${dark}"/><path d="M52 74 q8 7 16 0" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>${blush}<ellipse cx="60" cy="104" rx="26" ry="8" fill="#00000014"/>${crown}</svg>`;
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    const p = Store.state.profile;
    const pet = Store.petStage();
    $('home-greet').textContent = `${p.name}，今天也要开口说英语哦！`;
    $('home-pet').innerHTML = petSVG(pet.index, 130);
    $('home-pet-name').textContent = pet.name;
    const pct = pet.next ? Math.min(100, Math.round((Store.state.xp - pet.min) / (pet.next.min - pet.min) * 100)) : 100;
    $('home-xpbar').style.width = pct + '%';
    $('home-xptext').textContent = pet.next ? `⭐ ${Store.state.xp} / ${pet.next.min} 升级` : `⭐ ${Store.state.xp} 已满级`;
    $('home-streak').textContent = `🔥 连续 ${Store.state.streak.count} 天`;
    const due = Store.dueWords().length;
    $('btn-review').style.display = due ? '' : 'none';
    $('review-badge').textContent = due;
    $('stt-banner').style.display = Speech.sttOK ? 'none' : '';
    const lessons = LESSONS.filter(l => l.band === p.band);
    $('lesson-grid').innerHTML = lessons.map(l => {
      const rec = Store.state.lessons[l.id];
      const stars = rec ? '★'.repeat(rec.stars) + '☆'.repeat(Math.max(0, 3 - rec.stars)) : '未挑战';
      return `<button class="lesson-card" data-lesson="${l.id}">
        <span class="lesson-icon">${l.icon}</span>
        <span class="lesson-title">${esc(l.title)}</span>
        <span class="lesson-en">${esc(l.titleEn)}</span>
        <span class="lesson-stars">${stars}</span>
      </button>`;
    }).join('');
    $('lesson-grid').querySelectorAll('[data-lesson]').forEach(b => b.onclick = () => startLesson(b.dataset.lesson));
    show('home');
  }

  /* ---------------- 每日时长锁 ---------------- */
  function checkLimit() {
    const p = Store.state.profile;
    if (dayOverride) return true;
    if (Store.todaySeconds() >= p.dailyLimit * 60) { openModal('modal-lock'); return false; }
    return true;
  }

  /* ---------------- 课程闯关 ---------------- */
  function startLesson(id) {
    if (!checkLimit()) return;
    const lesson = LESSONS.find(l => l.id === id);
    L = { lesson, idx: -1, stars: [], accs: [], retries: 0, seconds: 0, mode: Speech.sttOK ? 'score' : 'practice', timer: null, listening: false };
    show('lesson');
    $('lesson-title').textContent = lesson.icon + ' ' + lesson.title;
    $('lesson-progress').textContent = '';
    renderIntro();
    L.timer = setInterval(() => { L.seconds++; if (L.seconds % 10 === 0) Store.addSeconds(10); }, 1000);
  }
  function flushTime() { if (L && L.timer) { clearInterval(L.timer); L.timer = null; Store.addSeconds(L.seconds % 10); } }
  function exitLesson() { flushTime(); Speech.stopSpeak(); Speech.stopListen(); L = null; renderHome(); }

  function renderIntro() {
    $('lesson-body').innerHTML = `
      <div class="intro-card">
        <div class="pet-big">${petSVG(Store.petStage().index, 110)}</div>
        <p class="intro-text">${esc(L.lesson.intro)}</p>
        <button class="btn btn-primary btn-big" id="btn-start-turns">开始闯关 🚀</button>
      </div>`;
    $('btn-start-turns').onclick = () => { L.idx = 0; renderTurn(); };
    Speech.speak(rand(PET_LINES.hello));
  }

  function renderTurn() {
    const t = L.lesson.turns[L.idx];
    L.retries = 0;
    $('lesson-progress').textContent = `第 ${L.idx + 1} / ${L.lesson.turns.length} 关`;
    $('lesson-bar').style.width = Math.round(L.idx / L.lesson.turns.length * 100) + '%';
    const micUI = L.mode === 'score'
      ? `<button class="btn btn-mic" id="btn-mic">🎤 点一下，大声说</button>`
      : `<button class="btn btn-primary" id="btn-done-practice">✅ 我大声说完了</button>`;
    $('lesson-body').innerHTML = `
      <div class="turn-card">
        <div class="pet-row"><div class="pet-mid talking" id="turn-pet">${petSVG(Store.petStage().index, 90)}</div>
          <div class="bubble"><div class="bubble-en">${esc(t.pet)}</div><div class="bubble-zh">${esc(t.zh)}</div></div></div>
        <div class="target-line">🎯 目标：<b>${esc(t.expect)}</b>${t.type === 'answer' ? '<span class="tag-answer">自由回答</span>' : ''}</div>
        <div class="turn-actions">
          <button class="btn btn-ghost" id="btn-listen">🔊 听一听</button>
          ${micUI}
        </div>
        <div id="feedback" class="feedback"></div>
        ${Speech.sttOK ? `<div class="mode-switch"><button class="btn-link" id="btn-mode">${L.mode === 'score' ? '🎤 麦克风不好用？切换跟读模式' : '🎤 试试语音评分模式'}</button></div>` : ''}
        <div class="turn-nav">
          <button class="btn btn-ghost" id="btn-retry" style="display:none">🔁 再试一次</button>
          <button class="btn btn-primary" id="btn-next" style="display:none">下一关 ➜</button>
        </div>
      </div>`;
    $('btn-listen').onclick = () => Speech.speak(t.pet);
    if (L.mode === 'score') $('btn-mic').onclick = onMic;
    else $('btn-done-practice').onclick = () => acceptTurn({ stars: 2, acc: null, detail: [], heard: '(跟读练习)' }, true);
    $('btn-retry').onclick = () => { L.retries++; $('feedback').innerHTML = ''; $('btn-retry').style.display = 'none'; $('btn-next').style.display = 'none'; const m = $('btn-mic'); if (m) { m.disabled = false; m.textContent = '🎤 点一下，大声说'; } };
    $('btn-next').onclick = nextTurn;
    const bm = $('btn-mode'); if (bm) bm.onclick = () => { L.mode = L.mode === 'score' ? 'practice' : 'score'; renderTurn(); };
    Speech.speak(t.pet);
  }

  async function onMic() {
    if (L.listening) { Speech.stopListen(); return; }
    const btn = $('btn-mic');
    L.listening = true;
    btn.classList.add('listening');
    btn.textContent = '⏹ 说完了，点我';
    $('feedback').innerHTML = '<div class="listening-wave"><span></span><span></span><span></span><span></span><span></span></div><div class="heard" id="heard-live"></div>';
    try {
      const result = await Speech.listen(10000, txt => { const el = $('heard-live'); if (el) el.textContent = '我听到：' + txt + '…'; });
      L.fails = 0;
      const t = L.lesson.turns[L.idx];
      const sc = Speech.score(result, t.keywords);
      acceptTurn(sc, false);
    } catch (e) {
      L.fails = (L.fails || 0) + 1;
      if (e.message === 'not-allowed' || e.message === 'service-not-allowed' || e.message === 'no-stt') {
        L.mode = 'practice';
        renderTurn();
        $('feedback').innerHTML = '<div class="fb-warn">麦克风不可用，已切换为跟读练习模式，照样能闯关～</div>';
        return;
      }
      let html = `<div class="fb-warn">${esc(Speech.errMsg(e.message))}</div>`;
      if (L.fails >= 2) html += '<div class="fb-warn">连续没听清？点下方「切换跟读模式」照样闯关，或换 Edge 浏览器打开本页。</div>';
      $('feedback').innerHTML = html;
      // 防卡关：失败也永远有出口（重试 / 跳过）
      $('btn-retry').style.display = '';
      const nx = $('btn-next');
      nx.style.display = '';
      nx.textContent = '跳过这关 ➜';
      nx.onclick = skipTurn;
    } finally {
      L.listening = false;
      if (btn.isConnected) { btn.classList.remove('listening'); btn.textContent = '🎤 点一下，大声说'; }
    }
  }

  /* 跳过当前关：记 0 星并把生词排入明日复习，不卡进度 */
  function skipTurn() {
    const t = L.lesson.turns[L.idx];
    L.stars.push(0);
    const vocabHit = L.lesson.vocab.find(v => t.keywords.includes(v.w.split(' ')[0]));
    if (vocabHit) Store.recordWord(vocabHit.w, vocabHit.zh, vocabHit.s, false);
    nextTurn();
  }

  function acceptTurn(sc, practice) {
    const t = L.lesson.turns[L.idx];
    L.stars.push(sc.stars);
    if (sc.acc != null) L.accs.push(sc.acc);
    // 记录生词（answer 关记录目标句型关键词）
    const vocabHit = L.lesson.vocab.find(v => t.keywords.includes(v.w.split(' ')[0]));
    if (vocabHit) Store.recordWord(vocabHit.w, vocabHit.zh, vocabHit.s, sc.stars >= 2);
    Store.addXp(sc.stars * 2);
    const chips = sc.detail.map(d => `<span class="chip ${d.ok ? 'ok' : 'miss'}">${esc(d.word)}</span>`).join('');
    const starStr = '★'.repeat(sc.stars) + '☆'.repeat(3 - sc.stars);
    const heard = practice ? '' : `<div class="heard">我听到：「${esc(sc.heard)}」${sc.acc != null ? ` · 匹配度 ${sc.acc}%` : ''}</div>`;
    $('feedback').innerHTML = `<div class="fb-stars">${starStr}</div>${heard}<div class="chips">${chips}</div>`;
    const praise = practice ? rand(PET_LINES.practice) : sc.stars === 3 ? rand(PET_LINES.praise3) : sc.stars === 2 ? rand(PET_LINES.praise2) : rand(PET_LINES.praise1);
    Speech.speak(praise);
    $('btn-next').style.display = '';
    $('btn-next').onclick = nextTurn;
    $('btn-next').textContent = L.idx === L.lesson.turns.length - 1 ? '完成 🎉' : '下一关 ➜';
    if (!practice && sc.stars <= 1 && L.retries < 1) $('btn-retry').style.display = '';
    const m = $('btn-mic'); if (m) m.disabled = true;
    const d = $('btn-done-practice'); if (d) d.disabled = true;
  }

  function nextTurn() {
    if (L.idx < L.lesson.turns.length - 1) { L.idx++; renderTurn(); }
    else finishLesson();
  }

  function finishLesson() {
    flushTime();
    const total = L.stars.reduce((a, b) => a + b, 0);
    const max = L.lesson.turns.length * 3;
    const avgAcc = L.accs.length ? Math.round(L.accs.reduce((a, b) => a + b, 0) / L.accs.length) : null;
    const bigStars = total >= max * 0.85 ? 3 : total >= max * 0.6 ? 2 : 1;
    Store.completeLesson(L.lesson.id, bigStars, avgAcc || 0, L.mode);
    const leveled = Store.addXp(20 + total * 3);
    const lesson = L.lesson;
    $('result-body').innerHTML = `
      <div class="result-card">
        <div class="result-stars">${'★'.repeat(bigStars)}${'☆'.repeat(3 - bigStars)}</div>
        <h2>${bigStars === 3 ? '太棒了！' : bigStars === 2 ? '真不错！' : '完成啦！'}</h2>
        <p>「${esc(lesson.title)}」闯关成功 · 获得 ${total} 颗小星星</p>
        ${avgAcc != null ? `<p class="muted">平均匹配度 ${avgAcc}%</p>` : '<p class="muted">跟读练习模式</p>'}
        ${leveled ? `<div class="levelup">🎉 Pip 升级啦！${petSVG(Store.petStage().index, 90)}<b>${Store.petStage().name}</b></div>` : ''}
        <div class="vocab-list">${lesson.vocab.map(v => `<span class="vocab-chip">${esc(v.w)} · ${esc(v.zh)}</span>`).join('')}</div>
        <div class="result-actions">
          <button class="btn btn-ghost" id="btn-again">🔁 再玩一次</button>
          <button class="btn btn-ghost" id="btn-share">🖼️ 生成分享卡</button>
          <button class="btn btn-primary" id="btn-back-home">回首页 🏠</button>
        </div>
      </div>`;
    $('btn-again').onclick = () => startLesson(lesson.id);
    $('btn-back-home').onclick = renderHome;
    $('btn-share').onclick = openShareCard;
    show('result');
    Speech.speak(leveled ? rand(PET_LINES.levelup) : 'Great job! See you next time!');
    L = null;
  }

  /* ---------------- 复习（间隔重复） ---------------- */
  function startReview() {
    const due = Store.dueWords();
    if (!due.length) return;
    R = { words: due, idx: 0, mode: Speech.sttOK ? 'score' : 'practice' };
    show('review');
    renderReviewCard();
  }
  function renderReviewCard() {
    const w = R.words[R.idx];
    $('review-progress').textContent = `复习 ${R.idx + 1} / ${R.words.length}`;
    const micUI = R.mode === 'score'
      ? '<button class="btn btn-mic" id="btn-rmic">🎤 点一下，大声说</button>'
      : '<button class="btn btn-primary" id="btn-rdone">✅ 我大声说完了</button>';
    $('review-body').innerHTML = `
      <div class="turn-card">
        <div class="review-word">${esc(w.w)}</div>
        <div class="review-zh">${esc(w.zh)}</div>
        <div class="review-sentence">${esc(w.s)}</div>
        <div class="turn-actions"><button class="btn btn-ghost" id="btn-rlisten">🔊 听一听</button>${micUI}</div>
        <div id="rfeedback" class="feedback"></div>
        <button class="btn btn-primary" id="btn-rnext" style="display:none">下一个 ➜</button>
      </div>`;
    $('btn-rlisten').onclick = () => Speech.speak(w.s);
    if (R.mode === 'score') $('btn-rmic').onclick = async () => {
      $('rfeedback').innerHTML = '<div class="listening-wave"><span></span><span></span><span></span></div>';
      try {
        const res = await Speech.listen(8000);
        const sc = Speech.score(res, w.w.toLowerCase().split(' '));
        Store.recordWord(w.w, w.zh, w.s, sc.stars >= 2);
        $('rfeedback').innerHTML = `<div class="fb-stars">${'★'.repeat(sc.stars)}${'☆'.repeat(3 - sc.stars)}</div><div class="heard">我听到：「${esc(sc.heard)}」</div>`;
        Speech.speak(sc.stars >= 2 ? rand(PET_LINES.praise3) : rand(PET_LINES.praise1));
      } catch (e) {
        Store.recordWord(w.w, w.zh, w.s, false);
        $('rfeedback').innerHTML = `<div class="fb-warn">${esc(Speech.errMsg(e.message))}</div>`;
        $('btn-rnext').style.display = '';
        return;
      }
      $('btn-rnext').style.display = '';
    };
    else $('btn-rdone').onclick = () => { Store.recordWord(w.w, w.zh, w.s, true); $('rfeedback').innerHTML = '<div class="fb-stars">★★☆</div>'; Speech.speak(rand(PET_LINES.practice)); $('btn-rnext').style.display = ''; };
    $('btn-rnext').onclick = () => { if (R.idx < R.words.length - 1) { R.idx++; renderReviewCard(); } else { R = null; renderHome(); } };
    Speech.speak(w.s);
  }

  /* ---------------- 家长门 ---------------- */
  function openGate(action) {
    gateAction = action;
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    $('gate-q').textContent = `${a} × ${b} = ?`;
    $('gate-answer').value = '';
    $('gate-answer').dataset.expect = a * b;
    $('gate-err').textContent = '';
    openModal('modal-gate');
    setTimeout(() => $('gate-answer').focus(), 100);
  }
  function gateCheck() {
    if (parseInt($('gate-answer').value, 10) === parseInt($('gate-answer').dataset.expect, 10)) {
      closeModal('modal-gate');
      const fn = gateAction; gateAction = null;
      if (fn) fn();
    } else $('gate-err').textContent = '答案不对哦，请家长再试一次';
  }

  /* ---------------- 家长中心 ---------------- */
  function renderParent() {
    const s = Store.state, p = s.profile;
    const todayMin = Math.round(Store.todaySeconds() / 60);
    const weekMin = Math.round(Store.weekSeconds() / 60);
    const days = Store.last7Days();
    const maxSec = Math.max(60, ...days.map(d => d.sec));
    const accSessions = s.sessions.filter(x => x.acc > 0);
    const avgAcc = accSessions.length ? Math.round(accSessions.reduce((a, b) => a + b.acc, 0) / accSessions.length) : null;
    $('parent-body').innerHTML = `
      <div class="stat-grid">
        <div class="stat"><b>${todayMin}</b><span>今日开口(分钟)</span></div>
        <div class="stat"><b>${weekMin}</b><span>本周开口(分钟)</span></div>
        <div class="stat"><b>${Store.masteredCount()}</b><span>已掌握词句</span></div>
        <div class="stat"><b>${s.streak.count}</b><span>连续天数</span></div>
      </div>
      ${avgAcc != null ? `<p class="muted center">平均发音匹配度 ${avgAcc}% · 完成课程 ${Object.keys(s.lessons).length} 门</p>` : ''}
      <h3>最近 7 天开口时长</h3>
      <div class="chart">${days.map(d => `<div class="bar-col"><div class="bar" style="height:${Math.max(4, Math.round(d.sec / maxSec * 90))}px" title="${Math.round(d.sec / 60)}分钟"></div><span>${d.label}</span></div>`).join('')}</div>
      <h3>课程设置</h3>
      <div class="settings">
        <label>昵称 <input id="set-name" value="${esc(p.name)}" maxlength="12"></label>
        <label>年龄段 <select id="set-band">
          <option value="3-6" ${p.band === '3-6' ? 'selected' : ''}>3–6 岁 启蒙</option>
          <option value="6-9" ${p.band === '6-9' ? 'selected' : ''}>6–9 岁 基础</option>
          <option value="9-12" ${p.band === '9-12' ? 'selected' : ''}>9–12 岁 提升</option>
        </select></label>
        <label>每日时长上限 <select id="set-limit">
          ${[10, 15, 20, 30].map(m => `<option value="${m}" ${p.dailyLimit === m ? 'selected' : ''}>${m} 分钟</option>`).join('')}
        </select></label>
        <button class="btn btn-primary" id="btn-save-settings">保存设置</button>
      </div>
      <h3>数据（仅保存在本机浏览器）</h3>
      <div class="settings">
        <button class="btn btn-ghost" id="btn-export">⬇️ 导出学习数据</button>
        <button class="btn btn-ghost" id="btn-import">⬆️ 导入学习数据</button>
        <input type="file" id="import-file" accept=".json" style="display:none">
        <button class="btn btn-danger" id="btn-reset">🗑️ 清空全部数据</button>
      </div>
      <p class="muted small">隐私说明：v0.1 所有学习数据仅存于本机浏览器；语音识别使用浏览器内置服务（Chrome 会经 Google 服务处理音频），正式版将替换为合规的儿童语音评测服务。本产品为封闭课程域学习工具，不提供开放式 AI 聊天。</p>`;
    $('btn-save-settings').onclick = () => {
      Store.updateProfile({ name: $('set-name').value.trim() || p.name, band: $('set-band').value, dailyLimit: parseInt($('set-limit').value, 10) });
      dayOverride = false;
      renderParent();
    };
    $('btn-export').onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'kids-buddy-data-' + Store.today() + '.json';
      a.click();
    };
    $('btn-import').onclick = () => $('import-file').click();
    $('import-file').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { Store.importJSON(rd.result); renderParent(); } catch (err) { alert('文件格式不对'); } };
      rd.readAsText(f);
    };
    $('btn-reset').onclick = () => { if (confirm('确定清空所有学习数据？此操作不可恢复。')) { Store.reset(); show('onboarding'); } };
    show('parent');
  }

  /* ---------------- 分享卡（获客素材：晒娃卡片） ---------------- */
  function openShareCard() {
    const p = Store.state.profile, pet = Store.petStage();
    const c = document.createElement('canvas');
    c.width = 720; c.height = 960;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 960);
    g.addColorStop(0, '#fff3e0'); g.addColorStop(1, '#ffd9a0');
    x.fillStyle = g; x.fillRect(0, 0, 720, 960);
    x.fillStyle = '#ff9d4d'; x.beginPath(); x.arc(360, 250, 130, 0, 7); x.fill();
    x.font = '120px serif'; x.textAlign = 'center'; x.fillText(pet.emoji, 360, 295);
    x.fillStyle = '#5b3a1e'; x.font = 'bold 52px sans-serif';
    x.fillText('英语开口小达人', 360, 460);
    x.font = '36px sans-serif'; x.fillText(p.name + ' · ' + pet.name, 360, 520);
    const stats = [
      ['本周开口', Math.round(Store.weekSeconds() / 60) + ' 分钟'],
      ['掌握词句', Store.masteredCount() + ' 个'],
      ['连续打卡', Store.state.streak.count + ' 天'],
      ['累计星星', Store.state.xp + ' ⭐']
    ];
    stats.forEach((st, i) => {
      const bx = 60 + (i % 2) * 310, by = 570 + Math.floor(i / 2) * 130;
      x.fillStyle = '#ffffffcc'; x.beginPath(); x.roundRect(bx, by, 290, 110, 20); x.fill();
      x.fillStyle = '#e67e22'; x.font = 'bold 40px sans-serif'; x.fillText(st[1], bx + 145, by + 50);
      x.fillStyle = '#8a6d4b'; x.font = '26px sans-serif'; x.fillText(st[0], bx + 145, by + 88);
    });
    x.fillStyle = '#8a6d4b'; x.font = '26px sans-serif';
    x.fillText('每天 15 分钟，和 Pip 一起开口说英语', 360, 880);
    x.fillText('—— 英语小伴 Kids English Buddy ——', 360, 920);
    const url = c.toDataURL('image/png');
    $('share-img').src = url;
    $('share-download').href = url;
    $('share-download').download = 'kids-buddy-card.png';
    openModal('modal-share');
  }

  /* ---------------- 弹窗 ---------------- */
  function openModal(id) { $(id).classList.add('open'); }
  function closeModal(id) { $(id).classList.remove('open'); }

  /* ---------------- 初始化 ---------------- */
  function init() {
    // 家长区入口（首页/结果页按钮）
    document.querySelectorAll('[data-parent]').forEach(b => b.onclick = () => openGate(renderParent));
    $('btn-review').onclick = startReview;
    $('btn-exit-lesson').onclick = exitLesson;
    $('btn-exit-review').onclick = () => { R = null; renderHome(); };
    $('btn-parent-back').onclick = renderHome;
    $('gate-ok').onclick = gateCheck;
    $('gate-answer').onkeydown = e => { if (e.key === 'Enter') gateCheck(); };
    $('gate-cancel').onclick = () => closeModal('modal-gate');
    $('lock-cancel').onclick = () => closeModal('modal-lock');
    $('lock-parent').onclick = () => { closeModal('modal-lock'); openGate(() => { dayOverride = true; }); };
    $('share-close').onclick = () => closeModal('modal-share');
    // 引导页
    let band = '6-9';
    document.querySelectorAll('.band-card').forEach(b => b.onclick = () => {
      document.querySelectorAll('.band-card').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected'); band = b.dataset.band;
    });
    $('btn-onboard').onclick = () => {
      const name = $('onboard-name').value.trim();
      if (!name) { $('onboard-err').textContent = '先告诉 Pip 你的名字吧～'; return; }
      Store.createProfile(name, band, parseInt($('onboard-limit').value, 10));
      renderHome();
      Speech.speak('Hello ' + name + '! I am Pip!');
    };
    if (Store.state.profile) renderHome(); else show('onboarding');
  }
  document.addEventListener('DOMContentLoaded', init);
})();
