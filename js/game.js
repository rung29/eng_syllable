/**
 * Syllable Dojo - 核心遊戲邏輯控制器
 * 整合入口頁面角色選擇、主題切換、玩家姓名存檔與榮譽排行榜功能
 */

/* ============================================================ */
/* 入口頁面 / 角色選擇控制器 (Landing Controller)                */
/* ============================================================ */
class LandingController {
  constructor() {
    this.landingScreen = document.getElementById('landing-screen');
    this.gameApp = document.getElementById('game-app');
    this.particlesContainer = document.getElementById('landing-particles');
    this.playerSelect = document.getElementById('player-select-dropdown');
    this.inputWrap = document.getElementById('new-player-input-wrap');
    this.nameInput = document.getElementById('player-name-input');
    this.btnConfirmNew = document.getElementById('btn-confirm-new-player');
    this.btnCancelNew = document.getElementById('btn-cancel-new-player');
    this.playerLabel = document.getElementById('player-bar-label');
    this.leaderboardModal = document.getElementById('leaderboard-modal');

    // 確保遊戲頁面在尚未選好角色前絕對不顯示
    if (this.gameApp) {
      this.gameApp.style.display = 'none';
      this.gameApp.classList.add('hidden');
    }

    this.initPlayerSelector();
    this.renderPreviewCharacters();
    this.spawnParticles();
    this.bindCardEvents();
    this.bindLeaderboardEvents();
  }

