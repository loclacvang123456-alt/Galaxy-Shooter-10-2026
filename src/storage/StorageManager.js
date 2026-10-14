// LocalStorage Persistence with safe fallback for incognito / restricted browsers
class StorageManager {
  constructor() {
    this.memoryFallback = {};
    this.isStorageAvailable = this.checkStorage();
  }

  checkStorage() {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      console.warn('localStorage is restricted or unavailable. Using memory fallback.');
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    if (this.isStorageAvailable) {
      try {
        const val = window.localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : defaultValue;
      } catch (e) {
        console.error('Error reading localStorage for key', key, e);
      }
    }
    return this.memoryFallback[key] !== undefined ? this.memoryFallback[key] : defaultValue;
  }

  setItem(key, value) {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return;
      } catch (e) {
        console.error('Error writing to localStorage for key', key, e);
      }
    }
    this.memoryFallback[key] = value;
  }

  getHighScore() {
    return this.getItem('galaxy_shooter_high_score', 0);
  }

  setHighScore(score) {
    const current = this.getHighScore();
    if (score > current) {
      this.setItem('galaxy_shooter_high_score', score);
      return true;
    }
    return false;
  }

  getAudioSettings() {
    return this.getItem('galaxy_shooter_audio', { sfxMuted: false, bgmMuted: false, sfxVol: 0.7, bgmVol: 0.4 });
  }

  setAudioSettings(settings) {
    this.setItem('galaxy_shooter_audio', settings);
  }

  getLanguage() {
    return this.getItem('galaxy_shooter_lang', 'en');
  }

  setLanguage(lang) {
    this.setItem('galaxy_shooter_lang', lang);
  }
}

export const storage = new StorageManager();
