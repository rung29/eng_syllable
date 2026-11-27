const FOREST_SHOP_ITEMS = {
  apple: { icon: '🍎', en: 'apple', zh: '蘋果' },
  banana: { icon: '🍌', en: 'banana', zh: '香蕉' },
  orange: { icon: '🍊', en: 'orange', zh: '柳橙' },
  pear: { icon: '🍐', en: 'pear', zh: '梨子' },
  grapes: { icon: '🍇', en: 'grapes', zh: '葡萄' },
  carrot: { icon: '🥕', en: 'carrot', zh: '胡蘿蔔' },
  sandwich: { icon: '🥪', en: 'sandwich', zh: '三明治' },
  bread: { icon: '🍞', en: 'bread', zh: '麵包' },
  milk: { icon: '🥛', en: 'milk', zh: '牛奶' },
  juice: { icon: '🧃', en: 'juice', zh: '果汁' },
  cheese: { icon: '🧀', en: 'cheese', zh: '起司' },
  egg: { icon: '🥚', en: 'egg', zh: '蛋' }
};

const FOREST_SHOP_ORDERS = [
  {
    story: '野餐要開始了！先幫我找水果。',
    instruction: 'Find an apple and a banana.',
    shelf: ['apple', 'banana', 'orange', 'pear', 'grapes', 'carrot'],
    needs: { apple: 1, banana: 1 },
    cue: '🍎 我有一顆蘋果。',
    sentenceConcept: 'article-an',
    sentenceVariant: 'an-apple',
    phrase: ['I', 'have', 'an', 'apple'],
    extra: 'a',
    hint: 'apple 的開頭是母音聲音，可以說 an apple。'
  },
  {
    story: '水果準備好了。接下來找午餐！',
    instruction: 'Get a sandwich and a glass of milk, please.',
    shelf: ['sandwich', 'bread', 'milk', 'juice', 'egg', 'cheese'],
    needs: { sandwich: 1, milk: 1 },
    cue: '🥪 我有一份三明治。',
    sentenceConcept: 'article-a',
    sentenceVariant: 'a-sandwich',
    phrase: ['I', 'have', 'a', 'sandwich'],
    extra: 'an',
    hint: 'sandwich 的開頭是子音聲音，可以說 a sandwich。'
  },
  {
    story: '再幫我準備一些野餐飲料。',
    instruction: 'Put an orange and a box of juice in the basket.',
    shelf: ['orange', 'juice', 'apple', 'banana', 'milk', 'sandwich'],
    needs: { orange: 1, juice: 1 },
    cue: '🧃 我有一些果汁。',
    sentenceConcept: 'some-food',
    sentenceVariant: 'some-juice',
    phrase: ['I', 'have', 'some', 'juice'],
    extra: 'a',
    hint: '要說「一些果汁」，可以用 some juice。'
  },
  {
    story: '最後一張訂單！仔細聽需要幾個。',
    instruction: 'Please find two eggs and a pear.',
    shelf: ['egg', 'pear', 'apple', 'carrot', 'cheese', 'grapes'],
    needs: { egg: 2, pear: 1 },
    cue: '🥚🥚 我有兩顆蛋。',
    sentenceConcept: 'plural-quantity',
    sentenceVariant: 'two-eggs',
    phrase: ['I', 'have', 'two', 'eggs'],
    extra: 'one',
    hint: 'two 表示兩個。蛋超過一顆時，這句用 eggs。'
  }
];

function shopNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function shopButton(className, label, action) {
  const button = shopNode('button', className, label);
  button.type = 'button';
  button.onclick = action;
  return button;
}

