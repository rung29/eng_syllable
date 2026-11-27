const DAILY_CONCEPTS = {
  'letter-case': '字母大小寫',
  'letter-shapes': '容易看錯的 b、d、p、q',
  'vocab-food': '食物單字',
  'vocab-animals': '動物單字',
  'vocab-school': '日用品單字',
  'vocab-nature': '自然單字',
  'article-an': '母音開頭的冠詞',
  'article-a': '子音開頭的冠詞',
  'be-am': '用 I 說自己的狀態',
  'be-is': '單數主詞的句型',
  'be-are': 'you 或複數主詞的句型',
  'sentence-meaning': '理解短句',
  'word-order': '句子的字序',
  'shop-listening': '聽懂採買指令',
  'shop-quantity': '聽出數量',
  'some-food': '用 some 說「一些」',
  'plural-quantity': '數量與複數',
  'syllable-1': '辨認單音節',
  'syllable-2': '拆兩音節',
  'syllable-3': '拆三音節',
  'syllable-4': '拆四音節'
};

const DAILY_NEW_QUESTIONS = [
  { id: 'i-am-ready', concept: 'be-am', template: 'I ___ ready.', zh: '我準備好了。', choices: ['am', 'is', 'are'], answer: 'am', hint: '句子的主詞是 I。', explanation: 'I 和 am 搭配。' },
  { id: 'i-am-eight', concept: 'be-am', template: 'I ___ eight.', zh: '我八歲。', choices: ['am', 'is', 'are'], answer: 'am', hint: '看看句子的第一個字。', explanation: '說自己的年齡用 I am。' },
  { id: 'an-insect', concept: 'article-an', template: 'Look! It is ___ insect.', zh: '看！那是一隻昆蟲。', choices: ['a', 'an'], answer: 'an', hint: '聽一聽 insect 的第一個音。', explanation: 'insect 的開頭是母音聲音，用 an。' },
  { id: 'an-orange', concept: 'article-an', template: 'Please give me ___ orange.', zh: '請給我一顆柳橙。', choices: ['a', 'an'], answer: 'an', hint: '念念看 orange 的第一個音。', explanation: 'orange 的開頭是母音聲音，用 an。' },
  { id: 'a-sandwich', concept: 'article-a', template: 'Mimi has ___ sandwich.', zh: '咪喵有一份三明治。', choices: ['a', 'an'], answer: 'a', hint: '聽聽 sandwich 的 s 音。', explanation: 'sandwich 的開頭是子音聲音，用 a。' },
  { id: 'a-kite', concept: 'article-a', template: 'Let’s fly ___ kite.', zh: '我們來放風箏吧。', choices: ['a', 'an'], answer: 'a', hint: '聽聽 kite 的第一個音。', explanation: 'kite 的開頭是子音聲音，用 a。' },
  { id: 'some-milk', concept: 'some-food', template: 'I want ___ milk.', zh: '我想要一些牛奶。', choices: ['some', 'an', 'one'], answer: 'some', hint: '想想哪一個字表示「一些」。', explanation: 'some milk 表示「一些牛奶」。' },
  { id: 'some-water', concept: 'some-food', template: 'Can I have ___ water?', zh: '我可以喝一些水嗎？', choices: ['a', 'some', 'an'], answer: 'some', hint: '水可以說「一些」，你會用哪個字？', explanation: 'some water 表示「一些水」。' },
  { id: 'some-rice', concept: 'some-food', template: 'Please give me ___ rice.', zh: '請給我一些飯。', choices: ['one', 'a', 'some'], answer: 'some', hint: '這裡要說「一些」，不用數飯粒。', explanation: 'some rice 表示「一些飯」。' },
  { id: 'two-books', concept: 'plural-quantity', template: 'I have two ___.', zh: '我有兩本書。', choices: ['book', 'books'], answer: 'books', hint: 'two 表示兩個。', explanation: '兩本書要說 two books。' },
  { id: 'three-cats', concept: 'plural-quantity', template: 'I see three ___.', zh: '我看到三隻貓。', choices: ['cat', 'cats'], answer: 'cats', hint: '超過一隻要用複數。', explanation: '三隻貓要說 three cats。' },
  { id: 'two-cups', concept: 'plural-quantity', template: 'Please find two ___.', zh: '請找兩個杯子。', choices: ['cup', 'cups'], answer: 'cups', hint: '想想 cup 的複數。', explanation: '兩個杯子要說 two cups。' },
  { id: 'order-a-kite', concept: 'word-order', zh: '我有一個風箏。', choices: ['I have a kite.', 'Have I a kite.', 'I a kite have.'], answer: 'I have a kite.', hint: '「我有」先說 I have。', explanation: '先說主詞 I，再說 have a kite。' },
  { id: 'order-see-dog', concept: 'word-order', zh: '我看見一隻狗。', choices: ['I see a dog.', 'I a dog see.', 'See a dog I.'], answer: 'I see a dog.', hint: '先說「我看見」I see。', explanation: '先說主詞 I，再說 see a dog。' },
  { id: 'order-like-juice', concept: 'word-order', zh: '我喜歡果汁。', choices: ['I like juice.', 'Like I juice.', 'Juice like I.'], answer: 'I like juice.', hint: '先說「我喜歡」I like。', explanation: '先說主詞 I，再說 like juice。' }
];

