const PRACTICE_MODES = {
  letters: '字母配對',
  words: '生活單字',
  sentences: '基礎句型'
};
const PRACTICE_STORAGE_KEY = 'syllable_practice_best_v1';

function practiceElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

function readPracticeBest() {
  const best = {};
  try {
    const stored = JSON.parse(localStorage.getItem(PRACTICE_STORAGE_KEY));
    for (const mode of Object.keys(PRACTICE_MODES)) {
      const value = stored?.[mode];
      if (Number.isInteger(value) && value >= 1 && value <= 3) best[mode] = value;
    }
  } catch {
    // Practice also works when browser storage is unavailable.
  }
  return best;
}

class PracticeController {
  constructor() {
    this.landing = document.getElementById('landing-screen');
    this.app = document.getElementById('practice-app');
    this.view = document.getElementById('practice-view');
    this.title = document.getElementById('practice-title');
    this.best = readPracticeBest();
    this.previousRounds = {};
    this.canSpeak = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

    if (!this.landing || !this.app || !this.view || !this.title) return;

    for (const button of document.querySelectorAll('[data-practice-mode]')) {
      button.addEventListener('click', () => this.open(button));
    }
    for (const button of document.querySelectorAll('[data-practice-home]')) {
      button.addEventListener('click', () => this.goHome());
    }
    this.updateBestLabels();
  }

  updateBestLabels() {
    for (const label of document.querySelectorAll('[data-practice-best]')) {
      const stars = this.best[label.dataset.practiceBest];
      label.textContent = stars ? `本機最佳 ${stars} 顆星` : '尚未通關';
    }
  }