  /**
   * 初始化小勇士名稱選擇器
   * 預設僅顯示下拉選單，只有在選擇「➕ 新增小勇士...」時才切換顯示輸入框
   */
  initPlayerSelector() {
    this.showDropdownMode();

    if (this.playerSelect) {
      this.playerSelect.addEventListener('change', () => {
        const option = this.playerSelect.selectedOptions[0];
        if (option?.dataset.newPlayer === 'true') {
          this.showInputMode();
        } else if (option) {
          StorageManager.setActivePlayerName(option.value);
          if (window.soundEngine) window.soundEngine.playHoverTick();
        }
      });
    }

    // 確定新增小勇士按鈕
    if (this.btnConfirmNew) {
      this.btnConfirmNew.addEventListener('click', () => {
        this.submitNewPlayer();
      });
    }

    // 取消新增按鈕
    if (this.btnCancelNew) {
      this.btnCancelNew.addEventListener('click', () => {
        this.cancelNewPlayer();
      });
    }

    // 輸入框按 Enter 確定、Esc 取消
    if (this.nameInput) {
      this.nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitNewPlayer();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelNewPlayer();
        }
      });
    }
  }

  /**
   * 切換為下拉選單模式（隱藏輸入框）
   */
  showDropdownMode(selectedName) {
    if (this.playerSelect) this.playerSelect.style.display = 'inline-block';
    if (this.inputWrap) this.inputWrap.style.display = 'none';
    if (this.playerLabel) {
      this.playerLabel.textContent = '小勇士';
      this.playerLabel.htmlFor = this.playerSelect.id;
    }
    this.refreshPlayerDropdown(selectedName);
  }

  /**
   * 切換為輸入框模式（隱藏選單，展開輸入框與確認/取消按鈕）
   */
  showInputMode() {
    if (this.playerSelect) this.playerSelect.style.display = 'none';
    if (this.inputWrap) this.inputWrap.style.display = 'inline-flex';
    if (this.playerLabel) {
      this.playerLabel.textContent = '新名字';
      this.playerLabel.htmlFor = this.nameInput.id;
    }
    if (this.nameInput) {
      this.nameInput.value = '';
      this.nameInput.placeholder = '請輸入新勇士名字...';
      this.nameInput.focus();
    }
    if (window.soundEngine) window.soundEngine.playHoverTick();
  }

  /**
   * 提交新增的小勇士名字
   */
  submitNewPlayer() {
    const val = (this.nameInput ? this.nameInput.value : '').trim();
    if (!val) {
      this.cancelNewPlayer();
      return;
    }

    // 存檔並設為當前玩家
    StorageManager.setActivePlayerName(val);
    this.showDropdownMode(val);
    this.playerSelect.focus();

    if (window.soundEngine) {
      window.soundEngine.ensureContext();
      window.soundEngine.playSuccessChime();
    }
  }

  /**
   * 取消新增，恢復原本選中的小勇士
   */
  cancelNewPlayer() {
    const prev = StorageManager.getActivePlayerName();
    this.showDropdownMode(prev);
    this.playerSelect.focus();
    if (window.soundEngine) window.soundEngine.playHoverTick();
  }

  /**
   * 刷新小勇士下拉選單內容
   */
  refreshPlayerDropdown(selectedName) {
    if (!this.playerSelect) return;
    this.playerSelect.innerHTML = '';

    const profiles = StorageManager.getAllProfiles();
    let names = Object.keys(profiles);
    const activeName = selectedName || StorageManager.getActivePlayerName();

    // 若尚無任何存檔，預設建立並加入「小勇士」
    if (names.length === 0) {
      StorageManager.getPlayerProfile('小勇士');
      names = ['小勇士'];
    }

    // 將所有玩家列入選單
    names.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      const p = profiles[name] || {};
      const beltBadge = typeof p.highestBeltBadge === 'string' ? p.highestBeltBadge.split(' ')[0] : '🥋';
      const score = p.totalScore ? `${p.totalScore}題` : '0題';
      opt.textContent = `${name} (${beltBadge} ${score})`;
      if (name === activeName) {
        opt.selected = true;
      }
      this.playerSelect.appendChild(opt);
    });

    // 加上「新增其他小勇士」選項
    const newOpt = document.createElement('option');
    newOpt.dataset.newPlayer = 'true';
    newOpt.textContent = '➕ 新增小勇士...';
    this.playerSelect.appendChild(newOpt);
  }

  renderPreviewCharacters() {
    document.querySelectorAll('.char-card[data-theme]').forEach(card => {
      const preview = card.querySelector('.char-preview');
      if (preview) MascotFactory.create(card.dataset.theme, preview.id);
    });
  }

  /**
   * 生成入口頁面夢幻飄落粒子
   */
  spawnParticles() {
    if (!this.particlesContainer) return;
    const colors = ['#FFD54F', '#FF80AB', '#80DEEA', '#CE93D8', '#FFB74D', '#A5D6A7'];
    for (let i = 0; i < 35; i++) {
      const p = document.createElement('div');
      p.className = 'landing-particle';
      const size = 4 + Math.random() * 8;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = `${5 + Math.random() * 10}s`;
      p.style.animationDelay = `${Math.random() * 6}s`;
      this.particlesContainer.appendChild(p);
    }
  }

  /**
   * 綁定角色卡片點擊事件
   */
  bindCardEvents() {
    const cards = document.querySelectorAll('.char-card');
    cards.forEach(card => {
      const theme = card.dataset.theme;
      
      card.addEventListener('click', () => {
        this.selectCharacter(theme);
      });

      card.addEventListener('keydown', (e) => {
        if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          this.selectCharacter(theme);
        }
      });
    });
  }

  /**
   * 綁定排行榜按鈕與彈窗操作
   */
  bindLeaderboardEvents() {
    // 首頁排行榜按鈕
    const btnLandingBoard = document.getElementById('btn-landing-leaderboard');
    if (btnLandingBoard) {
      btnLandingBoard.addEventListener('click', () => {
        this.openLeaderboard();
      });
    }

    // 遊戲內排行榜按鈕
    const btnGameBoard = document.getElementById('btn-game-leaderboard');
    if (btnGameBoard) {
      btnGameBoard.addEventListener('click', () => {
        this.openLeaderboard();
      });
    }

    // 關閉排行榜彈窗
    const btnCloseBoard = document.getElementById('btn-close-leaderboard');
    if (btnCloseBoard) {
      btnCloseBoard.addEventListener('click', () => {
        this.closeLeaderboard();
      });
    }

    // 點擊遮罩關閉
    if (this.leaderboardModal) {
      this.leaderboardModal.addEventListener('click', (e) => {
        if (e.target === this.leaderboardModal) {
          this.closeLeaderboard();
        }
      });
      this.leaderboardModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closeLeaderboard();
        }
      });
    }

    // 清空歷史紀錄按鈕
    const btnClear = document.getElementById('btn-clear-records');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('確定要清除所有排行榜與歷年修煉紀錄嗎？此動作無法復原喔！')) {
          StorageManager.clearAllData();
          this.showDropdownMode();
          if (!this.gameApp.classList.contains('hidden')) {
            window.syllableGame?.switchPlayer(StorageManager.getActivePlayerName());
          }
          this.renderLeaderboardTable();
        }
      });
    }
  }

  openLeaderboard() {
    if (!this.leaderboardModal) return;
    this.leaderboardOpener = document.activeElement;
    this.landingScreen.inert = true;
    this.gameApp.inert = true;
    this.renderLeaderboardTable();
    this.leaderboardModal.classList.add('show');
    document.getElementById('btn-close-leaderboard').focus();
    if (window.soundEngine) window.soundEngine.playHoverTick();
  }

  closeLeaderboard() {
    if (!this.leaderboardModal) return;
    this.leaderboardModal.classList.remove('show');
    this.landingScreen.inert = false;
    this.gameApp.inert = false;
    this.leaderboardOpener?.focus();
  }

  renderLeaderboardTable() {
    const tbody = document.getElementById('leaderboard-tbody');
    const emptyNotice = document.getElementById('leaderboard-empty');
    if (!tbody) return;

    tbody.innerHTML = '';
    const list = StorageManager.getLeaderboard();

    if (!list || list.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'block';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';

    const currentActiveName = StorageManager.getActivePlayerName();

    const getHeroBadge = (hero) => {
      if (hero === 'sushi') return '🍣 咪喵';
      if (hero === 'magic') return '✨ 露露';
      if (hero === 'brawl') return '⚾ 嗶嗶';
      return '🥋 波比';
    };

    const getRankDisplay = (idx) => {
      if (idx === 0) return '<span class="leaderboard-rank-1">🥇 第 1 名</span>';
      if (idx === 1) return '<span class="leaderboard-rank-2">🥈 第 2 名</span>';
      if (idx === 2) return '<span class="leaderboard-rank-3">🥉 第 3 名</span>';
      return `第 ${idx + 1} 名`;
    };

    list.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      const isCurrent = entry.name === currentActiveName;
      if (isCurrent) tr.className = 'current-player-row';

      tr.innerHTML = `
        <td>${getRankDisplay(idx)}</td>
        <td><strong class="leaderboard-player-name"></strong>${isCurrent ? '<span class="tag-current">當前</span>' : ''}</td>
        <td>${getHeroBadge(entry.character)}</td>
        <td class="leaderboard-belt"></td>
        <td><span style="color:#2E7D32; font-weight:800;">${Number(entry.totalScore) || 0}</span> 題</td>
        <td>🔥 x${Number(entry.maxCombo) || 0}</td>
        <td>
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            ${isCurrent 
              ? '<button class="btn-select-player-row active" disabled>使用中</button>'
              : '<button class="btn-select-player-row btn-switch-player">選擇</button>'
            }
            <button class="btn-delete-player-row" title="刪除此小勇士紀錄">🗑️</button>
          </div>
        </td>
      `;
      const name = entry.name || '小勇士';
      tr.querySelector('.leaderboard-player-name').textContent = name;
      tr.querySelector('.leaderboard-belt').textContent = entry.highestBeltBadge || '🥋 白帶初階';
      const switchButton = tr.querySelector('.btn-switch-player');
      if (switchButton) {
        switchButton.dataset.name = name;
        switchButton.setAttribute('aria-label', `選擇小勇士 ${name}`);
      }
      const deleteButton = tr.querySelector('.btn-delete-player-row');
      deleteButton.dataset.name = name;
      deleteButton.setAttribute('aria-label', `刪除小勇士 ${name} 的紀錄`);
      tbody.appendChild(tr);
    });

    // 綁定行內「選擇小勇士」按鈕
    tbody.querySelectorAll('.btn-switch-player').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetName = e.currentTarget.dataset.name;
        StorageManager.setActivePlayerName(targetName);
        this.showDropdownMode(targetName);
        if (!this.gameApp.classList.contains('hidden')) window.syllableGame?.switchPlayer(targetName);
        this.closeLeaderboard();
        if (window.soundEngine) {
          window.soundEngine.ensureContext();
          window.soundEngine.playSuccessChime();
        }
      });
    });

    // 綁定行內「刪除紀錄」按鈕
    tbody.querySelectorAll('.btn-delete-player-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetName = e.currentTarget.dataset.name;
        if (confirm(`確定要刪除小勇士「${targetName}」的所有修煉紀錄嗎？此動作無法復原！`)) {
          StorageManager.deletePlayer(targetName);
          this.showDropdownMode();
          const activeName = StorageManager.getActivePlayerName();
          if (targetName === window.syllableGame?.playerName && !this.gameApp.classList.contains('hidden')) {
            window.syllableGame.switchPlayer(activeName);
          }
          this.renderLeaderboardTable();
          document.getElementById('btn-close-leaderboard').focus();
          if (window.soundEngine) window.soundEngine.playFailBoing();
        }
      });
    });
  }

  /**
   * 選擇角色後，播放「大跳躍跳入場景」動畫並切換至遊戲主畫面
   */
  selectCharacter(theme) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.landingScreen.inert = true;
    this.selectedTheme = theme;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 若當前正在展開輸入新名字且有值，自動提交儲存
    if (this.inputWrap && this.inputWrap.style.display !== 'none') {
      const typed = (this.nameInput ? this.nameInput.value : '').trim();
      if (typed) {
        StorageManager.setActivePlayerName(typed);
      }
    }
    const playerName = StorageManager.getActivePlayerName();

    // 播放起跳音效
    if (window.soundEngine) {
      window.soundEngine.ensureContext();
      window.soundEngine.playChopWhoosh();
      window.soundEngine.playSuccessChime();
    }

    // 1. 卡片跳躍動態
    const cards = document.querySelectorAll('.char-card');
    cards.forEach(card => {
      if (card.dataset.theme === theme) {
        card.classList.add('selected-jump');
      } else {
        card.classList.add('fade-away');
      }
    });

    // 2. 入口畫面縮放過場
    this.landingScreen.classList.add('zoom-fade-out');

    // 3. 0.55 秒後隱藏首頁，顯示遊戲頁面並觸發「英雄落地」動效
    setTimeout(() => {
      this.landingScreen.classList.add('hidden');
      this.landingScreen.classList.remove('zoom-fade-out');
      this.landingScreen.inert = false;
      cards.forEach(card => card.classList.remove('selected-jump', 'fade-away'));

      // 顯現遊戲主畫面
      this.gameApp.style.display = 'flex';
      this.gameApp.classList.remove('hidden');
      this.gameApp.classList.add('entering');
      this.applyTheme(theme);

      // 清理前一個遊戲實例（若存在），避免重複計時或語音殘留
      if (window.syllableGame && typeof window.syllableGame.destroy === 'function') {
        window.syllableGame.destroy();
      }

      // 啟動遊戲引擎並傳入玩家姓名
      const nextRound = this.nextDojoRound;
      this.nextDojoRound = null;
      document.getElementById('dojo-prepared-notice').textContent = '';
      window.syllableGame = new SyllableGame(theme, playerName, nextRound);

      // 4. 角色英雄空降落地動效 (Hero Landing)
      const mascotContainer = document.getElementById('mascot-container');
      if (mascotContainer && !reducedMotion) {
        const game = window.syllableGame;
        mascotContainer.classList.remove('mascot-landing-bounce');
        void mascotContainer.offsetWidth;
        mascotContainer.classList.add('mascot-landing-bounce');

        setTimeout(() => {
          if (game.isDestroyed) return;
          if (window.soundEngine) window.soundEngine.playWoodCrack();
          const shockwave = document.createElement('div');
          shockwave.className = 'landing-impact-shockwave';
          mascotContainer.appendChild(shockwave);
          setTimeout(() => shockwave.remove(), 1200);
        }, 420);

        setTimeout(() => {
          if (window.syllableGame === game) mascotContainer.classList.remove('mascot-landing-bounce');
        }, 800);
      }

      this.isTransitioning = false;
    }, reducedMotion ? 0 : 550);
  }

  /**
   * 依主題切換場景色調、標題與圖標
   */
  applyTheme(theme) {
    const gameApp = this.gameApp;
    const logoIcon = document.getElementById('game-logo-icon');
    const titleText = document.getElementById('game-title-text');
    const subtitleText = document.getElementById('game-subtitle-text');

    gameApp.classList.remove('theme-dojo', 'theme-sushi', 'theme-magic', 'theme-brawl');

    switch (theme) {
      case 'sushi':
        gameApp.classList.add('theme-sushi');
        document.body.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #1565C0 0%, #0D47A1 100%)';
        if (logoIcon) logoIcon.textContent = '🍣';
        if (titleText) titleText.textContent = 'SUSHI DOJO';
        if (subtitleText) subtitleText.textContent = '壽司道場切切樂';
        break;
      case 'magic':
        gameApp.classList.add('theme-magic');
        document.body.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #2a1848 0%, #1a1035 100%)';
        if (logoIcon) logoIcon.textContent = '✨';
        if (titleText) titleText.textContent = 'STARLIGHT DOJO';
        if (subtitleText) subtitleText.textContent = '星光魔法音節學院';
        break;
      case 'brawl':
        gameApp.classList.add('theme-brawl');
        document.body.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #1A1A2E 0%, #16213E 100%)';
        if (logoIcon) logoIcon.textContent = '⚾';
        if (titleText) titleText.textContent = 'HOME RUN DOJO';
        if (subtitleText) subtitleText.textContent = '棒球音節道場';
        break;
      default: // dojo
        gameApp.classList.add('theme-dojo');
        document.body.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #533B31 0%, #2D1E18 100%)';
        if (logoIcon) logoIcon.textContent = '🥋';
        if (titleText) titleText.textContent = 'SYLLABLE DOJO';
        if (subtitleText) subtitleText.textContent = '音節道館大冒險';
        break;
    }
  }

  /**
   * 返回入口頁面（由遊戲內返回按鈕呼叫）
   */
  backToLanding() {
    // 立即停止所有語音與清理遊戲狀態，避免背景延遲觸發
    if (window.syllableGame && typeof window.syllableGame.destroy === 'function') {
      window.syllableGame.destroy();
    }

    this.gameApp.style.display = 'none';
    this.gameApp.classList.add('hidden');
    this.gameApp.classList.remove('entering');

    this.landingScreen.classList.remove('hidden', 'zoom-fade-out');
    this.landingScreen.inert = false;
    document.body.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #2a1848 0%, #1a1035 100%)';

    const cards = document.querySelectorAll('.char-card');
    cards.forEach(card => card.classList.remove('selected-jump', 'fade-away'));
    this.isTransitioning = false;

    // 重新整理玩家選單並回到下拉模式 (同步遊戲中斬擊累計題數與腰帶)
    this.showDropdownMode();
    this.landingScreen.querySelector(`.char-card[data-theme="${this.selectedTheme}"] .char-select-btn`)?.focus();
  }
}


