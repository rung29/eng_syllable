const DOJO_TOPICS = {
  all: '不限範圍',
  animals: '動物',
  food: '食物',
  school: '學校',
  daily: '日常生活',
  nature: '自然',
  activities: '運動與活動'
};
const DOJO_DIFFICULTIES = { all: '混合難度', easy: '入門', medium: '進階', hard: '挑戰' };
const DOJO_COUNTS = { all: '混合（1–4 音節）', 1: '1 音節', 2: '2 音節', 3: '3 音節', 4: '4 音節' };
const DOJO_DEFAULT_SETTINGS = { topic: 'all', count: 'all', difficulty: 'all', size: 6, source: 'builtin' };
const DOJO_RECENT_KEY = 'eng_syllable.dojo_recent.v1';
const DOJO_REVIEWED_KEY = 'eng_syllable.dojo_reviewed.v1';
const DOJO_WORD_PATTERN = /^[a-z]{2,16}$/;

const DOJO_BELT_EXTRA_ROWS = [
  `rain.coat|雨衣
sea.shell|貝殼
sun.set|日落
snow.ball|雪球
book.shelf|書架
tea.pot|茶壺
door.bell|門鈴
bed.room|臥室
day.dream|白日夢
moon.light|月光
rain.drop|雨滴
drum.stick|鼓棒
note.book|筆記本`,
  `but.ter|奶油
pep.per|胡椒
ap.ple|蘋果
bub.ble|泡泡
pud.dle|水坑
fol.low|跟隨
dol.lar|元
car.rot|胡蘿蔔
bel.ly|肚子
sup.per|晚餐
cot.ton|棉花
rub.ber|橡膠
od.der|更奇怪的`,
  `ham.ster|倉鼠
pen.guin|企鵝
os.trich|鴕鳥
blan.ket|毯子
sand.wich|三明治
win.ter|冬天
pub.lic|公共的
sub.ject|科目
sen.tence|句子
ar.cher|弓箭手
pan.try|食品儲藏室
cus.tard|卡士達
cur.tain|窗簾`,
  `he.ro|英雄
o.pen|打開
ze.ro|零
hu.man|人類
lo.cal|本地的
a.pron|圍裙
fla.vor|風味
no.tice|注意
mo.ment|時刻
le.gal|合法的
la.bel|標籤
mo.tor|馬達
tu.na|鮪魚`
];

function dojoRows(rows, topic, difficulty) {
  return rows.trim().split('\n').map(row => {
    const [written, meaning] = row.trim().split('|');
    const syllables = written.split('.');
    return {
      word: syllables.join(''),
      syllables,
      splitIndex: syllables[0].length,
      meaning,
      topic,
      difficulty
    };
  });
}

const DOJO_BUILTIN_WORDS = Object.entries(DOJO_WORD_ROWS).flatMap(([topic, blocks]) =>
  blocks.flatMap(([difficulty, rows]) => dojoRows(rows, topic, difficulty))
);

const DOJO_GEMINI_CANDIDATES = [
  ...DOJO_BUILTIN_WORDS,
  ...Object.entries(DOJO_GEMINI_WORD_ROWS).flatMap(([topic, blocks]) =>
    blocks.flatMap(([difficulty, rows]) => dojoRows(rows.replaceAll(' ', '\n'), topic, difficulty))
  )
];

const DOJO_LOCAL_SYLLABLES = new Map([
  ...WORD_LEVELS.flatMap(level => level.words),
  ...DOJO_BELT_EXTRA_ROWS.flatMap(rows => dojoRows(rows)),
  ...DOJO_GEMINI_CANDIDATES
].map(({ word, syllables }) => [word, syllables]));

function makeBeltPool(levelIndex) {
  const level = WORD_LEVELS[levelIndex];
  const extras = DOJO_BELT_EXTRA_ROWS[levelIndex];
  const more = extras
    ? dojoRows(extras)
    : DOJO_BUILTIN_WORDS.filter(word => word.syllables.length === 2);
  return sampleDojoWords([...level.words, ...more], level.words.length, readDojoRecent());
}

