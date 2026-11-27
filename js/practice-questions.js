/* Question banks for short, untimed practice rounds. */

const PRACTICE_VOCABULARY = [
  { en: 'apple', zh: '蘋果', icon: '🍎', clue: '它是一種水果，開頭是 a。' },
  { en: 'banana', zh: '香蕉', icon: '🍌', clue: '它是一種水果，開頭是 b。' },
  { en: 'bread', zh: '麵包', icon: '🍞', clue: '它是一種食物，開頭是 br。' },
  { en: 'milk', zh: '牛奶', icon: '🥛', clue: '它是一種飲料，開頭是 m。' },
  { en: 'cat', zh: '貓', icon: '🐱', clue: '牠會喵喵叫，這個字開頭是 c。' },
  { en: 'dog', zh: '狗', icon: '🐶', clue: '牠會汪汪叫，這個字開頭是 d。' },
  { en: 'bird', zh: '鳥', icon: '🐦', clue: '牠有羽毛，這個字開頭是 b。' },
  { en: 'fish', zh: '魚', icon: '🐟', clue: '牠住在水裡，這個字開頭是 f。' },
  { en: 'book', zh: '書', icon: '📕', clue: '它有很多頁，開頭是 b。' },
  { en: 'pen', zh: '筆', icon: '🖊️', clue: '它可以拿來寫字，這個字只有三個字母。' },
  { en: 'bag', zh: '袋子', icon: '👜', clue: '它可以裝東西，開頭是 b。' },
  { en: 'chair', zh: '椅子', icon: '🪑', clue: '它可以讓你坐下，開頭是 ch。' },
  { en: 'sun', zh: '太陽', icon: '☀️', clue: '白天的天空會看到它，開頭是 s。' },
  { en: 'moon', zh: '月亮', icon: '🌙', clue: '晚上常會看到它，開頭是 m。' },
  { en: 'star', zh: '星星', icon: '⭐', clue: '它在夜空中閃閃發亮，開頭是 st。' },
  { en: 'tree', zh: '樹', icon: '🌳', clue: '它有樹幹和樹葉，最後是 ee。' }
];

