// GameMonetize SDK Adapter
export class GameMonetizeAdapter {
  constructor() {
    this.name = 'GameMonetize';
    this.isReady = false;
    this.currentAdCallbacks = null;
  }

  async init() {
    if (typeof window === 'undefined') return false;

    // Connect global bridge for window.SDK_OPTIONS.onEvent
    window.__GM_ON_EVENT__ = (e) => this.handleEvent(e);

    // If window.sdk is already available
    if (typeof window.sdk !== 'undefined' && typeof window.sdk.showBanner === 'function') {
      this.isReady = true;
      console.log('[GameMonetize] SDK already loaded.');
      return true;
    }

    // If window.SDK_OPTIONS is configured in index.html, register as active
    if (typeof window.SDK_OPTIONS !== 'undefined') {
      this.isReady = true;
      console.log('[GameMonetize] SDK options registered, waiting for SDK_READY.');
      return true;
    }

    return false;
  }

  handleEvent(event) {
    const eventName = event?.name;
    console.log('[GameMonetize] Event received:', eventName);

    switch (eventName) {
      case 'SDK_READY':
        this.isReady = true;
        break;
      case 'SDK_GAME_PAUSE':
        this.currentAdCallbacks?.onStart?.();
        break;
      case 'SDK_GAME_START':
        this.currentAdCallbacks?.onComplete?.();
        this.currentAdCallbacks = null;
        break;
      case 'SDK_ERROR':
        this.currentAdCallbacks?.onError?.(new Error('GameMonetize Ad Error'));
        this.currentAdCallbacks = null;
        break;
    }
  }

  showInterstitial({ onStart, onComplete, onError }) {
    if (!this.isReady || typeof window === 'undefined' || typeof window.sdk === 'undefined' || typeof window.sdk.showBanner !== 'function') {
      const err = new Error('GameMonetize SDK not ready');
      console.warn('[GameMonetize]', err.message);
      onError?.(err);
      onComplete?.();
      return;
    }

    this.currentAdCallbacks = { onStart, onComplete, onError };

    // Safety timeout in case GameMonetize does not fire SDK_GAME_START
    const safetyTimer = setTimeout(() => {
      if (this.currentAdCallbacks) {
        console.warn('[GameMonetize] Ad completion fallback after 10s timeout.');
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
      window.sdk.showBanner();
    } catch (e) {
      clearTimeout(safetyTimer);
      this.currentAdCallbacks = null;
      onError?.(e);
      onComplete?.();
    }
  }

  showRewarded({ onStart, onReward, onComplete, onError }) {
    if (!this.isReady || typeof window === 'undefined' || typeof window.sdk === 'undefined' || typeof window.sdk.showBanner !== 'function') {
      const err = new Error('GameMonetize SDK not ready');
      console.warn('[GameMonetize]', err.message);
      onError?.(err);
      onComplete?.();
      return;
    }

    this.showInterstitial({
      onStart,
      onComplete: () => {
        onReward?.();
        onComplete?.();
      },
      onError
    });
  }

  // Lifecycle stubs for platform compatibility
  gameplayStart() {}
  gameplayStop() {}
  happyTime() {}
  loadingStart() {}
  loadingStop() {}
}