function shuffledDojoWords(words) {
  const shuffled = [...words];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function sampleDojoWords(pool, size, recent, balanceCounts = false) {
  const byWord = new Map();
  for (const item of pool) {
    if (!byWord.has(item.word)) byWord.set(item.word, item);
  }
  const words = shuffledDojoWords(byWord.values());
  const age = new Map(recent.map((word, index) => [word, index]));
  const fresh = words.filter(item => !age.has(item.word));
  const seen = words.filter(item => age.has(item.word)).sort((a, b) => age.get(b.word) - age.get(a.word));
  const candidates = [...fresh, ...seen];
  if (!balanceCounts) return candidates.slice(0, size);

  // Balance available syllable counts without taking a repeated word ahead of a fresh word.
  const selectAcrossCounts = (items, amount) => {
    const groups = shuffledDojoWords([1, 2, 3, 4]).map(count =>
      items.filter(item => item.syllables.length === count));
    const result = [];
    while (result.length < amount && groups.some(group => group.length)) {
      for (const group of groups) {
        if (group.length && result.length < amount) result.push(group.shift());
      }
    }
    return result;
  };
  const preferred = selectAcrossCounts(fresh, size);
  const revisits = selectAcrossCounts(seen, size - preferred.length);
  return shuffledDojoWords([...preferred, ...revisits]);
}

function matchingDojoWords(words, settings) {
  return words.filter(item =>
    (settings.topic === 'all' || settings.topic === item.topic) &&
    (settings.difficulty === 'all' || settings.difficulty === item.difficulty) &&
    (settings.count === 'all' || Number(settings.count) === item.syllables.length));
}

function normalizeDojoSettings(data) {
  return {
    topic: Object.hasOwn(DOJO_TOPICS, data?.topic) ? data.topic : 'all',
    count: Object.hasOwn(DOJO_COUNTS, data?.count) ? String(data.count) : 'all',
    difficulty: Object.hasOwn(DOJO_DIFFICULTIES, data?.difficulty) ? data.difficulty : 'all',
    size: [6, 8, 10].includes(Number(data?.size)) ? Number(data.size) : 6,
    source: data?.source === 'gemini' ? 'gemini' : 'builtin'
  };
}

function readDojoList(key) {
  try {
    const value = JSON.parse(StorageManager.read(key));
    if (Array.isArray(value)) return value;
  } catch {
    // A malformed browser entry leaves the game usable.
  }
  return [];
}

function readDojoRecent() {
  return readDojoList(DOJO_RECENT_KEY).filter(word => typeof word === 'string' && DOJO_WORD_PATTERN.test(word)).slice(0, 120);
}

function rememberDojoWords(words) {
  const recent = [...new Set([...words.map(item => item.word), ...readDojoRecent()])].slice(0, 120);
  StorageManager.write(DOJO_RECENT_KEY, JSON.stringify(recent));
}

function normalizeGeminiWords(items, settings = DOJO_DEFAULT_SETTINGS) {
  if (!Array.isArray(items)) return [];
  const words = new Map();
  for (const item of items) {
    if (!item || typeof item.word !== 'string' || !DOJO_WORD_PATTERN.test(item.word)) continue;
    const { word, syllables, topic, difficulty } = item;
    const expected = DOJO_LOCAL_SYLLABLES.get(word);
    if (!expected || !Array.isArray(syllables) || syllables.length !== expected.length ||
        expected.some((part, index) => syllables[index] !== part) || words.has(word)) continue;
    if (!Object.hasOwn(DOJO_TOPICS, topic) || topic === 'all' ||
        !Object.hasOwn(DOJO_DIFFICULTIES, difficulty) || difficulty === 'all') continue;
    const meaning = typeof item.meaning === 'string' ? item.meaning.trim() : '';
    if (!meaning || meaning.length > 28 || !/^[\p{Script=Han}A-Za-z0-9（）()／、· \-]+$/u.test(meaning) ||
        !/\p{Script=Han}/u.test(meaning)) continue;
    const entry = { word, syllables: [...expected], meaning, topic, difficulty };
    const speech = item.speechSyllables;
    if (Array.isArray(speech) && speech.length === syllables.length &&
        speech.every(part => typeof part === 'string' && /^[a-z]{1,20}$/i.test(part))) {
      entry.speechSyllables = speech.map(part => part.toLowerCase());
    }
    words.set(word, entry);
  }
  return matchingDojoWords([...words.values()], settings);
}

function reviewedDojoWords() {
  return normalizeGeminiWords(readDojoList(DOJO_REVIEWED_KEY));
}

function saveReviewedDojoWords(items) {
  const words = normalizeGeminiWords([...items, ...reviewedDojoWords()]).slice(0, 240);
  StorageManager.write(DOJO_REVIEWED_KEY, JSON.stringify(words));
}

function buildDojoRound(settings, words) {
  const pool = settings.source === 'gemini'
    ? (words === undefined ? reviewedDojoWords() : normalizeGeminiWords(words))
    : (words ?? DOJO_BUILTIN_WORDS);
  const matches = matchingDojoWords(pool, settings);
  return {
    settings,
    words: sampleDojoWords(matches, settings.size, readDojoRecent(), settings.count === 'all')
  };
}