const DAILY_LISTENING = [
  ['shop-listening', 'listen-bread-cheese', 'Please get bread and cheese.', ['🍞 麵包和起司', '🍞 麵包和牛奶', '🧀 起司和蘋果'], 'bread 是麵包，cheese 是起司。'],
  ['shop-listening', 'listen-pear-orange', 'Find a pear and an orange.', ['🍐 梨子和柳橙', '🍌 香蕉和柳橙', '🍐 梨子和蘋果'], 'pear 是梨子，orange 是柳橙。'],
  ['shop-listening', 'listen-milk-banana', 'Get a glass of milk and a banana.', ['🥛 牛奶和香蕉', '🧃 果汁和香蕉', '🥛 牛奶和蘋果'], 'milk 是牛奶，banana 是香蕉。'],
  ['shop-quantity', 'listen-two-apples', 'Put two apples in the basket.', ['2 顆蘋果', '1 顆蘋果', '3 顆蘋果'], 'two apples 是兩顆蘋果。'],
  ['shop-quantity', 'listen-three-carrots', 'Bring three carrots, please.', ['3 根胡蘿蔔', '2 根胡蘿蔔', '1 根胡蘿蔔'], 'three carrots 是三根胡蘿蔔。'],
  ['shop-quantity', 'listen-one-pear', 'Can I have one pear, please?', ['1 顆梨子', '2 顆梨子', '3 顆梨子'], 'one pear 是一顆梨子。']
];

const DAILY_RETRY_DAYS = 2;
const DAILY_GAP_DAYS = [3, 7, 14, 30];

function dailyDay(now = new Date()) {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
}

function dailyDateLabel(day) {
  return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(day * 86400000));
}

function readDailyReview(player) {
  const raw = StorageManager.getAllProfiles()[player]?.dailyReview;
  const entries = Object.create(null);
  for (const [key, info] of Object.entries(raw?.entries || {})) {
    if (Object.hasOwn(DAILY_CONCEPTS, key) && Number.isSafeInteger(info?.due) &&
        info.due >= 0 && info.due < 1000000 && Number.isInteger(info.step) &&
        info.step >= 0 && info.step < DAILY_GAP_DAYS.length && typeof info.variant === 'string') {
      entries[key] = { due: info.due, step: info.step, variant: info.variant };
    }
  }
  const recent = Array.isArray(raw?.recent) ? raw.recent.filter(id => typeof id === 'string').slice(0, 64) : [];
  return { entries, recent, completedDay: Number.isSafeInteger(raw?.completedDay) ? raw.completedDay : null };
}

function saveDailyReview(player, review) {
  const profile = StorageManager.getPlayerProfile(player);
  profile.dailyReview = review;
  const profiles = StorageManager.getAllProfiles();
  profiles[player] = profile;
  StorageManager.saveAllProfiles(profiles);
}

function observeDailyPractice(player, concept, variant, needsHelp, day = dailyDay()) {
  if (!Object.hasOwn(DAILY_CONCEPTS, concept) || typeof variant !== 'string') return false;
  const review = readDailyReview(player);
  const current = review.entries[concept];
  const id = `${concept}/${variant}`;
  review.recent = [id, ...review.recent.filter(item => item !== id)].slice(0, 64);
  let reviewed = false;
  if (needsHelp) {
    review.entries[concept] = { due: day + DAILY_RETRY_DAYS, step: 0, variant };
  } else if (current && current.due <= day && current.variant !== variant) {
    review.entries[concept] = {
      due: day + DAILY_GAP_DAYS[current.step],
      step: Math.min(current.step + 1, DAILY_GAP_DAYS.length - 1),
      variant
    };
    reviewed = true;
  }
  saveDailyReview(player, review);
  return reviewed;
}

