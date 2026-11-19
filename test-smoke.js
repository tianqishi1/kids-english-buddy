/* Node 冒烟测试：评分引擎 + 数据层（不依赖浏览器） */
global.window = global;
const mem = {};
global.localStorage = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); } };
require('./js/lessons.js');
require('./js/speech.js');
require('./js/store.js');
const assert = require('assert');

// 1. 课程数据完整性
assert.strictEqual(LESSONS.length, 9);
for (const l of LESSONS) {
  assert.ok(l.turns.length >= 5, l.id);
  assert.ok(l.vocab.length >= 3, l.id);
  for (const t of l.turns) assert.ok(t.pet && t.zh && t.keywords.length, l.id);
}
assert.strictEqual(new Set(LESSONS.map(l => l.band)).size, 3);

// 2. 评分引擎
let sc = Speech.score({ text: 'Hello! My name is Tom.', confidence: 0.9, alternatives: [] }, ['my', 'name']);
assert.strictEqual(sc.stars, 3);
sc = Speech.score({ text: 'I like red', confidence: 0.8, alternatives: [] }, ['i', 'like']);
assert.strictEqual(sc.stars, 3);
sc = Speech.score({ text: 'um hello', confidence: 0.4, alternatives: [] }, ['my', 'name', 'is']);
assert.ok(sc.stars <= 1);
sc = Speech.score({ text: 'nice to meet you', confidence: 0.9, alternatives: ['nice to meet you'] }, ['nice', 'meet', 'you']);
assert.strictEqual(sc.stars, 3);

// 3. 数据层
Store.createProfile('小明', '6-9', 15);
assert.strictEqual(Store.petStage().index, 0);
Store.addXp(120);
assert.strictEqual(Store.petStage().index, 1);
Store.addXp(600);
assert.strictEqual(Store.petStage().index, 3);
Store.recordWord('hello', '你好', 'Hello!', false);
assert.ok(Store.state.words.hello.due > Date.now());
Store.recordWord('hello', '你好', 'Hello!', true);
Store.recordWord('hello', '你好', 'Hello!', true);
assert.strictEqual(Store.masteredCount(), 1);
Store.completeLesson('greet1', 3, 90, 'score');
assert.strictEqual(Store.state.streak.count, 1);
assert.strictEqual(Store.state.lessons.greet1.stars, 3);
Store.addSeconds(900);
assert.strictEqual(Store.todaySeconds(), 900);
assert.strictEqual(Store.weekSeconds(), 900);
const exported = Store.exportJSON();
Store.reset();
assert.strictEqual(Store.state.profile, null);
Store.importJSON(exported);
assert.strictEqual(Store.state.profile.name, '小明');
console.log('ALL SMOKE TESTS PASSED ✔ (lessons=9, scoring, xp/streak/srs/export-import)');