const PRACTICE_SENTENCES = [
  {
    id: 'i-am-happy', group: 'be', template: 'I ___ happy.', zh: '我很開心。',
    choices: ['am', 'is', 'are'], answer: 'am', hint: '看看開頭的主詞 I。', explanation: 'I 和 am 搭配。'
  },
  {
    id: 'she-is-my-sister', group: 'be', template: 'She ___ my sister.', zh: '她是我的姊妹。',
    choices: ['am', 'is', 'are'], answer: 'is', hint: 'She 指的是一個人。', explanation: 'She 和 is 搭配。'
  },
  {
    id: 'we-are-friends', group: 'be', template: 'We ___ friends.', zh: '我們是朋友。',
    choices: ['am', 'is', 'are'], answer: 'are', hint: 'We 的意思是「我們」。', explanation: 'We 和 are 搭配。'
  },
  {
    id: 'he-is-ten', group: 'be', template: 'He ___ ten.', zh: '他十歲。',
    choices: ['am', 'is', 'are'], answer: 'is', hint: 'He 的意思是「他」。', explanation: 'He 和 is 搭配。'
  },
  {
    id: 'they-are-at-school', group: 'be', template: 'They ___ at school.', zh: '他們在學校。',
    choices: ['am', 'is', 'are'], answer: 'are', hint: 'They 的意思是「他們」。', explanation: 'They 和 are 搭配。'
  },
  {
    id: 'you-are-kind', group: 'be', template: 'You ___ kind.', zh: '你很親切。',
    choices: ['am', 'is', 'are'], answer: 'are', hint: 'You 的意思是「你」。', explanation: 'You 和 are 搭配。'
  },
  {
    id: 'an-apple', group: 'article', template: 'I see ___ apple.', zh: '我看到一顆蘋果。',
    choices: ['a', 'an'], answer: 'an', hint: '念念看 apple，聽聽第一個音。', explanation: 'apple 的開頭是母音，所以用 an。'
  },
  {
    id: 'a-dog', group: 'article', template: 'I see ___ dog.', zh: '我看到一隻狗。',
    choices: ['a', 'an'], answer: 'a', hint: '念念看 dog，聽聽開頭的 d 音。', explanation: 'dog 的開頭是子音，所以用 a。'
  },
  {
    id: 'an-egg', group: 'article', template: 'This is ___ egg.', zh: '這是一顆蛋。',
    choices: ['a', 'an'], answer: 'an', hint: '念念看 egg，聽聽第一個音。', explanation: 'egg 的開頭是母音，所以用 an。'
  },
  {
    id: 'a-book', group: 'article', template: 'This is ___ book.', zh: '這是一本書。',
    choices: ['a', 'an'], answer: 'a', hint: '念念看 book，聽聽開頭的 b 音。', explanation: 'book 的開頭是子音，所以用 a。'
  },
  {
    id: 'an-umbrella', group: 'article', template: 'I have ___ umbrella.', zh: '我有一把雨傘。',
    choices: ['a', 'an'], answer: 'an', hint: '念念看 umbrella，聽聽第一個音。', explanation: 'umbrella 的開頭是母音，所以用 an。'
  },
  {
    id: 'a-pen', group: 'article', template: 'I have ___ pen.', zh: '我有一支筆。',
    choices: ['a', 'an'], answer: 'a', hint: '念念看 pen，聽聽開頭的 p 音。', explanation: 'pen 的開頭是子音，所以用 a。'
  },
  {
    id: 'i-like-milk', group: 'meaning', zh: '我喜歡牛奶。', choices: ['I like milk.', 'I like apples.', 'I like cats.'],
    answer: 'I like milk.', hint: '找找看哪一句有「牛奶」這個字。', explanation: 'I like 表示「我喜歡」，milk 是「牛奶」。'
  },
  {
    id: 'i-have-a-book', group: 'meaning', zh: '我有一本書。', choices: ['I have a book.', 'I have a pen.', 'I have a bag.'],
    answer: 'I have a book.', hint: '找找看哪一句有「書」這個字。', explanation: 'I have 表示「我有」，a book 是「一本書」。'
  },
  {
    id: 'this-is-a-cat', group: 'meaning', zh: '這是一隻貓。', choices: ['This is a cat.', 'This is a dog.', 'This is a bird.'],
    answer: 'This is a cat.', hint: '找找看哪一句有「貓」這個字。', explanation: 'This is 表示「這是」，a cat 是「一隻貓」。'
  },
  {
    id: 'i-can-run', group: 'meaning', zh: '我會跑步。', choices: ['I can run.', 'I can jump.', 'I can swim.'],
    answer: 'I can run.', hint: '找找看哪一句有「跑步」這個字。', explanation: 'I can 表示「我會」，run 是「跑步」。'
  },
  {
    id: 'i-see-the-moon', group: 'meaning', zh: '我看見月亮。', choices: ['I see the moon.', 'I see the sun.', 'I see a bird.'],
    answer: 'I see the moon.', hint: '想想晚上天空中的「月亮」怎麼說。', explanation: 'I see 表示「我看見」，the moon 是「月亮」。'
  },
  {
    id: 'this-is-my-bag', group: 'meaning', zh: '這是我的袋子。', choices: ['This is my bag.', 'This is your bag.', 'This is my book.'],
    answer: 'This is my bag.', hint: '要找的是「我的」和「袋子」，兩個都要對。', explanation: 'my 是「我的」，bag 是「袋子」。'
  }
];

const PRACTICE_ALPHABET = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const PRACTICE_LETTER_GROUPS = ['BDPQ', 'CGOQ', 'EFHLIT', 'MNWVU', 'KXZY', 'GJIS', 'ARHP'];

function shufflePracticeItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

function selectPracticeItems(items, count, previousIds, getId) {
  const fresh = items.filter(item => !previousIds.includes(getId(item)));
  const repeated = items.filter(item => previousIds.includes(getId(item)));
  return [...shufflePracticeItems(fresh), ...shufflePracticeItems(repeated)].slice(0, count);
}

