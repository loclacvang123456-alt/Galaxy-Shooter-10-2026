// CrazyGames SDK v3 Adapter
export class CrazyGamesAdapter {
  constructor() {
    this.name = 'CrazyGames';
    this.sdk = null;
    this.isReady = false;
  }

  async init() {
    if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK) {
      try {
        this.sdk = window.CrazyGames.SDK;
        // Guard with 3.5s timeout so dev/offline environments never freeze boot
        await Promise.race([
          this.sdk.init(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('SDK init timeout')), 3500))
        ]);
        this.isReady = true;
        console.log('[CrazyGames] SDK initialized successfully');
      } catch (err) {
        console.warn('[CrazyGames] SDK init error/timeout:', err);
      }
    } else {
      console.log('[CrazyGames] SDK script not detected in global scope.');
    }
    return this.isReady;
  }

  showInterstitial({ onStart, onComplete, onError }) {
    if (!this.isReady || !this.sdk?.ad) {
      onError?.(new Error('CrazyGames SDK not ready'));
      return;
    }

    const callbacks = {
      adStarted: () => onStart?.(),
      adFinished: () => onComplete?.(),
      adError: (error) => {
        console.warn('[CrazyGames] Interstitial error:', error);
        onError?.(error);
      }
    };

    this.sdk.ad.requestAd('midgame', callbacks);
  }

  showRewarded({ onStart, onReward, onComplete, onError }) {
    if (!this.isReady || !this.sdk?.ad) {
      onError?.(new Error('CrazyGames SDK not ready'));
      return;
    }

    let rewarded = false;
    const callbacks = {
      adStarted: () => onStart?.(),
      adFinished: () => {
        rewarded = true;
        onReward?.();
        onComplete?.();
      },
      adError: (error) => {
        console.warn('[CrazyGames] Rewarded ad error:', error);
        onError?.(error);
      }
    };

    this.sdk.ad.requestAd('rewarded', callbacks);
  }

  happyTime() {
    if (this.isReady && this.sdk?.game?.happytime) {
      this.sdk.game.happytime();
    }
  }

  gameplayStart() {
    if (this.isReady && this.sdk?.game?.gameplayStart) {
      this.sdk.game.gameplayStart();
    }
  }

  gameplayStop() {
    if (this.isReady && this.sdk?.game?.gameplayStop) {
      this.sdk.game.gameplayStop();
    }
  }

  loadingStart() {
    if (this.isReady && this.sdk?.game?.loadingStart) {
      this.sdk.game.loadingStart();
    }
  }

  loadingStop() {
    if (this.isReady && this.sdk?.game?.loadingStop) {
      this.sdk.game.loadingStop();
    }
  }
}
