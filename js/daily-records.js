const DAILY_RECORDS_DATE = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
});

class DailyRecords {
  constructor() {
    this.app = document.getElementById('daily-records-app');
    this.title = document.getElementById('daily-records-title');
    this.player = document.getElementById('daily-records-player');
    this.view = document.getElementById('daily-records-view');
    this.player.addEventListener('change', () => this.render());
    document.getElementById('btn-exit-daily-records').onclick = () => this.close();
  }

  open(practiceApp, trigger, player) {
    this.returnView = practiceApp;
    this.returnButton = trigger;
    const names = Object.keys(StorageManager.getAllProfiles());
    if (!names.includes(player)) names.push(player);
    this.player.replaceChildren(...names.map(name => new Option(name, name)));
    this.player.value = player;
    practiceApp.hidden = true;
    this.app.hidden = false;
    this.render();
    this.title.focus();
  }

  close() {
    this.app.hidden = true;
    this.returnView.hidden = false;
    this.returnButton.focus();
  }

  render() {
    const day = dailyDay();
    const { review, due } = dailyOverview(this.player.value, day);
    const concepts = Object.entries(review.entries);
    const needsPractice = [];
    const mastered = [];
    for (const concept of concepts) {
      const section = concept[1].step >= DAILY_MASTERY_STREAK ? mastered : needsPractice;
      section.push(concept);
    }
    needsPractice.sort((a, b) => b[1].helpCount - a[1].helpCount || a[1].due - b[1].due);
    mastered.sort((a, b) => a[1].due - b[1].due);

    const summary = practiceSummary([
      ['已到期', `${due.length} 個`],
      ['複習中', `${needsPractice.length} 個`],
      ['已練熟', `${mastered.length} 個`]
    ]);
    this.view.replaceChildren(summary);
    if (!concepts.length) {
      this.view.append(practiceElement('p', 'daily-records-empty',
        '這位小勇士還沒有複習紀錄。答錯或按「我卡住了」後，就會在這裡看到複習安排。'));
      return;
    }
    this.view.append(
      this.makeSection('常卡住的概念', needsPractice, day, false),
      this.makeSection('已練熟的概念', mastered, day, true),
      practiceElement('p', 'daily-note daily-records-rule',
        '到期後換題，連續 3 次一次答對，就列為已練熟。之後仍會安排複習，再次卡住會回到複習中。')
    );
  }

  makeSection(title, concepts, day, mastered) {
    const section = practiceElement('section', 'daily-records-section');
    section.append(practiceElement('h2', '', title));
    if (!concepts.length) {
      section.append(practiceElement('p', 'daily-records-empty',
        mastered ? '還沒有概念達到練熟標準。' : '目前沒有需要加強的概念。'));
      return section;
    }

    const list = practiceElement('ul', 'daily-records-list');
    for (const [key, entry] of concepts) {
      const row = practiceElement('li', 'daily-records-row');
      row.dataset.reviewConcept = key;
      const concept = practiceElement('div', 'daily-records-concept');
      concept.append(practiceElement('h3', '', DAILY_CONCEPTS[key]));
      const count = `${entry.helpCountIsMinimum ? '至少 ' : ''}${entry.helpCount} 次`;
      concept.append(practiceElement('p', 'daily-note', `卡住記錄 ${count}`));
      const details = practiceElement('div', 'daily-records-details');
      const date = new Date(entry.due * 86400000);
      const time = practiceElement('time', '', DAILY_RECORDS_DATE.format(date));
      time.dateTime = date.toISOString().slice(0, 10);
      const schedule = practiceElement('p', 'daily-records-date');
      schedule.append('下次複習 ', time);
      const status = entry.due < day ? '已到期' : entry.due === day ? '今天可複習' : '已排定';
      const tag = practiceElement('span', entry.due <= day ? 'daily-records-tag is-due' : 'daily-records-tag', status);
      details.append(schedule, tag);
      if (!mastered) {
        details.append(practiceElement('p', 'daily-note',
          `換題一次答對 ${entry.step} / ${DAILY_MASTERY_STREAK}`));
      }
      row.append(concept, details);
      list.append(row);
    }
    section.append(list);
    return section;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.dailyRecords = new DailyRecords();
});
