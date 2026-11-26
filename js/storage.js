/**
 * Syllable Dojo - 存檔與排行榜資料管理模組 (StorageManager)
 * 負責玩家名稱設定、各別紀錄存檔、連擊與分數累積、排行榜資料維護
 */

const STORAGE_KEYS = {
  ACTIVE_PLAYER: 'syllable_active_player',
  PROFILES: 'syllable_player_profiles',
  LEADERBOARD: 'syllable_leaderboard'
};

class StorageManager {
  static sessionStorage = new Map();
  static unsavedKeys = new Set();

  static read(key) {
    if (this.unsavedKeys.has(key)) return this.sessionStorage.get(key) ?? null;
    try {
      const value = localStorage.getItem(key);
      if (value === null) this.sessionStorage.delete(key);
      else this.sessionStorage.set(key, value);
      return value;
    } catch {
      return this.sessionStorage.get(key) ?? null;
    }
  }

  static write(key, value) {
    this.sessionStorage.set(key, value);
    try {
      localStorage.setItem(key, value);
      this.unsavedKeys.delete(key);
    } catch {
      this.unsavedKeys.add(key);
    }
  }

  /**
   * 取得當前玩家名稱 (預設為 "小勇士")
   */
  static getActivePlayerName() {
    return this.read(STORAGE_KEYS.ACTIVE_PLAYER) || '小勇士';
  }

  /**
   * 設定當前玩家名稱 (同時確保存檔物件存在)
   */
  static setActivePlayerName(name) {
    const cleanName = (name || '').trim() || '小勇士';
    this.write(STORAGE_KEYS.ACTIVE_PLAYER, cleanName);
    this.getPlayerProfile(cleanName);
    return cleanName;
  }

  /**
   * 取得所有玩家檔案字典
   */
  static getAllProfiles() {
    const profiles = Object.create(null);
    try {
      const data = JSON.parse(this.read(STORAGE_KEYS.PROFILES));
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        for (const [name, profile] of Object.entries(data)) {
          if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
            profiles[name] = profile;
          }
        }
      }
    } catch {
      // Invalid saved data leaves an empty profile list.
    }
    return profiles;
  }

  /**
   * 取得指定玩家存檔紀錄 (若不存在則初始化)
   */
  static getPlayerProfile(name) {
    const playerName = name || this.getActivePlayerName();
    const profiles = this.getAllProfiles();

    if (!profiles[playerName]) {
      profiles[playerName] = {
        name: playerName,
        character: 'poby', // 預設使用波比
        highestBeltIndex: 0,
        highestBeltBadge: '🥋 白帶初階',
        totalScore: 0,
        maxCombo: 0,
        completedWords: [],
        lastPlayed: new Date().toLocaleDateString('zh-TW')
      };
      this.saveAllProfiles(profiles);
    }

    return profiles[playerName];
  }

  /**
   * 儲存所有玩家檔案
   */
  static saveAllProfiles(profiles) {
    this.write(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  /**
   * 更新玩家完成單字與連擊紀錄
   */
  static recordWordSolved(playerName, word, combo, theme) {
    const profile = this.getPlayerProfile(playerName);
    profile.character = theme || profile.character;
    profile.totalScore = (profile.totalScore || 0) + 1;
    if (combo > (profile.maxCombo || 0)) {
      profile.maxCombo = combo;
    }
    if (!profile.completedWords) profile.completedWords = [];
    if (!profile.completedWords.includes(word)) {
      profile.completedWords.push(word);
    }
    profile.lastPlayed = new Date().toLocaleDateString('zh-TW');

    const profiles = this.getAllProfiles();
    profiles[playerName] = profile;
    this.saveAllProfiles(profiles);

    // 同步更新排行榜
    this.updateLeaderboard();
  }

  /**
   * 更新玩家腰帶晉級紀錄
   */
  static recordBeltUpgrade(playerName, beltIndex, beltBadge, theme) {
    const profile = this.getPlayerProfile(playerName);
    profile.character = theme || profile.character;
    if (beltIndex > (profile.highestBeltIndex || 0)) {
      profile.highestBeltIndex = beltIndex;
      profile.highestBeltBadge = beltBadge;
    }
    profile.lastPlayed = new Date().toLocaleDateString('zh-TW');

    const profiles = this.getAllProfiles();
    profiles[playerName] = profile;
    this.saveAllProfiles(profiles);

    this.updateLeaderboard();
  }

  /**
   * 取得排行榜陣列 (依腰帶階級、總分、最大連擊綜合排序)
   */
  static getLeaderboard() {
    const profiles = this.getAllProfiles();
    const list = Object.values(profiles);

    // 排序：最高腰帶 > 總得分 > 最高連擊
    list.sort((a, b) => {
      if ((b.highestBeltIndex || 0) !== (a.highestBeltIndex || 0)) {
        return (b.highestBeltIndex || 0) - (a.highestBeltIndex || 0);
      }
      if ((b.totalScore || 0) !== (a.totalScore || 0)) {
        return (b.totalScore || 0) - (a.totalScore || 0);
      }
      return (b.maxCombo || 0) - (a.maxCombo || 0);
    });

    return list;
  }

  /**
   * 更新排行榜資料
   */
  static updateLeaderboard() {
    this.write(STORAGE_KEYS.LEADERBOARD, JSON.stringify(this.getLeaderboard()));
  }

  /**
   * 清除指定小勇士紀錄
   */
  static deletePlayer(name) {
    const profiles = this.getAllProfiles();
    if (profiles[name]) {
      delete profiles[name];
      this.saveAllProfiles(profiles);
      this.updateLeaderboard();
      if (this.getActivePlayerName() === name) {
        const remaining = Object.keys(profiles);
        this.setActivePlayerName(remaining.length > 0 ? remaining[0] : '小勇士');
      }
      return true;
    }
    return false;
  }

  /**
   * 清除所有排行榜與紀錄 (重設)
   */
  static clearAllData() {
    for (const key of Object.values(STORAGE_KEYS)) {
      this.sessionStorage.delete(key);
      try {
        localStorage.removeItem(key);
        this.unsavedKeys.delete(key);
      } catch {
        this.unsavedKeys.add(key);
      }
    }
  }
}

window.StorageManager = StorageManager;