function shuffleShopCards(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function countShopItems(basket) {
  const counts = new Map();
  for (const key of basket) counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}

class ForestShop {
  constructor() {
    this.app = document.getElementById('shop-app');
    this.landing = document.getElementById('landing-screen');
    this.launchButton = document.getElementById('btn-start-shop');
    this.view = document.getElementById('shop-view');
    this.progress = document.getElementById('shop-progress');
    this.progressText = document.getElementById('shop-progress-text');
    this.hostMessage = document.getElementById('shop-host-message');
    this.launchButton.onclick = () => this.open();
    document.getElementById('btn-shop-home').onclick = () => this.close();
  }

  get order() {
    return FOREST_SHOP_ORDERS[this.orderIndex];
  }

  open() {
    if (window.landingController?.isTransitioning) return;
    const player = StorageManager.getActivePlayerName();
    const changedPlayer = this.playerName !== player;
    this.playerName = player;
    this.landing.hidden = true;
    this.app.hidden = false;
    window.scrollTo(0, 0);
    if (changedPlayer || !this.phase || this.phase === 'finished') this.startOrder(0);
    else this.view.querySelector('h2')?.focus({ preventScroll: true });
  }

  close() {
    window.soundEngine.cancelSpeech();
    this.app.hidden = true;
    this.landing.hidden = false;
    this.launchButton.focus();
  }

  updateProgress(completed) {
    this.progress.value = completed;
    this.progressText.textContent = this.phase === 'finished'
      ? `完成 ${completed} 份訂單`
      : `訂單 ${this.orderIndex + 1} / ${FOREST_SHOP_ORDERS.length}`;
  }

  showStage(heading, ...children) {
    const title = shopNode('h2', '', heading);
    title.tabIndex = -1;
    this.view.replaceChildren(title, ...children);
    title.focus();
  }

  makeFeedback() {
    this.feedback = shopNode('p', 'shop-feedback');
    this.feedback.setAttribute('role', 'status');
    return this.feedback;
  }

  setFeedback(text, retry = false) {
    this.feedback.classList.toggle('is-retry', retry);
    this.feedback.textContent = text;
  }

  startOrder(index) {
    window.soundEngine.cancelSpeech();
    if (index === FOREST_SHOP_ORDERS.length) {
      this.finish();
      return;
    }
    this.orderIndex = index;
    this.phase = 'shopping';
    this.heardOrder = false;
    this.basket = [];
    this.shoppingMistakes = new Set();
    this.sentenceMistakes = new Set();
    this.itemButtons = new Map();
    this.hostMessage.textContent = this.order.story;
    this.updateProgress(index);

    const instruction = shopNode('p', 'shop-note', '先聽英文指令，再點貨架上的食材。同一樣食材要兩份，就點兩次。');
    const actions = shopNode('div', 'shop-actions');
    const play = shopButton('practice-primary', '🔊 聽英文指令', () => this.playOrder());
    const textButton = shopButton('practice-home', '顯示英文指令', () => {
      if (this.transcript.hidden) this.revealInstruction();
      else {
        this.transcript.hidden = true;
        this.textButton.setAttribute('aria-expanded', 'false');
        this.textButton.textContent = '顯示英文指令';
      }
    });
    this.textButton = textButton;
    textButton.setAttribute('aria-controls', 'shop-transcript');
    textButton.setAttribute('aria-expanded', 'false');
    actions.append(play, textButton);

    this.transcript = shopNode('p', 'shop-transcript', this.order.instruction);
    this.transcript.id = 'shop-transcript';
    this.transcript.lang = 'en';
    this.transcript.hidden = true;

    const work = shopNode('div', 'shop-work-area');
    const shelf = shopNode('section', 'shop-shelf-section');
    const tiles = shopNode('div', 'shop-shelf');
    for (const key of shuffleShopCards(this.order.shelf)) {
      const item = FOREST_SHOP_ITEMS[key];
      const tile = shopButton('shop-item', '', () => this.addItem(key));
      tile.dataset.shopItem = key;
      const icon = shopNode('span', 'shop-item-icon', item.icon);
      icon.setAttribute('aria-hidden', 'true');
      const name = shopNode('span', '', item.en);
      name.lang = 'en';
      const count = shopNode('span', 'shop-item-count');
      count.hidden = true;
      count.setAttribute('aria-hidden', 'true');
      tile.append(icon, name, count);
      this.itemButtons.set(key, { tile, count });
      tiles.append(tile);
    }
    shelf.append(shopNode('h3', '', '商店貨架'), tiles);

    const basket = shopNode('section', 'shop-basket');
    this.basketNote = shopNode('p', 'shop-note');
    this.basketNote.setAttribute('role', 'status');
    this.basketList = shopNode('ul', 'shop-basket-list');
    const checkout = shopNode('div', 'shop-actions');
    this.checkout = shopButton('practice-primary', '送出購物籃', () => this.checkBasket());
    this.checkout.id = 'btn-shop-check-basket';
    checkout.append(this.checkout);
    basket.append(shopNode('h3', '', '購物籃'), this.basketNote, this.basketList, checkout);
    work.append(shelf, basket);
    this.showStage('聽指令，找食材', instruction, actions, this.transcript, this.makeFeedback(), work);
    this.updateBasket();
  }

  playOrder() {
    this.heardOrder = true;
    this.updateBasket();
    this.setFeedback('聽聽咪喵要哪些食材，再放進購物籃。');
    window.soundEngine.speakWord(this.order.instruction, .84, {
      onError: () => {
        this.revealInstruction();
        this.setFeedback('現在無法播放語音。可以讀英文指令，再挑選食材。');
      }
    });
  }

  revealInstruction() {
    this.heardOrder = true;
    this.transcript.hidden = false;
    this.textButton.setAttribute('aria-expanded', 'true');
    this.textButton.textContent = '收起英文指令';
    this.updateBasket();
  }

  addItem(key) {
    if (!this.heardOrder || this.phase !== 'shopping') return;
    if (this.basket.length >= 6) {
      this.setFeedback('購物籃放滿了。點籃子裡的食材就能拿出一個。', true);
      return;
    }
    this.basket.push(key);
    this.updateBasket();
  }

  removeItem(key) {
    const index = this.basket.indexOf(key);
    if (index < 0) return;
    this.basket.splice(index, 1);
    this.updateBasket();
    const nextRemove = this.basketList.querySelector(`[data-remove-item="${key}"]`);
    (nextRemove || this.itemButtons.get(key).tile).focus();
  }

  updateBasket() {
    const counts = countShopItems(this.basket);
    for (const [key, {tile, count}] of this.itemButtons) {
      const quantity = counts.get(key) || 0;
      tile.disabled = !this.heardOrder;
      count.hidden = quantity === 0;
      count.textContent = quantity;
      tile.setAttribute('aria-label', `放入${FOREST_SHOP_ITEMS[key].zh}，已放 ${quantity} 個`);
    }

    this.basketNote.textContent = this.basket.length ? `已放入 ${this.basket.length} 件。點食材可拿出。` : '籃子目前是空的。';
    this.basketList.replaceChildren(...Array.from(counts, ([key, quantity]) => {
      const item = FOREST_SHOP_ITEMS[key];
      const li = shopNode('li');
      const button = shopButton('shop-remove', `${item.icon} × ${quantity}`, () => this.removeItem(key));
      button.dataset.removeItem = key;
      button.setAttribute('aria-label', `拿出一個${item.zh}，目前有 ${quantity} 個`);
      li.append(button);
      return li;
    }));
    this.checkout.disabled = this.basket.length === 0;
  }

  checkBasket() {
    if (this.phase !== 'shopping' || !this.basket.length) return;
    const counts = countShopItems(this.basket);
    const required = Object.entries(this.order.needs);
    if (counts.size !== required.length || required.some(([key, quantity]) => counts.get(key) !== quantity)) {
      const countOnly = counts.size === required.length && required.every(([key]) => counts.has(key));
      const concept = countOnly ? 'shop-quantity' : 'shop-listening';
      if (!this.shoppingMistakes.has(concept)) {
        observeDailyPractice(this.playerName, concept, `shop-order-${this.orderIndex}`, true);
        this.shoppingMistakes.add(concept);
      }
      this.setFeedback('再聽一次英文指令，看看有沒有拿錯食材或數量。點籃子裡的食材可以拿出。', true);
      return;
    }
    const concept = required.some(([, quantity]) => quantity > 1) ? 'shop-quantity' : 'shop-listening';
    if (!this.shoppingMistakes.has(concept)) {
      observeDailyPractice(this.playerName, concept, `shop-order-${this.orderIndex}`, false);
    }
    this.startSentence();
  }

  startSentence() {
    window.soundEngine.cancelSpeech();
    this.phase = 'sentence';
    this.hostMessage.textContent = '食材都找到了！用一句英文告訴我你拿了什麼。';
    this.selected = [];
    this.wordBank = shuffleShopCards([...this.order.phrase, this.order.extra]);
    this.line = shopNode('div', 'shop-sentence-line');
    this.line.setAttribute('role', 'group');
    this.line.setAttribute('aria-label', '你拼出的句子');
    const bank = shopNode('div', 'shop-word-bank');
    bank.setAttribute('role', 'group');
    bank.setAttribute('aria-label', '英文字卡');
    this.wordButtons = this.wordBank.map((word, index) => {
      const card = shopButton('shop-token', word, () => this.addWord(index));
      card.lang = 'en';
      card.dataset.shopWord = word;
      bank.append(card);
      return card;
    });
    const actions = shopNode('div', 'shop-actions');
    this.checkSentenceButton = shopButton('practice-primary', '檢查句子', () => this.checkSentence());
    this.checkSentenceButton.id = 'btn-shop-check-sentence';
    actions.append(this.checkSentenceButton);
    this.showStage('把字卡拼成一句話',
      shopNode('p', 'shop-note', '依照中文意思，按順序點字卡。點上方已選的字可拿掉。'),
      shopNode('p', 'shop-sentence-cue', this.order.cue),
      this.line, bank, actions, this.makeFeedback());
    this.updateSentence();
  }

  addWord(index) {
    if (this.selected.includes(index) || this.selected.length >= this.order.phrase.length) return;
    this.selected.push(index);
    this.updateSentence();
    (this.wordButtons.find(card => !card.disabled) || this.checkSentenceButton).focus();
  }

  removeWord(position, index) {
    this.selected.splice(position, 1);
    this.updateSentence();
    this.wordButtons[index].focus();
  }

  updateSentence() {
    const full = this.selected.length === this.order.phrase.length;
    this.line.replaceChildren(...this.selected.map((index, position) => {
      const chip = shopButton('shop-token', this.wordBank[index], () => this.removeWord(position, index));
      chip.lang = 'en';
      return chip;
    }));
    for (let i = this.selected.length; i < this.order.phrase.length; i++) {
      const placeholder = shopNode('span', 'shop-sentence-placeholder');
      placeholder.setAttribute('aria-hidden', 'true');
      this.line.append(placeholder);
    }
    this.wordButtons.forEach((card, index) => { card.disabled = full || this.selected.includes(index); });
    this.checkSentenceButton.disabled = !full;
  }

  checkSentence() {
    if (this.phase !== 'sentence' || this.checkSentenceButton.disabled) return;
    if (!this.order.phrase.every((word, position) => this.wordBank[this.selected[position]] === word)) {
      const startsWithSubject = this.wordBank[this.selected[0]] === 'I' && this.wordBank[this.selected[1]] === 'have';
      const endsWithItem = this.wordBank[this.selected.at(-1)] === this.order.phrase.at(-1);
      const target = startsWithSubject && endsWithItem;
      const concept = target ? this.order.sentenceConcept : 'word-order';
      if (!this.sentenceMistakes.has(concept)) {
        observeDailyPractice(this.playerName, concept, this.order.sentenceVariant, true);
        this.sentenceMistakes.add(concept);
      }
      this.setFeedback(target ? this.order.hint : '先拼 I have，再把食材放在句子末尾。', true);
      return;
    }
    for (const concept of [this.order.sentenceConcept, 'word-order']) {
      if (!this.sentenceMistakes.has(concept)) {
        observeDailyPractice(this.playerName, concept, this.order.sentenceVariant, false);
      }
    }

    this.phase = 'confirmed';
    this.updateProgress(this.orderIndex + 1);
    this.hostMessage.textContent = '這份訂單完成了！';
    const english = this.order.phrase.join(' ') + '.';
    const sentence = shopNode('p', 'shop-transcript', english);
    sentence.lang = 'en';
    const actions = shopNode('div', 'shop-actions');
    const playSentence = () => window.soundEngine.speakWord(english, .85, {
      onError: () => this.setFeedback('現在無法播放語音。可以看著上方的英文句子念一次。')
    });
    const play = shopButton('practice-home', '🔊 重聽句子', playSentence);
    const next = shopButton('practice-primary',
      this.orderIndex + 1 === FOREST_SHOP_ORDERS.length ? '完成野餐採買' : '下一張訂單',
      () => this.startOrder(this.orderIndex + 1));
    next.id = 'btn-shop-next-order';
    actions.append(play, next);
    this.showStage('句子拼對了！', sentence, shopNode('p', 'shop-note', this.order.hint), actions, this.makeFeedback());
    playSentence();
  }

  finish() {
    this.phase = 'finished';
    this.updateProgress(FOREST_SHOP_ORDERS.length);
    this.hostMessage.textContent = '食材都備齊了，謝謝你！大家可以開始野餐了。';
    const recap = shopNode('ul', 'shop-result-sentences');
    for (const order of FOREST_SHOP_ORDERS) {
      const sentence = shopNode('li', '', order.phrase.join(' ') + '.');
      sentence.lang = 'en';
      recap.append(sentence);
    }
    const actions = shopNode('div', 'shop-actions');
    actions.append(shopButton('practice-primary', '再玩一次', () => this.startOrder(0)),
      shopButton('practice-home', '回到首頁', () => this.close()));
    this.showStage('🏅 野餐助手任務完成',
      shopNode('p', 'shop-note', '你完成了 4 份訂單，也拼出了 4 句英文。'), recap, actions);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.forestShop = new ForestShop();
});