function makePracticeLetter(upper, index) {
  const towardUpper = index % 2 === 0;
  const lower = upper.toLowerCase();
  const similar = new Set(PRACTICE_LETTER_GROUPS.filter(group => group.includes(upper)).join(''));
  similar.delete(upper);
  const nearby = [...similar];
  const others = PRACTICE_ALPHABET.filter(letter => letter !== upper && !similar.has(letter));
  const alternatives = [...shufflePracticeItems(nearby), ...shufflePracticeItems(others)].slice(0, 2);
  const answer = towardUpper ? upper : lower;
  return {
    id: upper,
    concept: 'BDPQ'.includes(upper) ? 'letter-shapes' : 'letter-case',
    instruction: towardUpper ? '找出它的大寫字母。' : '找出它的小寫字母。',
    prompt: towardUpper ? lower : upper,
    promptLang: 'en',
    speakBefore: upper,
    optionLang: 'en',
    choices: [answer, ...alternatives.map(letter => towardUpper ? letter : letter.toLowerCase())],
    answer,
    hint: '試著念一下這個字母的名字，看看哪個選項的字母一樣。',
    explanation: `大寫 ${upper} 和小寫 ${lower} 是同一個字母。`
  };
}

function makePracticeWord(item, index) {
  const towardEnglish = index % 2 === 0;
  const wordKey = towardEnglish ? 'en' : 'zh';
  const groupStart = Math.floor(PRACTICE_VOCABULARY.indexOf(item) / 4) * 4;
  const similar = PRACTICE_VOCABULARY.slice(groupStart, groupStart + 4).filter(option => option !== item);
  return {
    id: item.en,
    concept: ['vocab-food', 'vocab-animals', 'vocab-school', 'vocab-nature'][groupStart / 4],
    instruction: towardEnglish ? '選出這個東西的英文。' : '選出這個英文單字的意思。',
    prompt: towardEnglish ? item.zh : item.en,
    promptLang: towardEnglish ? 'zh-TW' : 'en',
    icon: towardEnglish ? item.icon : null,
    speakBefore: towardEnglish ? null : item.en,
    speakAfter: item.en,
    optionLang: towardEnglish ? 'en' : 'zh-TW',
    choices: [item[wordKey], ...shufflePracticeItems(similar).slice(0, 2).map(option => option[wordKey])],
    answer: item[wordKey],
    hint: item.clue,
    explanation: `${item.en} 是「${item.zh}」。`
  };
}

function makePracticeSentence(item) {
  const completedPrompt = item.template?.replace('___', item.answer);
  return {
    id: item.id,
    concept: item.concept || (item.group === 'article' ? `article-${item.answer}`
      : item.group === 'be' ? `be-${item.answer}` : 'sentence-meaning'),
    instruction: item.template ? '選一個字，把句子補完整。' : '選出意思相同的英文句子。',
    prompt: item.template || item.zh,
    promptLang: item.template ? 'en' : 'zh-TW',
    context: item.template ? item.zh : null,
    completedPrompt,
    speakAfter: completedPrompt || item.answer,
    optionLang: 'en',
    choices: item.choices,
    answer: item.answer,
    hint: item.hint,
    explanation: item.explanation
  };
}

function buildPracticeRound(mode, previousIds = []) {
  let questions;
  if (mode === 'letters') {
    questions = selectPracticeItems(PRACTICE_ALPHABET, 6, previousIds, letter => letter).map(makePracticeLetter);
  } else if (mode === 'words') {
    questions = selectPracticeItems(PRACTICE_VOCABULARY, 6, previousIds, item => item.en).map(makePracticeWord);
  } else if (mode === 'sentences') {
    const items = ['be', 'article', 'meaning'].flatMap(group => {
      const groupItems = PRACTICE_SENTENCES.filter(item => item.group === group);
      return selectPracticeItems(groupItems, 2, previousIds, item => item.id);
    });
    questions = shufflePracticeItems(items).map(makePracticeSentence);
  } else {
    throw new RangeError(`Unknown practice mode: ${mode}`);
  }

  const validQuestions = questions.every(question => (
    question.id && question.prompt && question.instruction && question.hint && question.explanation
    && question.choices.length >= 2 && question.choices.includes(question.answer)
    && new Set(question.choices).size === question.choices.length
  ));
  if (!validQuestions || questions.length !== 6 || new Set(questions.map(question => question.id)).size !== 6) {
    throw new Error(`Invalid practice question set: ${mode}`);
  }
  return questions.map(question => ({ ...question, choices: shufflePracticeItems(question.choices) }));
}