/* ============================================================ */
/* 核心遊戲引擎 (SyllableGame)                                  */
/* ============================================================ */
class SyllableGame {
  constructor(theme, playerName, nextRound) {
    this.theme = theme || 'dojo';
    this.playerName = playerName || StorageManager.getActivePlayerName();
    this.currentLevelIndex = 0;
    this.currentWordIndex = 0;
    this.isHintActive = false;
    this.combo = 0;
    this.hasAnswered = false;
    this.isDestroyed = false;

    // DOM 元素快取
    this.boardContainer = document.getElementById('board-container');
    this.hintBubble = document.getElementById('hint-bubble');
    this.meaningText = document.getElementById('meaning-text');
    this.ruleTitleEl = document.getElementById('rule-title-text');
    this.ruleProgressEl = document.getElementById('rule-progress-text');
    this.beltNameEl = document.getElementById('current-belt-name');
    this.beltIndicatorEl = document.getElementById('current-belt-indicator');
    this.comboTextEl = document.getElementById('combo-text');
    this.btnToggleHint = document.getElementById('btn-toggle-hint');
    this.levelSelectModal = document.getElementById('level-select-modal');
    this.upgradeModal = document.getElementById('upgrade-modal');
    this.beltSelector = document.getElementById('belt-selector-btn');
    this.btnNextWord = document.getElementById('btn-next-word');
    this.btnSpeakWord = document.getElementById('btn-speak-word');
    this.instruction = document.getElementById('dojo-instruction');
    this.cutActions = document.getElementById('dojo-cut-actions');
    this.cutCount = document.getElementById('dojo-cut-count');
    this.checkCuts = document.getElementById('btn-check-cuts');
    this.adjustDojo = document.getElementById('btn-adjust-dojo');

    // 更新頂部玩家姓名徽章
    this.updatePlayerBadge();

    // 建立選定角色吉祥物
    this.mascot = MascotFactory.create(this.theme, 'mascot-container');

    // 綁定事件 (採用屬性指派防止重複掛載監聽器)
    this.bindEvents();

    // 生成場景裝飾
    this.spawnSakuraPetals();

    // 載入第一個關卡
    if (nextRound) this.loadPractice(nextRound);
    else this.loadLevel(0);
    this.focusFirstCut();
  }