function dailyOverview(player, day = dailyDay()) {
  const review = readDailyReview(player);
  const queued = Object.entries(review.entries).sort((a, b) => a[1].due - b[1].due);
  return {
    review,
    due: queued.filter(([, entry]) => entry.due <= day),
    next: queued.find(([, entry]) => entry.due > day)?.[1].due ?? null,
    doneToday: review.completedDay === day
  };
}

function dailySyllableQuestion(word) {
  const answer = word.syllables.join(' · ');
  const choices = new Set([answer, word.word]);
  if (word.syllables.length > 2) {
    choices.add([word.syllables[0] + word.syllables[1], ...word.syllables.slice(2)].join(' · '));
  }
  for (let cut = 1; cut < word.word.length && choices.size < 3; cut++) {
    choices.add(`${word.word.slice(0, cut)} · ${word.word.slice(cut)}`);
  }
  return {
    id: word.word, instruction: '聽完單字，選出正確的拆法。', prompt: word.word,
    promptLang: 'en', context: word.meaning, optionLang: 'en', choices: [...choices], answer,
    speakBefore: word.word, hint: '可以重聽，一邊念一邊拍手數音節。',
    explanation: `${word.word} 有 ${word.syllables.length} 個音節。拆法是 ${answer}。`
  };
}

function dailyVariants(concept) {
  if (concept.startsWith('syllable-')) {
    const count = Number(concept.at(-1));
    return DOJO_BUILTIN_WORDS.filter(word => word.syllables.length === count).map(dailySyllableQuestion);
  }
  if (concept.startsWith('letter-')) {
    return PRACTICE_ALPHABET.map((upper, index) => makePracticeLetter(upper, index)).filter(item => item.concept === concept);
  }
  if (concept.startsWith('vocab-')) {
    return PRACTICE_VOCABULARY.map(makePracticeWord).filter(item => item.concept === concept);
  }
  if (concept === 'shop-listening' || concept === 'shop-quantity') {
    return DAILY_LISTENING.filter(row => row[0] === concept).map(([, id, line, choices, explanation]) => ({
      id, instruction: '聽完指令，選出咪喵要的食材。', prompt: '咪喵的英文訂單',
      promptLang: 'zh-TW', optionLang: 'zh-TW', choices, answer: choices[0],
      speakBefore: line, listeningTranscript: line, hint: '再聽一次，留意食材名稱和數量。', explanation
    }));
  }
  return [...PRACTICE_SENTENCES, ...DAILY_NEW_QUESTIONS].map(makePracticeSentence).filter(item => item.concept === concept);
}

function dailyPickQuestion(concept, review, due) {
  const pool = dailyVariants(concept);
  const previous = review.entries[concept]?.variant;
  const previousIndex = pool.findIndex(item => item.id === previous);
  const rotated = due
    ? [...pool.slice(previousIndex + 1), ...pool.slice(0, previousIndex + 1)]
    : shufflePracticeItems(pool);
  const withoutLast = rotated.filter(item => item.id !== previous);
  const question = withoutLast.find(item => !review.recent.includes(`${concept}/${item.id}`)) ||
    withoutLast[0] || rotated[0];
  return question && { ...question, concept, dueReview: due, choices: shufflePracticeItems(question.choices) };
}

function buildDailyReviewRound(player, day = dailyDay()) {
  const overview = dailyOverview(player, day);
  const chosen = overview.due.slice(0, 6).map(([concept]) => dailyPickQuestion(concept, overview.review, true));
  const unused = Object.keys(DAILY_CONCEPTS).filter(key => !Object.hasOwn(overview.review.entries, key));
  const standard = shufflePracticeItems(unused);
  const usedGroups = new Set();
  const warmup = [];
  for (const concept of standard) {
    const group = concept.split('-')[0];
    if (usedGroups.has(group)) continue;
    usedGroups.add(group);
    warmup.push(concept);
  }
  warmup.push(...standard.filter(concept => !warmup.includes(concept)));
  chosen.push(...warmup.slice(0, 6 - chosen.length).map(concept => dailyPickQuestion(concept, overview.review, false)));
  return { ...overview, questions: chosen.filter(Boolean) };
}
