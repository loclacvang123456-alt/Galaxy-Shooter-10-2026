import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { sdk } from '../sdk/SDKManager.js';
import { storage } from '../storage/StorageManager.js';
import { t } from '../core/i18n.js';

export class GameOverModal {
  constructor(engine, { onRevive, onRestart }) {
    this.engine = engine;
    this.onRevive = onRevive;
    this.onRestart = onRestart;

    this.container = new Container();
    this.container.visible = false;
    this.engine.uiLayer.addChild(this.container);

    this.modalWidth = 420;
    this.modalHeight = 390;
  }

  show(score, kills, timeElapsed) {
    this.container.removeChildren();
    this.container.visible = true;

    const w = this.engine.width;
    const h = this.engine.height;
    const boxW = Math.min(this.modalWidth, w - 32);
    const boxH = this.modalHeight;

    const isNewHigh = storage.setHighScore(score);
    const highScore = storage.getHighScore();

    // Dim Background Overlay
    const bg = new Graphics();
    bg.rect(0, 0, w, h);
    bg.fill({ color: 0x030712, alpha: 0.88 });
    bg.eventMode = 'static';
    this.container.addChild(bg);

    // Modal Box
    const boxX = (w - boxW) / 2;
    const boxY = (h - boxH) / 2;

    const box = new Graphics();
    box.roundRect(boxX, boxY, boxW, boxH, 16);
    box.fill({ color: 0x0f172a });
    box.roundRect(boxX, boxY, boxW, boxH, 16);
    box.stroke({ width: 2, color: 0xff0055 });
    this.container.addChild(box);

    // Game Over Title
    const title = new Text({
      text: t('gameover.defeat'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: Math.min(20, Math.floor(boxW * 0.05)),
        fontWeight: 'bold',
        fill: '#ff0055'
      })
    });
    title.anchor.set(0.5);
    title.x = w / 2;
    title.y = boxY + 45;
    this.container.addChild(title);

    // Score Info
    // Score Info
    const scoreVal = new Text({
      text: `${t('gameover.score')}: ${score.toLocaleString()}`,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#ffffff'
      })
    });
    scoreVal.anchor.set(0.5);
    scoreVal.x = w / 2;
    scoreVal.y = boxY + 95;
    this.container.addChild(scoreVal);

    // High Score Info
    const highVal = new Text({
      text: isNewHigh ? '★ NEW HIGH SCORE! ★' : `BEST: ${highScore.toLocaleString()}`,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: isNewHigh ? '#ffd700' : '#94a3b8'
      })
    });
    highVal.anchor.set(0.5);
    highVal.x = w / 2;
    highVal.y = boxY + 130;
    this.container.addChild(highVal);

    // Stats
    const mins = Math.floor(timeElapsed / 60);
    const secs = Math.floor(timeElapsed % 60);
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const stats = new Text({
      text: `${t('gameover.kills')}: ${kills}   |   ${t('gameover.time')}: ${timeStr}`,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: Math.min(13, Math.floor(boxW * 0.032)),
        fill: '#64748b'
      })
    });
    stats.anchor.set(0.5);
    stats.x = w / 2;
    stats.y = boxY + 165;
    this.container.addChild(stats);

    const btnW = boxW - 50;

    // Button 1: REVIVE (Rewarded Ad)
    const reviveBtn = new Container();
    reviveBtn.x = boxX + 25;
    reviveBtn.y = boxY + 215;
    reviveBtn.eventMode = 'static';
    reviveBtn.cursor = 'pointer';

    const rG = new Graphics();
    rG.roundRect(0, 0, btnW, 48, 10);
    rG.fill({ color: 0x0284c7 });
    rG.stroke({ width: 2, color: 0x38bdf8 });
    reviveBtn.addChild(rG);

    const rText = new Text({
      text: t('gameover.revive'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 15,
        fontWeight: 'bold',
        fill: '#ffffff'
      })
    });
    rText.anchor.set(0.5);
    rText.x = btnW / 2;
    rText.y = 24;
    reviveBtn.addChild(rText);

    reviveBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      sdk.showRewarded({
        onReward: () => {
          this.hide();
          this.onRevive();
        },
        onCancel: () => console.log('Rewarded ad skipped'),
        onComplete: () => {}
      });
    });
    this.container.addChild(reviveBtn);

    // Button 2: PLAY AGAIN (Interstitial Ad)
    const restartBtn = new Container();
    restartBtn.x = boxX + 25;
    restartBtn.y = boxY + 280;
    restartBtn.eventMode = 'static';
    restartBtn.cursor = 'pointer';

    const restG = new Graphics();
    restG.roundRect(0, 0, btnW, 48, 10);
    restG.fill({ color: 0x1e293b });
    restG.stroke({ width: 1.5, color: 0x475569 });
    restartBtn.addChild(restG);

    const restText = new Text({
      text: t('gameover.restart'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 15,
        fontWeight: 'bold',
        fill: '#94a3b8'
      })
    });
    restText.anchor.set(0.5);
    restText.x = btnW / 2;
    restText.y = 24;
    restartBtn.addChild(restText);

    restartBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      sdk.showInterstitial(() => {
        this.hide();
        this.onRestart();
      });
    });
    this.container.addChild(restartBtn);
  }

  hide() {
    this.container.visible = false;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
