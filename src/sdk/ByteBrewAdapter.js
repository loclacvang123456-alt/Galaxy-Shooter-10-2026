// ByteBrew Web SDK Analytics Adapter
export class ByteBrewAdapter {
  constructor() {
    this.name = 'ByteBrew';
    this.isReady = false;
  }

  init(gameId = '', secretKey = '') {
    if (typeof window !== 'undefined' && window.ByteBrew) {
      try {
        window.ByteBrew.Initialize(gameId, secretKey);
        this.isReady = true;
        console.log('[ByteBrew] Initialized');
      } catch (e) {
        console.warn('[ByteBrew] Initialization failed:', e);
      }
    }
  }

  trackCustomEvent(eventName, params = {}) {
    if (this.isReady && window.ByteBrew?.NewCustomEvent) {
      try {
        window.ByteBrew.NewCustomEvent(eventName, JSON.stringify(params));
      } catch (e) {
        console.warn('[ByteBrew] Event error:', e);
      }
    } else {
      // Local dev logging
      console.log(`[Analytics Event] ${eventName}:`, params);
    }
  }

  trackSessionStart() {
    this.trackCustomEvent('session_start', { timestamp: Date.now() });
  }

  trackProgressionStage(stage, level, score) {
    this.trackCustomEvent('progression_stage', { stage, level, score });
  }

  trackUpgradeUnlocked(upgradeId, tier) {
    this.trackCustomEvent('upgrade_unlocked', { upgradeId, tier });
  }

  trackAdRewarded(placement, rewarded) {
    this.trackCustomEvent('ad_rewarded', { placement, rewarded });
  }
}
