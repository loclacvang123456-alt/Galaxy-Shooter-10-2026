import { GameDistributionAdapter } from './GameDistributionAdapter.js';
import { CrazyGamesAdapter } from './CrazyGamesAdapter.js';
import { GameMonetizeAdapter } from './GameMonetizeAdapter.js';
import { ByteBrewAdapter } from './ByteBrewAdapter.js';
import { audio } from '../audio/AudioManager.js';

class SDKManager {
  constructor() {
    this.gameDistribution = new GameDistributionAdapter();
    this.crazyGames = new CrazyGamesAdapter();
    this.gameMonetize = new GameMonetizeAdapter();
    this.analytics = new ByteBrewAdapter();
    this.activeAdProvider = null;
    this.gameInstance = null; // Reference to game loop pause/resume
  }

  async init(gameInstance = null) {
    this.gameInstance = gameInstance;

    // 1. Detect GameDistribution (Azerion)
    const gdReady = await this.gameDistribution.init();
    if (gdReady) {
      this.activeAdProvider = this.gameDistribution;
      console.log('[SDKManager] Selected Ad Provider: GameDistribution');
    } else {
      // 2. Detect GameMonetize
      const gmReady = await this.gameMonetize.init();
      if (gmReady) {
        this.activeAdProvider = this.gameMonetize;
        console.log('[SDKManager] Selected Ad Provider: GameMonetize');
      } else {
        // 3. Detect CrazyGames
        const cgReady = await this.crazyGames.init();
        if (cgReady) {
          this.activeAdProvider = this.crazyGames;
          console.log('[SDKManager] Selected Ad Provider: CrazyGames');
        } else {
          console.log('[SDKManager] No third-party SDK detected. Using Local Mock Provider.');
        }
      }
    }

    // Initialize Analytics
    this.analytics.init();
    this.analytics.trackSessionStart();
  }

  setGameInstance(gameInstance) {
    this.gameInstance = gameInstance;
  }

  gameplayStart() {
    this.activeAdProvider?.gameplayStart?.();
  }

  gameplayStop() {
    this.activeAdProvider?.gameplayStop?.();
  }

  happyTime() {
    this.activeAdProvider?.happyTime?.();
  }

  loadingStart() {
    this.activeAdProvider?.loadingStart?.();
  }

  loadingStop() {
    this.activeAdProvider?.loadingStop?.();
  }

  // Handle mandatory pause + mute before showing ads
  onAdStart() {
    console.log('[SDKManager] Ad Started - Pausing Game & Muting Audio');
    this.gameplayStop();
    if (this.gameInstance && typeof this.gameInstance.pause === 'function') {
      this.gameInstance.pause();
    }
    audio.setAdMute(true);
  }

  // Handle mandatory resume + unmute after ad ends
  onAdEnd() {
    console.log('[SDKManager] Ad Ended - Resuming Game & Restoring Audio');
    audio.setAdMute(false);
    if (this.gameInstance && typeof this.gameInstance.resume === 'function') {
      this.gameInstance.resume();
    }
  }

  // Request Interstitial / Midgame Ad
  showInterstitial(onComplete = null) {
    this.onAdStart();

    const done = () => {
      this.onAdEnd();
      onComplete?.();
    };

    if (this.activeAdProvider) {
      this.activeAdProvider.showInterstitial({
        onStart: () => {},
        onComplete: done,
        onError: (err) => {
          console.warn('[SDKManager] Interstitial error, resuming:', err);
          done();
        }
      });
    } else {
      // Dev mock: simulate brief 400ms ad delay
      console.log('[Mock Ad] Showing mock interstitial...');
      setTimeout(done, 400);
    }
  }

  // Request Rewarded Ad (e.g. revive or 2x coins)
  showRewarded({ onReward, onComplete, onCancel }) {
    this.onAdStart();

    let rewarded = false;
    const finish = () => {
      this.onAdEnd();
      if (rewarded) {
        this.analytics.trackAdRewarded('rewarded_action', true);
        onReward?.();
      } else {
        onCancel?.();
      }
      onComplete?.();
    };

    if (this.activeAdProvider) {
      this.activeAdProvider.showRewarded({
        onStart: () => {},
        onReward: () => {
          rewarded = true;
        },
        onComplete: finish,
        onError: (err) => {
          console.warn('[SDKManager] Rewarded ad error:', err);
          finish();
        }
      });
    } else {
      // Dev mock: auto-reward after simulated 500ms
      console.log('[Mock Ad] Showing mock rewarded ad...');
      setTimeout(() => {
        rewarded = true;
        finish();
      }, 500);
    }
  }
}

export const sdk = new SDKManager();