  destroy() {
    this.isDestroyed = true;
    window.soundEngine.cancelSpeech();
    this.clearPronunciationHighlight();
    clearTimeout(this.shakeTimer);
    this.mascot.destroy?.();
    this.closeLevelMenu();
    this.setUpgradeDialogOpen(false);
  }

  switchPlayer(name) {
    this.playerName = name;
    this.updatePlayerBadge();
    if (this.practiceRound) this.loadPractice(this.practiceRound);
    else this.loadLevel(this.currentLevelIndex);
  }

  updatePlayerBadge() {
    const avatarEl = document.getElementById('player-avatar-icon');
    const nameEl = document.getElementById('current-player-name-text');
    if (avatarEl) {
      if (this.theme === 'sushi') avatarEl.textContent = '🍣';
      else if (this.theme === 'magic') avatarEl.textContent = '✨';
      else if (this.theme === 'brawl') avatarEl.textContent = '⚾';
      else avatarEl.textContent = '🥋';
    }
    if (nameEl) {
      nameEl.textContent = this.playerName;
    }
  }

  getCurrentLevel() {
    return this.currentLevel;
  }

  getCurrentWord() {
    return this.getCurrentLevel().words[this.currentWordIndex];
  }

  bindEvents() {
    // 提示開關按鈕 (使用 onclick 避免重複掛載)
    this.btnToggleHint.onclick = () => {
      this.toggleHint();
    };

    // 靜音切換
    const btnMute = document.getElementById('btn-mute');
    if (btnMute) {
      const applyMuteState = () => {
        const muted = window.soundEngine.isMuted;
        btnMute.textContent = muted ? '🔇' : '🔊';
        btnMute.setAttribute('aria-pressed', String(muted));
        this.updatePronunciationControls();
      };
      btnMute.onclick = () => {
        window.soundEngine.setMuted(!window.soundEngine.isMuted);
        this.clearPronunciationHighlight();
        applyMuteState();
      };
      applyMuteState();
    }

    this.btnSpeakWord.onclick = () => {
      this.clearPronunciationHighlight();
      window.soundEngine.speakWord(this.getCurrentWord().word);
    };

    this.checkCuts.onclick = () => this.checkPracticeAnswer();
    this.adjustDojo.onclick = () => {
      this.setUpgradeDialogOpen(false);
      window.dojoSettings.open();
    };

    this.btnNextWord.onclick = () => {
      if (this.hasAnswered) this.advanceWord();
    };

    // 點擊腰帶打開關卡選單
    this.beltSelector.onclick = (e) => {
      e.stopPropagation();
      if (this.levelSelectModal.classList.contains('show')) {
        this.closeLevelMenu();
      } else {
        this.levelSelectModal.classList.add('show');
        this.beltSelector.setAttribute('aria-expanded', 'true');
        (this.levelSelectModal.querySelector('.active') || this.levelSelectModal.firstElementChild)?.focus();
      }
    };

    // 點擊其他地方關閉關卡選單 (僅註冊一次或直接安全處理)
    if (!window._syllableDocClickBound) {
      document.addEventListener('click', () => {
        window.syllableGame?.closeLevelMenu();
      });
      document.addEventListener('keydown', (event) => {
        const game = window.syllableGame;
        if (event.key === 'Escape' && game?.levelSelectModal.classList.contains('show')) {
          event.preventDefault();
          game.closeLevelMenu(true);
        }
      });
      window._syllableDocClickBound = true;
    }

    // 晉級彈窗下一步按鈕
    const btnNextBelt = document.getElementById('btn-next-belt');
    if (btnNextBelt) {
      btnNextBelt.onclick = () => {
        this.setUpgradeDialogOpen(false);
        if (this.practiceRound) {
          if (this.practiceRound.settings.source === 'gemini') window.dojoSettings.open();
          else this.loadPractice(buildDojoRound(this.practiceRound.settings));
          return;
        }
        const nextLevel = (this.currentLevelIndex + 1) % WORD_LEVELS.length;
        this.loadLevel(nextLevel);
        this.focusFirstCut();
      };
    }

    // 返回選角按鈕
    const btnBack = document.getElementById('btn-back-select');
    if (btnBack) {
      btnBack.onclick = () => {
        if (window.landingController) {
          window.landingController.backToLanding();
        }
      };
    }
  }

