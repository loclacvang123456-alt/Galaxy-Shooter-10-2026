// GameDistribution HTML5 SDK Adapter (Azerion)
export class GameDistributionAdapter {
  constructor() {
    this.name = 'GameDistribution';
    this.isReady = false;
    this.currentAdCallbacks = null;
    this.hasRewardedPending = false;
  }

  async init() {
    if (typeof window === 'undefined') return false;

    // Connect global bridge for window["GD_OPTIONS"].onEvent
    window.__GD_ON_EVENT__ = (e) => this.handleEvent(e);

    // If window.gdsdk is already loaded
    if (typeof window.gdsdk !== 'undefined' && typeof window.gdsdk.showAd === 'function') {
      this.isReady = true;
      console.log('[GameDistribution] gdsdk already loaded.');
      this.preloadRewarded();
      return true;
    }

    // If window.GD_OPTIONS is configured in index.html, register as active
    if (typeof window.GD_OPTIONS !== 'undefined') {
      this.isReady = true;
      console.log('[GameDistribution] GD_OPTIONS registered, waiting for SDK_READY.');
      return true;
    }

    return false;
  }

  handleEvent(event) {
    const eventName = event?.name;
    console.log('[GameDistribution] Event received:', eventName);

    switch (eventName) {
      case 'SDK_READY':
        this.isReady = true;
        this.preloadRewarded();
        break;
      case 'SDK_GAME_PAUSE':
        this.currentAdCallbacks?.onStart?.();
        break;
      case 'SDK_GAME_START':
        if (this.currentAdCallbacks) {
          if (this.hasRewardedPending) {
            this.currentAdCallbacks.onReward?.();
            this.hasRewardedPending = false;
          }
          this.currentAdCallbacks.onComplete?.();
          this.currentAdCallbacks = null;
        }
        this.preloadRewarded();
        break;
      case 'SDK_REWARDED_WATCH_COMPLETE':
        this.hasRewardedPending = true;
        break;
      case 'SDK_ERROR':
        this.currentAdCallbacks?.onError?.(new Error(event.message || 'GameDistribution Ad Error'));
        this.currentAdCallbacks = null;
        this.hasRewardedPending = false;
        break;
    }
  }

  preloadRewarded() {
    if (typeof window !== 'undefined' && typeof window.gdsdk !== 'undefined' && typeof window.gdsdk.preloadAd === 'function') {
      try {
        window.gdsdk.preloadAd('rewarded').catch(() => {});
      } catch (e) {}
    }
  }

  showInterstitial({ onStart, onComplete, onError }) {
    if (!this.isReady || typeof window === 'undefined' || typeof window.gdsdk === 'undefined' || typeof window.gdsdk.showAd !== 'function') {
      const err = new Error('GameDistribution SDK not ready');
      console.warn('[GameDistribution]', err.message);
      onError?.(err);
      onComplete?.();
      return;
    }

    this.currentAdCallbacks = { onStart, onComplete, onError };

    // Safety timeout in case gdsdk event does not fire
    const safetyTimer = setTimeout(() => {
      if (this.currentAdCallbacks) {
        console.warn('[GameDistribution] Ad fallback timeout after 10s.');
        this.currentAdCallbacks.onComplete?.();
        this.currentAdCallbacks = null;
      }
    }, 10000);

    const originalComplete = onComplete;
    this.currentAdCallbacks.onComplete = () => {
      clearTimeout(safetyTimer);
      originalComplete?.();
    };

    try {
      window.gdsdk.showAd()
        .then(() => {
          if (this.currentAdCallbacks) {
            this.currentAdCallbacks.onComplete?.();
            this.currentAdCallbacks = null;
          }
        })
        .catch((e) => {
          clearTimeout(safetyTimer);
          if (this.currentAdCallbacks) {
            this.currentAdCallbacks.onError?.(e);
            this.currentAdCallbacks.onComplete?.();
            this.currentAdCallbacks = null;
          }
        });
    } catch (e) {
      clearTimeout(safetyTimer);
      this.currentAdCallbacks = null;
      onError?.(e);
      onComplete?.();
    }
  }

  showRewarded({ onStart, onReward, onComplete, onError }) {
    if (!this.isReady || typeof window === 'undefined' || typeof window.gdsdk === 'undefined' || typeof window.gdsdk.showAd !== 'function') {
      const err = new Error('GameDistribution SDK not ready');
      console.warn('[GameDistribution]', err.message);
      onError?.(err);
      onComplete?.();
      return;
    }

    this.currentAdCallbacks = { onStart, onReward, onComplete, onError };
    this.hasRewardedPending = false;

    const safetyTimer = setTimeout(() => {
      if (this.currentAdCallbacks) {
        console.warn('[GameDistribution] Rewarded ad fallback timeout.');
        this.currentAdCallbacks.onComplete?.();
        this.currentAdCallbacks = null;
      }
    }, 15000);

    const originalComplete = onComplete;
    this.currentAdCallbacks.onComplete = () => {
      clearTimeout(safetyTimer);
      originalComplete?.();
    };

    try {
      window.gdsdk.showAd('rewarded')
        .then(() => {
          if (this.currentAdCallbacks) {
            this.currentAdCallbacks.onReward?.();
            this.currentAdCallbacks.onComplete?.();
            this.currentAdCallbacks = null;
          }
        })
        .catch((e) => {
          clearTimeout(safetyTimer);
          if (this.currentAdCallbacks) {
            this.currentAdCallbacks.onError?.(e);
            this.currentAdCallbacks.onComplete?.();
            this.currentAdCallbacks = null;
          }
        });
    } catch (e) {
      clearTimeout(safetyTimer);
      this.currentAdCallbacks = null;
      onError?.(e);
      onComplete?.();
    }
  }

  // Lifecycle stubs for platform compatibility
  gameplayStart() {}
  gameplayStop() {}
  happyTime() {}
  loadingStart() {}
  loadingStop() {}
}
