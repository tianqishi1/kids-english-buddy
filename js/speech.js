/* ============================================================
 * 语音引擎 v0.1.1
 * TTS: 浏览器 speechSynthesis（免费、离线可用）
 * STT: Web Speech API（需 localhost/https 安全上下文）
 *   - Chrome 走 Google 服务，中国大陆网络常见 network 错误 → 建议 Edge
 *   - 支持 interim 实时回显，让孩子看到"被听到了"
 * 评分: 关键词覆盖度 + 识别置信度（v0.2 计划替换为音素级儿童评测 API）
 * 无 STT 环境自动降级为"跟读练习模式"（家长辅助），保证任何设备可用
 * ============================================================ */
window.Speech = (function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ttsOK = 'speechSynthesis' in window;
  const sttOK = !!SR;
  let voice = null;
  let currentRec = null;

  function pickVoice() {
    if (!ttsOK) return;
    const vs = speechSynthesis.getVoices().filter(v => /^en(-|_)/i.test(v.lang));
    const prefer = ['Google US English', 'Microsoft Zira', 'Microsoft Aria', 'Microsoft Jenny', 'Samantha'];
    for (const p of prefer) { const hit = vs.find(v => v.name.includes(p)); if (hit) { voice = hit; return; } }
    voice = vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  }
  if (ttsOK) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function speak(text, opts = {}) {
    return new Promise(resolve => {
      if (!ttsOK) { resolve(); return; }
      try { speechSynthesis.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = opts.rate || 0.82;   // 儿童友好语速
      u.pitch = opts.pitch || 1.15; // 略高音调，更像小伙伴
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
      // 兜底：某些浏览器 onend 不触发
      setTimeout(resolve, Math.max(2500, text.length * 120));
    });
  }

  function stopSpeak() { if (ttsOK) try { speechSynthesis.cancel(); } catch (e) {} }

  /* 返回 Promise<{text, confidence, alternatives[]}>；reject(Error)
   * onInterim(text): 可选，实时回显中间识别结果 */
  function listen(timeoutMs = 10000, onInterim) {
    return new Promise((resolve, reject) => {
      if (!sttOK) { reject(new Error('no-stt')); return; }
      stopSpeak();
      const rec = new SR();
      currentRec = rec;
      rec.lang = 'en-US';
      rec.interimResults = true;   // 实时回显，确认麦克风在工作
      rec.maxAlternatives = 3;
      let done = false;
      const finish = (fn, arg) => { if (!done) { done = true; currentRec = null; fn(arg); } };
      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            const alts = [];
            let best = null;
            for (let j = 0; j < r.length; j++) {
              const a = r[j];
              alts.push(a.transcript);
              if (!best || a.confidence > best.confidence) best = a;
            }
            finish(resolve, { text: best.transcript, confidence: best.confidence || 0.5, alternatives: alts });
            return;
          }
          interim += r[0].transcript;
        }
        if (interim && onInterim) { try { onInterim(interim); } catch (e) {} }
      };
      rec.onerror = e => finish(reject, new Error(e.error || 'stt-error'));
      rec.onend = () => finish(reject, new Error('no-speech'));
      try { rec.start(); } catch (e) { finish(reject, e); return; }
      setTimeout(() => { try { rec.stop(); } catch (e) {} }, timeoutMs);
    });
  }

  function stopListen() { if (currentRec) try { currentRec.stop(); } catch (e) {} }

  /* 错误码 → 孩子/家长能看懂的提示 */
  const ERR_MSG = {
    'no-speech': 'Pip 没听到声音 😅 靠近麦克风、大声一点，再点一次试试',
    'network': '连不上语音识别服务 😢 Chrome 的识别依赖 Google 服务，国内网络常不可用。建议改用 Edge 浏览器打开本页，或点下方「切换跟读模式」继续闯关',
    'not-allowed': '麦克风权限没打开，请点地址栏的小锁图标允许麦克风，然后刷新页面',
    'service-not-allowed': '当前浏览器不允许语音识别服务，请换 Edge/Chrome，或用跟读模式',
    'audio-capture': '找不到麦克风 🎤 请检查设备是否接好',
    'aborted': '收音被中断了，再点一次麦克风试试',
    'language-not-supported': '当前浏览器不支持英语识别，请换 Edge/Chrome',
    'no-stt': '当前浏览器不支持语音识别，已为你准备跟读练习模式'
  };
  function errMsg(code) { return ERR_MSG[code] || ('语音识别出了点小问题（' + code + '），再试一次，或切换跟读模式'); }

  /* ---------- 评分 ---------- */
  function norm(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tokens(s) { return norm(s).split(' ').filter(Boolean); }

  /* 关键词覆盖评分：识别文本(含候选)命中 keywords 的比例 */
  function score(result, keywords) {
    const heard = [result.text, ...(result.alternatives || [])].map(norm).join(' | ');
    const heardTokens = new Set(heard.split(/[\s|]+/).filter(Boolean));
    let hit = 0;
    const detail = keywords.map(k => {
      const ok = heardTokens.has(k.toLowerCase()) || heard.includes(k.toLowerCase());
      if (ok) hit++;
      return { word: k, ok };
    });
    const coverage = keywords.length ? hit / keywords.length : 0;
    const conf = Math.min(1, Math.max(0, result.confidence || 0.5));
    const acc = Math.round((coverage * 0.8 + conf * 0.2) * 100);
    const stars = coverage >= 0.85 ? 3 : coverage >= 0.6 ? 2 : coverage >= 0.3 ? 1 : 0;
    return { acc, stars, detail, heard: result.text };
  }

  return { ttsOK, sttOK, speak, stopSpeak, listen, stopListen, score, norm, errMsg };
})();