  closeLevelMenu(restoreFocus = false) {
    this.levelSelectModal.classList.remove('show');
    this.beltSelector.setAttribute('aria-expanded', 'false');
    if (restoreFocus) this.beltSelector.focus();
  }

  setUpgradeDialogOpen(open) {
    this.upgradeModal.classList.toggle('show', open);
    for (const section of this.upgradeModal.parentElement.children) {
      if (section !== this.upgradeModal) section.inert = open;
    }
  }

  spawnSakuraPetals() {
    const bg = document.querySelector('.dojo-background');
    if (!bg) return;
    bg.querySelectorAll('.sakura-petal').forEach(p => p.remove());

    const petalColors = {
      dojo: ['#FFB7B2', '#FFC1CC', '#FFD6D1'],
      sushi: ['#B3E5FC', '#B2DFDB', '#C5E1A5'],
      magic: ['#E1BEE7', '#B39DDB', '#80DEEA'],
      brawl: ['#FF80AB', '#FFD54F', '#90CAF9']
    };
    const colors = petalColors[this.theme] || petalColors.dojo;

    for (let i = 0; i < 16; i++) {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.width = `${10 + Math.random() * 12}px`;
      petal.style.height = `${12 + Math.random() * 14}px`;
      petal.style.background = colors[Math.floor(Math.random() * colors.length)];
      petal.style.animationDuration = `${6 + Math.random() * 8}s, ${3 + Math.random() * 4}s`;
      petal.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 2}s`;

      if (this.theme === 'magic') {
        petal.style.borderRadius = '50%';
        petal.style.boxShadow = `0 0 6px ${colors[Math.floor(Math.random() * colors.length)]}`;
      }
      bg.appendChild(petal);
    }
  }

  toggleHint() {
    this.setHints(!this.isHintActive);
    window.soundEngine.playHoverTick();
    this.updateHintVisibility();
  }

  setHints(active) {
    this.isHintActive = active;
    this.btnToggleHint.classList.toggle('active', active);
    this.btnToggleHint.setAttribute('aria-pressed', String(active));
    this.btnToggleHint.textContent = active ? '💡 提示開啟' : '💡 提示關閉';
  }

  updateHintVisibility() {
    const letters = this.boardContainer.querySelectorAll('.letter-box');
    letters.forEach(letter => {
      letter.classList.toggle('hint-active', this.isHintActive);
    });

    if (this.hasAnswered) return;
    const word = this.getCurrentWord();
    this.hintBubble.classList.remove('error-hint');
    if (this.practiceRound) {
      this.hintBubble.textContent = this.isHintActive
        ? '先聽整個字，跟著念並拍拍手。紅色是母音字母，拍子的數量要用耳朵聽。'
        : '先聽發音，想一想這個字有幾拍。';
    } else if (this.isHintActive) {
      this.hintBubble.textContent = `💡 ${word.hint || this.currentLevel.ruleDescription}`;
    } else {
      this.hintBubble.textContent = '選一個字母之間的空隙，把單字切成兩個音節。';
    }
  }

  loadLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    this.practiceRound = null;
    this.currentLevel = { ...WORD_LEVELS[levelIndex], words: makeBeltPool(levelIndex) };
    this.startCurrentRound();
  }

  loadPractice(round) {
    if (!round.words.length) return;
    this.practiceRound = round;
    const { topic, count, difficulty } = round.settings;
    this.currentLevel = {
      name: '自選練習',
      title: `${DOJO_TOPICS[topic]} · ${DOJO_COUNTS[count]} · ${DOJO_DIFFICULTIES[difficulty]}`,
      badge: '自選練習',
      beltColor: '#f6d878',
      beltBorder: '#ae7730',
      words: round.words
    };
    this.setHints(difficulty === 'easy');
    this.startCurrentRound();
    this.focusFirstCut();
  }

  startCurrentRound() {
    this.currentWordIndex = 0;
    this.combo = 0;
    this.practiceFirstTry = 0;
    this.comboTextEl.textContent = '連擊 x0';
    this.setHints(this.isHintActive);
    const level = this.getCurrentLevel();

    this.beltNameEl.textContent = level.name;
    this.beltIndicatorEl.style.backgroundColor = level.beltColor;
    this.beltIndicatorEl.style.borderColor = level.beltBorder;
    this.mascot.setBeltColor(level.beltColor);

    this.renderLevelMenu();
    this.loadWord();
    rememberDojoWords(level.words);
  }

  renderLevelMenu() {
    this.levelSelectModal.innerHTML = '';
    WORD_LEVELS.forEach((lvl, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const active = !this.practiceRound && idx === this.currentLevelIndex;
      btn.className = `level-option-btn ${active ? 'active' : ''}`;
      if (active) btn.setAttribute('aria-current', 'true');
      btn.innerHTML = `
        <span class="belt-indicator" style="background:${lvl.beltColor}; border-color:${lvl.beltBorder}"></span>
        <span>${lvl.badge} - ${lvl.name}</span>
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeLevelMenu();
        this.loadLevel(idx);
        this.focusFirstCut();
      });
      this.levelSelectModal.appendChild(btn);
    });
  }

  loadWord() {
    this.hasAnswered = false;
    this.hadWrongAttempt = false;
    this.selectedCuts = new Set();
    window.soundEngine.cancelSpeech();
    this.clearPronunciationHighlight();
    clearTimeout(this.shakeTimer);
    const level = this.getCurrentLevel();
    const wordObj = this.getCurrentWord();

    this.ruleTitleEl.textContent = `${level.badge} · ${level.title}`;
    this.ruleProgressEl.textContent = `第 ${this.currentWordIndex + 1} / ${level.words.length} 題`;
    this.meaningText.textContent = wordObj.meaning;

    this.boardContainer.className = 'board-container';
    this.boardContainer.innerHTML = '';
    this.boardContainer.setAttribute('role', 'group');
    this.boardContainer.setAttribute('aria-label', `切開英文單字 ${wordObj.word}`);
    this.btnNextWord.hidden = true;
    this.cutActions.hidden = !this.practiceRound;
    this.instruction.textContent = this.practiceRound
      ? '選出所有切點再檢查。點同一處可取消，長單字可以左右滑。'
      : '選擇兩個字母中間的切點，把單字分成兩段。';
    this.updateCutControls();

    const ropeLeft = document.createElement('div');
    ropeLeft.className = 'hanging-rope left';
    const ropeRight = document.createElement('div');
    ropeRight.className = 'hanging-rope right';
    this.boardContainer.appendChild(ropeLeft);
    this.boardContainer.appendChild(ropeRight);

    const slashFx = document.createElement('div');
    slashFx.className = 'slash-line-fx';
    slashFx.id = 'slash-fx';
    this.boardContainer.appendChild(slashFx);

    const woodenBoard = document.createElement('div');
    woodenBoard.className = 'wooden-board';

    if (this.practiceRound) {
      this.boardContainer.classList.add('free-cuts');
      this.renderPracticeTiles(woodenBoard, wordObj);
      this.boardContainer.appendChild(woodenBoard);
      this.updateHintVisibility();
      this.updatePronunciationControls();
      return;
    }

    // 左半部
    const leftWrapper = document.createElement('div');
    leftWrapper.className = 'board-piece-wrapper left-piece-wrapper';

    const leftPiece = document.createElement('div');
    leftPiece.className = 'board-piece left-piece';
    leftPiece.id = 'piece-left';

    leftWrapper.appendChild(leftPiece);
    leftWrapper.appendChild(this.makeSyllableButton(wordObj, 0, leftPiece));

    // 右半部
    const rightWrapper = document.createElement('div');
    rightWrapper.className = 'board-piece-wrapper right-piece-wrapper';

    const rightPiece = document.createElement('div');
    rightPiece.className = 'board-piece right-piece';
    rightPiece.id = 'piece-right';

    rightWrapper.appendChild(rightPiece);
    rightWrapper.appendChild(this.makeSyllableButton(wordObj, 1, rightPiece));

    const chars = wordObj.word.split('');
    const splitIndex = wordObj.splitIndex;

    chars.forEach((char, idx) => {
      const letterBox = this.makeLetter(char, idx);

      if (idx < splitIndex) {
        leftPiece.appendChild(letterBox);
      } else {
        rightPiece.appendChild(letterBox);
      }

      if (idx < chars.length - 1) {
        const chopSlot = this.makeCutSlot(chars, idx);

        if (idx < splitIndex) {
          leftPiece.appendChild(chopSlot);
        } else {
          rightPiece.appendChild(chopSlot);
        }
      }
    });

    woodenBoard.appendChild(leftWrapper);
    woodenBoard.appendChild(rightWrapper);
    this.boardContainer.appendChild(woodenBoard);

    this.updateHintVisibility();
    this.updatePronunciationControls();
  }

  makeLetter(char, index) {
    const tile = document.createElement('div');
    tile.className = `letter-box ${isVowel(char, index) ? 'is-vowel' : 'is-consonant'}`;
    tile.setAttribute('aria-hidden', 'true');
    tile.classList.toggle('hint-active', this.isHintActive);
    const gem = document.createElement('div');
    gem.className = 'vowel-gem';
    const text = document.createElement('span');
    text.textContent = char;
    tile.append(gem, text);
    return tile;
  }

  makeCutSlot(chars, index) {
    const button = document.createElement('button');
    const cut = index + 1;
    button.type = 'button';
    button.className = 'chop-slot';
    button.setAttribute('aria-label', `${chars[index]} 和 ${chars[cut]} 中間，第 ${cut} 個空隙`);
    button.dataset.splitIndex = cut.toString();
    button.innerHTML = '<span class="chop-line" aria-hidden="true"></span>';
    if (this.practiceRound) button.setAttribute('aria-pressed', 'false');
    button.addEventListener('mouseenter', () => {
      if (!this.hasAnswered) window.soundEngine.playHoverTick();
    });
    button.addEventListener('click', () => {
      if (this.practiceRound) this.toggleCut(cut, button);
      else this.handleChop(cut);
    });
    return button;
  }

  renderPracticeTiles(board, word) {
    const row = document.createElement('div');
    if (this.hasAnswered) {
      row.className = 'board-piece solved-segments';
      word.syllables.forEach((_, index) => {
        const button = this.makeSyllableButton(word, index);
        button.classList.add('dojo-solved-syllable');
        row.append(button);
      });
    } else {
      row.className = 'board-piece selectable-cuts';
      const chars = [...word.word];
      chars.forEach((char, index) => {
        row.append(this.makeLetter(char, index));
        if (index + 1 < chars.length) row.append(this.makeCutSlot(chars, index));
      });
    }
    board.replaceChildren(row);
  }

  toggleCut(cut, button) {
    if (this.hasAnswered || this.isDestroyed) return;
    if (this.selectedCuts.has(cut)) {
      this.selectedCuts.delete(cut);
    } else {
      if (this.selectedCuts.size === 3) {
        this.hintBubble.textContent = '這個練習最多分成 4 個音節。可以先取消一個切點再選。';
        return;
      }
      this.selectedCuts.add(cut);
    }
    button.setAttribute('aria-pressed', String(this.selectedCuts.has(cut)));
    this.updateCutControls();
  }

  updateCutControls() {
    const count = this.selectedCuts.size;
    this.cutCount.textContent = count ? `選了 ${count} 個切點` : '尚未選切點';
    this.checkCuts.textContent = count ? '檢查答案' : '整個字是 1 音節';
  }

  checkPracticeAnswer() {
    if (!this.practiceRound || this.hasAnswered || this.isDestroyed) return;
    const word = this.getCurrentWord();
    let position = 0;
    const expected = word.syllables.slice(0, -1).map(part => position += part.length);
    this.gradeAnswer(expected.length === this.selectedCuts.size &&
      expected.every(cut => this.selectedCuts.has(cut)));
  }

  makeSyllableButton(word, index, piece = null) {
    const button = document.createElement('button');
    const syllable = word.syllables[index];
    button.type = 'button';
    button.className = 'syllable-phonetic-badge';
    button.textContent = `🔊 ${syllable}`;
    button.setAttribute('aria-label', `聽音節 ${syllable}`);
    button.hidden = !this.hasAnswered;
    button.disabled = true;
    button.onclick = () => {
      this.clearPronunciationHighlight();
      const highlight = piece || button;
      highlight.classList.add('highlight-read');
      window.soundEngine.speakSingleSyllable(getDojoSyllableSpeech(word)[index]);
      this.pronunciationHighlightTimer = setTimeout(() => {
        highlight.classList.remove('highlight-read');
      }, 600);
    };
    return button;
  }

  focusFirstCut() {
    (this.boardContainer.querySelector('.chop-slot') || this.checkCuts).focus();
  }

  clearPronunciationHighlight() {
    clearTimeout(this.pronunciationHighlightTimer);
    this.boardContainer.querySelectorAll('.highlight-read').forEach(piece => {
      piece.classList.remove('highlight-read');
    });
  }

  updatePronunciationControls() {
    const canSpeak = window.soundEngine.canSpeak;
    let unavailableReason = '';
    if (window.soundEngine.isMuted) unavailableReason = '目前靜音';
    else if (!canSpeak) unavailableReason = '這個瀏覽器沒有語音功能';
    this.btnSpeakWord.disabled = !canSpeak;
    this.btnSpeakWord.title = unavailableReason || '聽單字發音';
    this.boardContainer.querySelectorAll('.syllable-phonetic-badge').forEach(button => {
      button.hidden = !this.hasAnswered;
      button.disabled = !this.hasAnswered || !canSpeak;
      button.title = unavailableReason || button.getAttribute('aria-label');
    });
  }

  handleChop(cutIndex) {
    if (this.hasAnswered || this.isDestroyed) return;
    this.gradeAnswer(cutIndex === this.getCurrentWord().splitIndex);
  }

  gradeAnswer(isCorrect) {
    const wordObj = this.getCurrentWord();

    if (isCorrect) {
      this.hasAnswered = true;
      this.combo++;
      this.comboTextEl.textContent = `連擊 x${this.combo}`;

      // 儲存記錄：紀錄成功解出單字與當前連擊
      if (this.practiceRound) {
        if (!this.hadWrongAttempt) this.practiceFirstTry++;
      } else {
        StorageManager.recordWordSolved(this.playerName, wordObj.word, this.combo, this.theme);
      }

      window.soundEngine.playChopWhoosh();

      const slashFx = this.boardContainer.querySelector('.slash-line-fx');
      this.mascot.triggerChop(() => {
        if (this.isDestroyed || !slashFx.isConnected) return;
        window.soundEngine.playWoodCrack();
        slashFx.classList.add('slash-active');
        this.mascot.triggerWin();
        window.soundEngine.playSuccessChime();
      });

      this.boardContainer.classList.add('split');
      if (this.practiceRound) {
        this.cutActions.hidden = true;
        this.renderPracticeTiles(this.boardContainer.querySelector('.wooden-board'), wordObj);
      } else {
        this.boardContainer.querySelectorAll('.chop-slot').forEach(button => {
          button.hidden = true;
        });
      }
      this.updatePronunciationControls();
      this.hintBubble.classList.remove('error-hint');
      const answer = document.createElement('span');
      answer.lang = 'en';
      answer.textContent = wordObj.syllables.join(' · ');
      this.hintBubble.replaceChildren(`答對了！這個字有 ${wordObj.syllables.length} 個音節。 `, answer);
      if (wordObj.phonicsNote) {
        const note = document.createElement('div');
        note.className = 'phonics-rule-tag';
        note.textContent = wordObj.phonicsNote;
        this.hintBubble.append(note);
      }
      const isFinalWord = this.currentWordIndex === this.getCurrentLevel().words.length - 1;
      this.btnNextWord.textContent = isFinalWord ? '查看過關結果' : '下一題';
      this.btnNextWord.hidden = false;
      this.btnNextWord.focus();

      const targets = this.boardContainer.querySelectorAll(this.practiceRound
        ? '.dojo-solved-syllable'
        : '.left-piece, .right-piece');
      window.soundEngine.speakPhonicsSequence(getDojoSyllableSpeech(wordObj), wordObj.word, {
        onStep: step => targets.forEach((target, index) => {
          target.classList.toggle('highlight-read', step === index || step === targets.length);
        }),
        onDone: () => this.clearPronunciationHighlight()
      });

    } else {
      this.hadWrongAttempt = true;
      this.combo = 0;
      this.comboTextEl.textContent = `連擊 x0`;

      window.soundEngine.playFailBoing();
      this.mascot.triggerFail();

      const wordBoard = this.boardContainer.querySelector('.wooden-board');
      this.boardContainer.classList.add('shake');
      clearTimeout(this.shakeTimer);
      this.shakeTimer = setTimeout(() => {
        if (!wordBoard.isConnected || this.isDestroyed) return;
        this.boardContainer.classList.remove('shake');
      }, 450);

      this.hintBubble.classList.add('error-hint');
      if (this.practiceRound) {
        this.hintBubble.textContent = this.isHintActive
          ? '再試一次。跟著發音拍手，每一拍是一個音節，再把聽到的分段標出來。'
          : '再試一次。可以聽發音，或選同一處取消切點。';
      } else {
        this.hintBubble.textContent = this.isHintActive
          ? `再試一次！${wordObj.hint || this.currentLevel.ruleDescription}`
          : '再試一次！選另一個字母空隙，也可以打開提示。';
      }
    }
  }

  advanceWord() {
    if (this.isDestroyed) return;
    const level = this.getCurrentLevel();
    if (this.currentWordIndex < level.words.length - 1) {
      this.currentWordIndex++;
      this.loadWord();
      this.focusFirstCut();
    } else {
      window.soundEngine.cancelSpeech();
      this.clearPronunciationHighlight();
      this.showLevelUpModal();
    }
  }

  showLevelUpModal() {
    if (this.isDestroyed) return;
    if (this.practiceRound) {
      window.soundEngine.playFanfare();
      this.mascot.triggerWin();
      document.getElementById('upgrade-modal-title').textContent = '音節練習完成！';
      document.getElementById('upgrade-modal-desc').textContent =
        `完成 ${this.practiceRound.words.length} 題，其中 ${this.practiceFirstTry} 題一次答對。`;
      const next = document.getElementById('btn-next-belt');
      next.textContent = this.practiceRound.settings.source === 'gemini' ? '準備新題目' : '再抽一組';
      this.adjustDojo.hidden = false;
      this.setUpgradeDialogOpen(true);
      next.focus();
      return;
    }
    this.adjustDojo.hidden = true;
    const currentLevel = this.getCurrentLevel();
    const nextLevelIdx = (this.currentLevelIndex + 1) % WORD_LEVELS.length;
    const nextLevel = WORD_LEVELS[nextLevelIdx];
    const isMasterCompleted = (this.currentLevelIndex === WORD_LEVELS.length - 1);

    // 儲存腰帶升級紀錄：若通關全道場，榮獲宗師稱號；否則獲得下一階腰帶
    const earnedBadge = isMasterCompleted ? '🥋 黑帶宗師 👑' : nextLevel.badge;
    StorageManager.recordBeltUpgrade(this.playerName, this.currentLevelIndex + 1, earnedBadge, this.theme);

    window.soundEngine.playFanfare();
    this.mascot.triggerWin();

    const titleEl = document.getElementById('upgrade-modal-title');
    const descEl = document.getElementById('upgrade-modal-desc');
    const nextBtn = document.getElementById('btn-next-belt');

    if (isMasterCompleted) {
      titleEl.textContent = '👑 黑帶挑戰完成！';
      descEl.textContent = `${this.playerName}完成了混合音節練習，獲得黑帶宗師頭銜！`;
      nextBtn.textContent = '重新挑戰道場';
    } else {
      titleEl.textContent = `🎉 恭喜晉級！榮獲 ${nextLevel.badge}！`;
      descEl.textContent = `${this.playerName}完成了「${currentLevel.name}」的全部練習！`;
      nextBtn.textContent = '挑戰下一個道館';
    }

    this.setUpgradeDialogOpen(true);
    nextBtn.focus();
  }
}


/* ============================================================ */
/* 頁面載入後初始化入口頁面                                      */
/* ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  window.landingController = new LandingController();
});