  recordBest(stars) {
    const stored = readPracticeBest();
    for (const mode of Object.keys(PRACTICE_MODES)) {
      this.best[mode] = Math.max(this.best[mode] || 0, stored[mode] || 0);
    }
    this.best[this.mode] = Math.max(stars, this.best[this.mode]);
    try {
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(this.best));
    } catch {
      // Keep this session's stars available in memory.
    }
    this.updateBestLabels();
  }

  open(button) {
    const mode = button.dataset.practiceMode;
    if (!Object.hasOwn(PRACTICE_MODES, mode) || window.landingController?.isTransitioning) return;

    this.mode = mode;
    this.homeFocus = button;
    this.title.textContent = PRACTICE_MODES[mode];
    this.landing.hidden = true;
    this.app.hidden = false;
    this.startRound();
  }

  goHome() {
    this.stopSpeech();
    this.app.hidden = true;
    this.landing.hidden = false;
    this.homeFocus?.focus();
    this.view.replaceChildren();
  }

  startRound() {
    try {
      this.questions = buildPracticeRound(this.mode, this.previousRounds[this.mode]);
    } catch (error) {
      console.error(error);
      const message = practiceElement('h2', 'practice-result-title', '這一組題目暫時無法開啟。');
      message.tabIndex = -1;
      this.view.replaceChildren(message);
      message.focus();
      return;
    }
    this.previousRounds[this.mode] = this.questions.map(question => question.id);
    this.questionIndex = 0;
    this.firstCorrect = 0;
    this.mistakes = [];
    this.renderQuestion();
  }

  renderQuestion() {
    this.stopSpeech();
    this.wrongChoices = [];
    this.answered = false;
    this.question = this.questions[this.questionIndex];
    const { instruction, prompt, promptLang, context, icon, choices, optionLang, speakBefore, speakAfter } = this.question;

    const meta = practiceElement('div', 'practice-meta');
    this.score = practiceElement('span', '', `首次答對 ${this.firstCorrect} 題`);
    meta.append(practiceElement('span', '', `第 ${this.questionIndex + 1} / ${this.questions.length} 題`), this.score);

    this.progress = practiceElement('progress', 'practice-progress');
    this.progress.setAttribute('aria-label', '本回合進度');
    this.progress.max = this.questions.length;
    this.progress.value = this.questionIndex;

    const card = practiceElement('article', 'practice-question');
    const instructions = practiceElement('p', 'practice-instruction', instruction);
    instructions.id = 'practice-instruction';
    const heading = practiceElement('h2', 'practice-prompt');
    heading.tabIndex = -1;
    heading.setAttribute('aria-describedby', instructions.id);
    if (icon) {
      const decoration = practiceElement('span', 'practice-prompt-icon', icon);
      decoration.setAttribute('aria-hidden', 'true');
      heading.append(decoration, ' ');
    }
    this.promptContent = practiceElement('span', '', prompt);
    this.promptContent.lang = promptLang;
    heading.append(this.promptContent);
    card.append(instructions, heading);
    if (context) {
      const translation = practiceElement('p', 'practice-context', context);
      translation.id = 'practice-context';
      heading.setAttribute('aria-describedby', `${instructions.id} ${translation.id}`);
      card.append(translation);
    }

    this.speech = this.makeSpeechButton(speakBefore || speakAfter);
    if (this.speech) {
      this.speech.button.hidden = !speakBefore;
      card.append(this.speech.button, this.speech.notice);
    }

    const options = practiceElement('div', 'practice-options');
    options.setAttribute('role', 'group');
    options.setAttribute('aria-labelledby', instructions.id);
    this.optionButtons = choices.map(choice => {
      const button = practiceElement('button', 'practice-option', choice);
      button.type = 'button';
      button.lang = optionLang;
      button.addEventListener('click', () => this.answer(choice, button));
      options.append(button);
      return button;
    });
    card.append(options);

    this.feedback = practiceElement('p', 'practice-feedback');
    this.feedback.setAttribute('role', 'status');
    this.feedback.setAttribute('aria-atomic', 'true');
    const actions = practiceElement('div', 'practice-actions');
    const lastQuestion = this.questionIndex + 1 === this.questions.length;
    this.next = practiceElement('button', 'practice-primary', lastQuestion ? '看結果' : '下一題');
    this.next.type = 'button';
    this.next.hidden = true;
    this.next.addEventListener('click', () => this.advance());
    actions.append(this.next);
    this.view.replaceChildren(meta, this.progress, card, this.feedback, actions);
    heading.focus();
  }

  answer(choice, button) {
    if (this.answered || this.wrongChoices.includes(choice)) return;

    if (choice !== this.question.answer) {
      this.wrongChoices.push(choice);
      button.classList.add('is-wrong');
      button.disabled = true;
      this.optionButtons.find(option => !option.disabled)?.focus();
      this.feedback.className = 'practice-feedback is-wrong';
      const encouragement = this.wrongChoices.length === 1 ? '再試一次！' : '再想想看！';
      this.feedback.textContent = `${encouragement}${this.question.hint}`;
      return;
    }

    this.answered = true;
    button.classList.add('is-correct');
    for (const option of this.optionButtons) option.disabled = true;
    if (this.wrongChoices.length) {
      this.mistakes.push({ question: this.question, choices: this.wrongChoices });
    } else {
      this.firstCorrect += 1;
      this.score.textContent = `首次答對 ${this.firstCorrect} 題`;
    }
    this.progress.value = this.questionIndex + 1;
    if (this.question.completedPrompt) this.promptContent.textContent = this.question.completedPrompt;
    if (this.speech) this.speech.button.hidden = false;
    this.next.hidden = false;
    this.next.focus();
    this.feedback.className = 'practice-feedback is-correct';
    this.feedback.textContent = `答對了！${this.question.explanation}`;
  }

  advance() {
    if (!this.answered) return;
    this.questionIndex += 1;
    if (this.questionIndex === this.questions.length) {
      this.renderResult();
    } else {
      this.renderQuestion();
    }
  }

  renderResult() {
    this.stopSpeech();
    const stars = this.firstCorrect === this.questions.length ? 3 : this.firstCorrect >= 4 ? 2 : 1;
    this.recordBest(stars);

    const result = practiceElement('section', 'practice-result');
    const heading = practiceElement('h2', 'practice-result-title', '闖關完成！');
    heading.tabIndex = -1;
    const starIcons = practiceElement('p', 'practice-stars', `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`);
    starIcons.setAttribute('aria-hidden', 'true');
    result.append(
      heading,
      starIcons,
      practiceElement('p', 'practice-result-score', `獲得 ${stars} 顆星，首次答對 ${this.firstCorrect} / ${this.questions.length} 題。`),
      practiceElement('p', 'practice-result-best', `本機最佳 ${this.best[this.mode]} 顆星`)
    );
    if (this.mistakes.length) result.append(this.makeReview());

    const actions = practiceElement('div', 'practice-actions');
    const replay = practiceElement('button', 'practice-primary', '再玩一次');
    replay.type = 'button';
    replay.addEventListener('click', () => this.startRound());
    const home = practiceElement('button', 'practice-secondary', '回到首頁');
    home.type = 'button';
    home.addEventListener('click', () => this.goHome());
    actions.append(replay, home);
    result.append(actions);
    this.view.replaceChildren(result);
    heading.focus();
  }

  makeReview() {
    const review = practiceElement('section', 'practice-review');
    const list = practiceElement('ul', 'practice-review-list');
    for (const { question, choices } of this.mistakes) {
      const item = practiceElement('li', '');
      const prompt = practiceElement('strong', '', question.prompt);
      prompt.lang = question.promptLang;
      const selected = practiceElement('span', '', choices.join('、'));
      selected.lang = question.optionLang;
      const answer = practiceElement('strong', '', question.answer);
      answer.lang = question.optionLang;
      const details = practiceElement('p', '');
      details.append('你選過 ', selected, '。正確答案是 ', answer, `。${question.explanation}`);
      item.append(prompt, details);
      list.append(item);
    }
    review.append(practiceElement('h3', '', '再複習這幾題'), list);
    return review;
  }

  makeSpeechButton(text) {
    if (!this.canSpeak || !text) return null;
    const button = practiceElement('button', 'practice-speak', '🔊 聽發音');
    button.type = 'button';
    const notice = practiceElement('p', 'practice-speech-notice');
    notice.setAttribute('role', 'status');
    button.addEventListener('click', () => {
      this.stopSpeech();
      notice.textContent = '';
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      this.utterance = utterance;
      utterance.onend = () => {
        if (this.utterance === utterance) this.utterance = null;
      };
      utterance.onerror = () => {
        if (this.utterance !== utterance) return;
        this.utterance = null;
        notice.textContent = '現在無法播放發音，可以繼續答題。';
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        utterance.onerror();
      }
    });
    return { button, notice };
  }

  stopSpeech() {
    if (!this.utterance) return;
    this.utterance = null;
    window.speechSynthesis.cancel();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.practiceController = new PracticeController();
});
