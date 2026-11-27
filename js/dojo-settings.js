const DOJO_SETTINGS_KEY = 'eng_syllable.dojo_settings.v1';
const DOJO_API_KEY = 'eng_syllable.gemini_key.v1';
const DOJO_GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent';

function dojoStoredSettings() {
  try {
    return normalizeDojoSettings(JSON.parse(StorageManager.read(DOJO_SETTINGS_KEY)));
  } catch {
    return normalizeDojoSettings(null);
  }
}

async function requestGeminiDojoWords(settings, exclude, key, signal) {
  const topicChoices = Object.keys(DOJO_TOPICS).filter(topic => topic !== 'all');
  const difficultyChoices = Object.keys(DOJO_DIFFICULTIES).filter(level => level !== 'all');
  const prompt = [
    'Create a vocabulary practice word list for elementary school children in Taiwan learning US English.',
    'Return real single lowercase words (2–16 ASCII letters), with short accurate Traditional Chinese meanings.',
    'Use one standard American instructional spelling-based syllable division. Every group must be a consecutive nonempty substring and the groups must rejoin to exactly the original word.',
    'For speechSyllables, give one short Latin-letter sound-alike spelling per group for US English text-to-speech in isolation. Use no spaces, punctuation, or IPA. Example: for the written groups ti and ger in tiger, use tie and gurr.',
    'The number of groups must match the spoken syllable count. Avoid ambiguous or dialect-dependent counts, names, abbreviations, hyphens, and adult or unsafe words.',
    'Generate different initial letters, lengths, and cut positions. easy means common words for beginners, medium means familiar words with more difficult spelling, hard means less common or structurally harder age-appropriate words.',
    `Topics: ${topicChoices.map(topic => topic + '=' + DOJO_TOPICS[topic]).join(', ')}.`,
    `Topic: ${settings.topic}. Difficulty: ${settings.difficulty}. Syllables: ${settings.count === 'all' ? 'mix 1–4 counts' : settings.count}.`,
    `Return up to ${settings.size} unique entries. Return fewer when needed for accuracy. Avoid these recently shown words: ${exclude.join(', ')}.`
  ].join('\n');

  const response = await fetch(DOJO_GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    redirect: 'error',
    cache: 'no-store',
    signal,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 4000,
        thinkingConfig: { thinkingLevel: 'LOW' },
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          required: ['words'],
          properties: {
            words: {
              type: 'array',
              maxItems: settings.size,
              items: {
                type: 'object',
                required: ['word', 'syllables', 'speechSyllables', 'meaning', 'topic', 'difficulty'],
                properties: {
                  word: { type: 'string' },
                  syllables: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
                  speechSyllables: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
                  meaning: { type: 'string' },
                  topic: { type: 'string', enum: topicChoices },
                  difficulty: { type: 'string', enum: difficultyChoices }
                }
              }
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const messages = {
      400: 'Gemini 無法接受這次請求。可確認金鑰，或先使用內建題庫。',
      401: 'Gemini 金鑰無法使用，請檢查或更換金鑰。',
      403: 'Gemini 拒絕存取。請確認金鑰授權及網站限制。',
      429: 'Gemini 額度目前不足。請稍後重試，或改用內建題庫。'
    };
    throw new Error(messages[response.status] || 'Gemini 目前無法產題。可稍後重試或使用內建題庫。');
  }

  const payload = await response.json();
  const candidate = payload.candidates?.[0];
  const text = candidate?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Gemini 沒有回傳完整題目。請再試一次，或改用內建題庫。');
  }
  const banned = new Set(exclude);
  return normalizeGeminiWords(parsed?.words, settings).filter(item => !banned.has(item.word)).slice(0, settings.size);
}

class DojoSettingsController {
  constructor() {
    this.dialog = document.getElementById('dojo-settings');
    this.form = document.getElementById('dojo-settings-form');
    this.status = document.getElementById('dojo-settings-status');
    this.key = document.getElementById('dojo-gemini-key');
    this.keyStatus = document.getElementById('dojo-key-status');
    this.review = document.getElementById('dojo-review');
    this.reviewList = document.getElementById('dojo-review-list');
    this.prepareButton = document.getElementById('btn-prepare-dojo');
    this.savedButton = document.getElementById('btn-use-dojo-saved');
    this.previewExclusions = [];

    for (const [name, choices] of Object.entries({
      topic: DOJO_TOPICS, count: { ...DOJO_COUNTS }, difficulty: DOJO_DIFFICULTIES
    })) {
      const values = Object.keys(choices);
      if (values.includes('all')) values.sort((first, second) => Number(second === 'all') - Number(first === 'all'));
      for (const value of values) this.form.elements.namedItem(name).add(new Option(choices[value], value));
    }

    document.querySelectorAll('[data-open-dojo-settings]').forEach(button => {
      button.addEventListener('click', () => this.open());
    });
    document.getElementById('btn-close-dojo-settings').onclick = () => this.close();
    document.getElementById('btn-save-dojo-key').onclick = () => this.saveKey();
    document.getElementById('btn-clear-dojo-key').onclick = () => this.clearKey();
    document.getElementById('btn-use-dojo-review').onclick = () => this.useReview();
    this.savedButton.onclick = () => this.launch(buildDojoRound(this.settings()));
    document.getElementById('btn-return-dojo-belts').onclick = () => this.returnToBelts();

    this.form.addEventListener('change', event => {
      if (event.target.tagName !== 'SELECT') return;
      StorageManager.write(DOJO_SETTINGS_KEY, JSON.stringify(this.settings()));
      this.cancelRequest();
      this.clearPreview();
      this.render();
    });
    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.prepare();
    });
    this.dialog.addEventListener('cancel', event => {
      event.preventDefault();
      this.close();
    });
  }

  getGame() {
    const game = window.syllableGame;
    return game && !game.isDestroyed ? game : null;
  }

  settings() {
    return normalizeDojoSettings(Object.fromEntries(new FormData(this.form)));
  }

  open() {
    if (this.dialog.open || window.landingController?.isTransitioning) return;
    const saved = dojoStoredSettings();
    for (const [name, value] of Object.entries(saved)) this.form.elements.namedItem(name).value = value;
    this.key.value = '';
    this.keyStatus.textContent = '';
    this.clearPreview();
    this.render();
    this.dialog.showModal();
    this.form.elements.topic.focus();
  }

  close() {
    this.cancelRequest();
    this.key.value = '';
    this.clearPreview();
    this.dialog.close();
  }

  cancelRequest() {
    this.request?.abort();
    this.request = null;
  }

  clearPreview() {
    this.preview = [];
    this.review.hidden = true;
    this.reviewList.replaceChildren();
  }

  render() {
    const settings = this.settings();
    const usesGemini = settings.source === 'gemini';
    document.getElementById('dojo-gemini-options').hidden = !usesGemini;
    const storedKey = StorageManager.read(DOJO_API_KEY);
    this.key.placeholder = storedKey ? '此瀏覽器已保存金鑰' : '在這裡輸入 Gemini 金鑰';
    this.savedButton.hidden = !usesGemini || matchingDojoWords(reviewedDojoWords(), settings).length === 0;
    this.prepareButton.disabled = Boolean(this.request);
    this.prepareButton.textContent = usesGemini ? '產生 Gemini 題目' : '抽題開始';
    document.getElementById('btn-return-dojo-belts').hidden =
      !this.getGame()?.practiceRound && !window.landingController.nextDojoRound;
    if (usesGemini) {
      this.status.textContent = '產生後可先確認拆法，再保存到本機題庫。';
    } else {
      const count = matchingDojoWords(DOJO_BUILTIN_WORDS, settings).length;
      this.status.textContent = count
        ? `符合條件的內建單字有 ${count} 個，本回合出 ${Math.min(settings.size, count)} 題。`
        : '目前沒有符合的內建單字，可放寬範圍、音節數或難度。';
      if (!count) this.prepareButton.disabled = true;
    }
  }

  saveKey() {
    const value = this.key.value.trim();
    if (!/^[A-Za-z0-9_-]{20,160}$/.test(value)) {
      this.keyStatus.textContent = '請輸入完整的 Gemini API 金鑰。';
      this.key.focus();
      return;
    }
    this.cancelRequest();
    this.clearPreview();
    StorageManager.write(DOJO_API_KEY, value);
    this.key.value = '';
    this.render();
    this.keyStatus.textContent = StorageManager.unsavedKeys.has(DOJO_API_KEY)
      ? '這個瀏覽器無法持久保存金鑰。本次開啟的頁面仍可產題。'
      : '已存於這個瀏覽器。';
  }

  clearKey() {
    this.cancelRequest();
    this.clearPreview();
    StorageManager.write(DOJO_API_KEY, '');
    this.key.value = '';
    this.render();
    this.keyStatus.textContent = '已清除金鑰。已審閱的題目仍可使用。';
  }

  async prepare() {
    const settings = this.settings();
    if (settings.source === 'builtin') {
      this.launch(buildDojoRound(settings));
      return;
    }
    if (this.request) return;

    const key = StorageManager.read(DOJO_API_KEY);
    if (!key || this.key.value.trim()) {
      this.keyStatus.textContent = '請先儲存這個瀏覽器要使用的金鑰。';
      this.key.focus();
      return;
    }

    const excluded = [...new Set([...this.previewExclusions, ...readDojoRecent()])].slice(0, 45);
    const controller = new AbortController();
    this.request = controller;
    const deadline = setTimeout(() => controller.abort(), 40000);
    this.clearPreview();
    this.prepareButton.disabled = true;
    this.status.textContent = 'Gemini 正在產題，請稍等。';

    try {
      const words = await requestGeminiDojoWords(settings, excluded, key, controller.signal);
      if (this.request !== controller) return;
      if (words.length === 0) {
        this.status.textContent = '這次沒有符合條件的新題目。可再產生一次或調整條件。';
        return;
      }
      this.previewExclusions = [...words.map(item => item.word), ...this.previewExclusions].slice(0, 45);
      this.showReview(words);
    } catch (error) {
      if (this.request !== controller) return;
      this.status.textContent = error.name === 'AbortError'
        ? '這次產題逾時。請重試，或先使用內建題庫。'
        : error instanceof TypeError || error instanceof SyntaxError
          ? '無法連到 Gemini 或讀取回應。請確認連線，或改用內建題庫。'
          : error.message;
    } finally {
      clearTimeout(deadline);
      if (this.request === controller) {
        this.request = null;
        this.prepareButton.disabled = false;
        if (this.preview.length) this.prepareButton.textContent = '重新產生題目';
      }
    }
  }

  showReview(words) {
    this.preview = words;
    const checkboxes = words.map(item => {
      const label = document.createElement('label');
      label.className = 'dojo-review-option';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const split = document.createElement('span');
      split.lang = 'en';
      split.textContent = item.syllables.join(' · ');
      label.append(checkbox, split, document.createTextNode(item.meaning));
      return label;
    });
    this.reviewList.replaceChildren(...checkboxes);
    this.review.hidden = false;
    this.status.textContent = `這次產生 ${words.length} 題可審閱的單字。`;
    this.reviewList.querySelector('input')?.focus();
  }

  useReview() {
    const choices = this.reviewList.querySelectorAll('input');
    const selected = this.preview.filter((word, index) => choices[index].checked);
    if (!selected.length) {
      this.status.textContent = '請勾選至少一道題目。';
      return;
    }
    saveReviewedDojoWords(selected);
    this.launch(buildDojoRound(this.settings(), selected));
  }

  launch(round) {
    if (!round.words.length) {
      this.status.textContent = '目前沒有符合條件的題目。';
      return;
    }
    this.close();
    const game = this.getGame();
    if (game) {
      game.loadPractice(round);
    } else {
      window.landingController.nextDojoRound = round;
      document.getElementById('dojo-prepared-notice').textContent = `已準備 ${round.words.length} 題。選一位夥伴開始！`;
      document.getElementById('dojo-characters-title').focus();
    }
  }

  returnToBelts() {
    this.close();
    window.landingController.nextDojoRound = null;
    document.getElementById('dojo-prepared-notice').textContent = '';
    const game = this.getGame();
    if (game) {
      game.loadLevel(game.currentLevelIndex);
      game.focusFirstCut();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.dojoSettings = new DojoSettingsController();
});
