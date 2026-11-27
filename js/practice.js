const PRACTICE_MODES = {
  daily: '今天練 5 分鐘',
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
    for (const mode of Object.keys(PRACTICE_MODES).filter(mode => mode !== 'daily')) {
      const value = stored?.[mode];
      if (Number.isInteger(value) && value >= 1 && value <= 3) best[mode] = value;
    }
  } catch {
    // Practice also works when browser storage is unavailable.
  }
  return best;
}

class PracticeController {
  constructor(app, { conceptOnly = false } = {}) {
    this.landing = document.getElementById('landing-screen');
    this.app = app;
    this.view = app.querySelector('.practice-view');
    this.title = app.querySelector('h1');
    this.best = readPracticeBest();
    this.previousRounds = {};
    this.canSpeak = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

    if (conceptOnly) {
      app.querySelector('[data-concept-return]').onclick = () => this.goHome();
      return;
    }

    for (const button of document.querySelectorAll('[data-practice-mode]')) {
      button.addEventListener('click', () => this.open(button));
    }
    for (const button of app.querySelectorAll('[data-practice-home]')) {
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
    for (const mode of Object.keys(PRACTICE_MODES).filter(mode => mode !== 'daily')) {
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
    this.playerName = StorageManager.getActivePlayerName();
    this.homeFocus = button;
    this.title.textContent = PRACTICE_MODES[mode];
    this.landing.hidden = true;
    this.app.hidden = false;
    this.app.classList.toggle('is-daily', mode === 'daily');
    if (mode === 'daily') this.renderDailyOverview();
    else this.startRound();
  }

  openConcept(player, concept, recordsApp, onReturn) {
    const questions = buildConceptPracticeRound(player, concept);
    if (!questions.length) return;
    this.mode = 'concept';
    this.playerName = player;
    this.conceptPlan = { concept, questions };
    this.onConceptReturn = onReturn;
    recordsApp.hidden = true;
    this.app.hidden = false;
    this.startRound();
  }

  goHome() {
    this.stopSpeech();
    this.app.hidden = true;
    this.view.replaceChildren();
    if (this.mode === 'concept') {
      const onReturn = this.onConceptReturn;
      this.onConceptReturn = null;
      onReturn?.();
      return;
    }
    this.landing.hidden = false;
    this.homeFocus?.focus();
  }

  startRound() {
    try {
      if (this.mode === 'daily') this.questions = this.dailyPlan.questions;
      else if (this.mode === 'concept') this.questions = this.conceptPlan.questions;
      else this.questions = buildPracticeRound(this.mode, this.previousRounds[this.mode]);
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
    this.dailyReviewed = 0;
    this.renderQuestion();
  }

  renderDailyOverview() {
    this.dailyPlan = buildDailyReviewRound(this.playerName);
    const { due, next, doneToday, questions } = this.dailyPlan;
    const heading = practiceElement('h2', 'daily-heading', '今天的練習安排');
    heading.tabIndex = -1;
    const summary = practiceSummary([
      ['小勇士', this.playerName],
      ['今天到期', `${due.length} 個概念`],
      ['今天的進度', doneToday ? '已完成一回合' : '還沒開始']
    ]);
    let description = '今天沒有到期的概念，可以等到下次再複習。';
    if (due.length) description = '從到期的概念開始。這次會換單字或情境。';
    else if (questions.length) description = doneToday
      ? '今天已練完一回合。想多練一點，可以再做暖身題。'
      : '今天沒有到期的概念，先做幾題暖身。';
    const note = practiceElement('p', 'daily-note', description);
    const focus = practiceElement('ul', 'daily-focus-list');
    due.slice(0, 6).forEach(([key]) => focus.append(practiceElement('li', '', DAILY_CONCEPTS[key])));
    const actions = practiceElement('div', 'practice-actions');
    if (questions.length) {
      const start = practiceElement('button', 'practice-primary', `${doneToday ? '再練' : '開始練習'} · ${questions.length} 題`);
      start.type = 'button';
      start.onclick = () => this.startRound();
      actions.append(start);
    }
    actions.append(this.makeDailyRecordsButton());
    this.view.replaceChildren(heading, summary, note);
    if (due.length) this.view.append(focus);
    if (!due.length && next !== null) this.view.append(practiceElement('p', 'daily-note', `下一次複習是 ${dailyDateLabel(next)}。`));
    this.view.append(actions);
    heading.focus();
  }

  makeDailyRecordsButton() {
    const button = practiceElement('button', 'practice-secondary', '複習紀錄');
    button.type = 'button';
    button.onclick = () => window.dailyRecords.open(this.app, button, this.playerName);
    return button;
  }

  renderQuestion() {
    this.stopSpeech();
    this.wrongChoices = [];
    this.answered = false;
    this.hadHelp = false;
    this.question = this.questions[this.questionIndex];
    const { instruction, prompt, promptLang, context, icon, choices, optionLang, speakBefore, speakAfter, listeningTranscript } = this.question;

    const meta = practiceElement('div', 'practice-meta');
    this.score = practiceElement('span', '', `首次答對 ${this.firstCorrect} 題`);
    meta.append(practiceElement('span', '', `第 ${this.questionIndex + 1} / ${this.questions.length} 題`), this.score);

    this.progress = practiceElement('progress', 'practice-progress');
    this.progress.setAttribute('aria-label', '本回合進度');
    this.progress.max = this.questions.length;
    this.progress.value = this.questionIndex;

    const card = practiceElement('article', 'practice-question');
    const instructions = practiceElement('p', 'practice-instruction', instruction);
    instructions.id = `${this.app.id}-instruction`;
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
      translation.id = `${this.app.id}-context`;
      heading.setAttribute('aria-describedby', `${instructions.id} ${translation.id}`);
      card.append(translation);
    }

    this.speech = this.makeSpeechButton(speakBefore || speakAfter, {
      onPlay: () => this.enableListeningChoices(),
      onError: () => this.listeningText?.removeAttribute('hidden')
    });
    this.listeningText = null;
    if (this.speech) {
      this.speech.button.hidden = !speakBefore;
      if (listeningTranscript) this.speech.button.textContent = '🔊 聽英文指令';
      card.append(this.speech.button, this.speech.notice);
    }
    if (listeningTranscript) {
      this.listeningText = practiceElement('p', 'daily-listening', listeningTranscript);
      this.listeningText.lang = 'en';
      this.listeningText.hidden = Boolean(this.speech);
      if (this.speech) {
        const transcript = practiceElement('button', 'practice-home', '顯示英文指令');
        transcript.type = 'button';
        transcript.onclick = () => {
          this.listeningText.hidden = false;
          this.enableListeningChoices();
          transcript.hidden = true;
        };
        card.append(transcript);
      }
      card.append(this.listeningText);
    }

    const options = practiceElement('div', 'practice-options');
    options.setAttribute('role', 'group');
    options.setAttribute('aria-labelledby', instructions.id);
    this.optionButtons = choices.map(choice => {
      const button = practiceElement('button', 'practice-option', choice);
      button.type = 'button';
      button.lang = optionLang;
      button.disabled = Boolean(listeningTranscript && this.speech);
      button.classList.toggle('is-long-choice', choice.length > 13);
      button.addEventListener('click', () => this.answer(choice, button));
      options.append(button);
      return button;
    });
    const reviewLayout = this.mode === 'daily' || this.mode === 'concept';
    if (!reviewLayout) card.append(options);

    this.feedback = practiceElement('p', 'practice-feedback');
    this.feedback.setAttribute('role', 'status');
    this.feedback.setAttribute('aria-atomic', 'true');
    const actions = practiceElement('div', 'practice-actions');
    const lastQuestion = this.questionIndex + 1 === this.questions.length;
    this.next = practiceElement('button', 'practice-primary', lastQuestion ? '看結果' : '下一題');
    this.next.type = 'button';
    this.next.hidden = true;
    this.next.addEventListener('click', () => this.advance());
    this.helpButton = practiceElement('button', 'practice-secondary', '我卡住了');
    this.helpButton.type = 'button';
    this.helpButton.onclick = () => this.showHelp();
    actions.append(this.helpButton, this.next);
    this.view.replaceChildren(meta, this.progress);
    if (reviewLayout) {
      const kind = this.mode === 'concept' ? `小勇士 ${this.playerName}` : this.question.dueReview ? '到期複習' : '暖身題';
      this.view.append(practiceElement('p', 'daily-kind', kind),
        card, practiceElement('h3', 'daily-choice-title', '選擇答案'), options);
    } else {
      this.view.append(card);
    }
    this.view.append(this.feedback, actions);
    heading.focus();
  }

  enableListeningChoices() {
    if (!this.question?.listeningTranscript || this.answered) return;
    for (const option of this.optionButtons) option.disabled = this.wrongChoices.includes(option.textContent);
  }

  showHelp() {
    if (this.answered) return;
    if (!this.hadHelp && !this.wrongChoices.length) {
      observeDailyPractice(this.playerName, this.question.concept, this.question.id, true);
    }
    this.hadHelp = true;
    this.feedback.className = 'practice-feedback is-wrong';
    this.feedback.textContent = `提示。 ${this.question.hint}`;
  }

  answer(choice, button) {
    if (this.answered || this.wrongChoices.includes(choice)) return;

    if (choice !== this.question.answer) {
      if (!this.hadHelp && !this.wrongChoices.length) {
        observeDailyPractice(this.playerName, this.question.concept, this.question.id, true);
      }
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
    this.helpButton.hidden = true;
    button.classList.add('is-correct');
    for (const option of this.optionButtons) option.disabled = true;
    if (this.wrongChoices.length || this.hadHelp) {
      this.mistakes.push({ question: this.question, choices: this.wrongChoices });
    } else {
      const reviewed = observeDailyPractice(this.playerName, this.question.concept, this.question.id, false);
      if (reviewed && this.question.dueReview) this.dailyReviewed++;
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
    if (this.mode === 'concept') {
      this.renderConceptResult();
      return;
    }
    if (this.mode === 'daily') {
      this.renderDailyResult();
      return;
    }
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

  renderConceptResult() {
    const heading = practiceElement('h2', 'daily-heading', '概念練習完成！');
    heading.tabIndex = -1;
    const summary = practiceSummary([
      ['小勇士', this.playerName],
      ['練習概念', DAILY_CONCEPTS[this.conceptPlan.concept]],
      ['一次答對', `${this.firstCorrect} / ${this.questions.length} 題`]
    ]);
    const actions = practiceElement('div', 'practice-actions');
    const back = practiceElement('button', 'practice-primary', '回複習紀錄');
    back.type = 'button';
    back.onclick = () => this.goHome();
    actions.append(back);
    this.view.replaceChildren(heading, summary);
    if (this.mistakes.length) this.view.append(this.makeReview());
    this.view.append(actions);
    heading.focus();
  }

  renderDailyResult() {
    const review = readDailyReview(this.playerName);
    review.completedDay = dailyDay();
    saveDailyReview(this.playerName, review);
    const { due, next } = dailyOverview(this.playerName);
    const heading = practiceElement('h2', 'daily-heading', '今天的練習完成！');
    heading.tabIndex = -1;
    const summary = practiceSummary([
      ['這回合', `${this.questions.length} 題`],
      ['一次答對', `${this.firstCorrect} 題`],
      ['到期複習答對', `${this.dailyReviewed} 個概念`]
    ]);
    const help = new Set(this.mistakes.map(item => item.question.concept));
    this.view.replaceChildren(heading, summary);
    if (help.size) {
      const topics = [...help].map(key => DAILY_CONCEPTS[key]).join('、');
      this.view.append(practiceElement('p', 'daily-note', `過兩天會換題複習 ${topics}。`));
    }
    if (due.length) this.view.append(practiceElement('p', 'daily-note', `今天還有 ${due.length} 個到期概念。`));
    else if (next !== null) this.view.append(practiceElement('p', 'daily-note', `下一次複習是 ${dailyDateLabel(next)}。`));
    if (this.mistakes.length) this.view.append(this.makeReview());
    const actions = practiceElement('div', 'practice-actions');
    const home = practiceElement('button', 'practice-primary', '回到首頁');
    home.type = 'button';
    home.onclick = () => this.goHome();
    actions.append(home, this.makeDailyRecordsButton());
    if (due.length) {
      const more = practiceElement('button', 'practice-secondary', '繼續複習');
      more.type = 'button';
      more.onclick = () => this.renderDailyOverview();
      actions.append(more);
    }
    this.view.append(actions);
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
      if (choices.length) details.append('你選過 ', selected, '。');
      else details.append('你看過提示。');
      details.append('正確答案是 ', answer, `。${question.explanation}`);
      item.append(prompt, details);
      list.append(item);
    }
    review.append(practiceElement('h3', '', '再複習這幾題'), list);
    return review;
  }

  makeSpeechButton(text, { onPlay, onError } = {}) {
    if (!this.canSpeak || !text) return null;
    const button = practiceElement('button', 'practice-speak', '🔊 聽發音');
    button.type = 'button';
    const notice = practiceElement('p', 'practice-speech-notice');
    notice.setAttribute('role', 'status');
    button.addEventListener('click', () => {
      this.stopSpeech();
      onPlay?.();
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
        onError?.();
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

function practiceSummary(items) {
  const summary = practiceElement('dl', 'daily-summary');
  for (const [label, value] of items) {
    const item = practiceElement('div');
    item.append(practiceElement('dt', '', label), practiceElement('dd', '', value));
    summary.append(item);
  }
  return summary;
}

window.addEventListener('DOMContentLoaded', () => {
  window.practiceController = new PracticeController(document.getElementById('practice-app'));
  window.conceptPracticeController = new PracticeController(document.getElementById('concept-practice-app'), { conceptOnly: true });
});
