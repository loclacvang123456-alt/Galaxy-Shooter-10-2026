import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { i18n, t } from '../core/i18n.js';

export class PauseModal {
  constructor(engine, { onContinue, onRestart }) {
    this.engine = engine;
    this.onContinue = onContinue;
    this.onRestart = onRestart;

    this.container = new Container();
    this.container.visible = false;
    this.engine.uiLayer.addChild(this.container);

    this.modalWidth = 380;
    this.modalHeight = 370;

    this.currentWave = 1;
    this.currentScore = 0;
  }

  show(wave = 1, score = 0) {
    this.currentWave = wave;
    this.currentScore = score;
    this.render();
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
    this.container.removeChildren();
  }

  render() {
    this.container.removeChildren();

    // 1. Dark overlay (blocks game input behind)
    const overlay = new Graphics();
    overlay.rect(0, 0, this.engine.width, this.engine.height);
    overlay.fill({ color: 0x030712, alpha: 0.85 });
    overlay.eventMode = 'static';
    this.container.addChild(overlay);

    // 2. Modal Window Panel
    const cx = this.engine.width / 2;
    const cy = this.engine.height / 2;

    const panel = new Container();
    panel.x = cx;
    panel.y = cy;

    const bg = new Graphics();
    // Neon outer glow rim
    bg.roundRect(-this.modalWidth / 2 - 3, -this.modalHeight / 2 - 3, this.modalWidth + 6, this.modalHeight + 6, 18);
    bg.stroke({ width: 3.5, color: 0x00f0ff, alpha: 0.45 });
    // Cyber card core
    bg.roundRect(-this.modalWidth / 2, -this.modalHeight / 2, this.modalWidth, this.modalHeight, 16);
    bg.fill({ color: 0x0f172a, alpha: 0.98 });
    bg.roundRect(-this.modalWidth / 2, -this.modalHeight / 2, this.modalWidth, this.modalHeight, 16);
    bg.stroke({ width: 2, color: 0x38bdf8, alpha: 0.95 });
    panel.addChild(bg);

    // Header Title
    const title = new Text({
      text: t('pause.title'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 22,
        fontWeight: '900',
        fill: '#00f0ff',
        letterSpacing: 2,
        dropShadow: { color: '#00f0ff', blur: 10, distance: 0 }
      })
    });
    title.anchor.set(0.5);
    title.y = -this.modalHeight / 2 + 38;
    panel.addChild(title);

    // Wave & Score Summary
    const summary = new Text({
      text: t('pause.summary', { wave: this.currentWave, score: this.currentScore.toLocaleString() }),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#94a3b8'
      })
    });
    summary.anchor.set(0.5);
    summary.y = -this.modalHeight / 2 + 70;
    panel.addChild(summary);

    // Buttons Builder
    const btnW = 280;
    const btnH = 44;
    const startY = -this.modalHeight / 2 + 115;
    const gap = 56;

    // Button 1: CONTINUE
    this.createButton(panel, {
      x: 0,
      y: startY,
      width: btnW,
      height: btnH,
      text: t('pause.continue'),
      bgColor: 0x0284c7,
      borderColor: 0x38bdf8,
      textColor: '#ffffff',
      onClick: () => {
        audio.playClick();
        this.hide();
        this.onContinue?.();
      }
    });

    // Button 2: LANGUAGE TOGGLE (English <-> Tiếng Việt)
    this.createButton(panel, {
      x: 0,
      y: startY + gap,
      width: btnW,
      height: btnH,
      text: t('pause.lang'),
      bgColor: 0x1e293b,
      borderColor: 0xffd700,
      textColor: '#ffd700',
      onClick: () => {
        audio.playClick();
        i18n.toggleLanguage();
        this.render(); // Re-render modal in new language immediately
      }
    });

    // Button 3: SOUND TOGGLE
    const isMuted = audio.isMuted;
    this.createButton(panel, {
      x: 0,
      y: startY + gap * 2,
      width: btnW,
      height: btnH,
      text: isMuted ? t('pause.sound_off') : t('pause.sound_on'),
      bgColor: 0x1e293b,
      borderColor: isMuted ? 0xef4444 : 0x10b981,
      textColor: isMuted ? '#f87171' : '#34d399',
      onClick: () => {
        audio.playClick();
        audio.toggleMute();
        this.render();
      }
    });

    // Button 4: RESTART RUN
    this.createButton(panel, {
      x: 0,
      y: startY + gap * 3,
      width: btnW,
      height: btnH,
      text: t('pause.restart'),
      bgColor: 0x221313,
      borderColor: 0xef4444,
      textColor: '#f87171',
      onClick: () => {
        audio.playClick();
        this.hide();
        this.onRestart?.();
      }
    });

    this.container.addChild(panel);
  }

  createButton(parent, { x, y, width, height, text, bgColor, borderColor, textColor, onClick }) {
    const btn = new Container();
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const g = new Graphics();
    g.roundRect(-width / 2, -height / 2, width, height, 10);
    g.fill({ color: bgColor, alpha: 0.95 });
    g.roundRect(-width / 2, -height / 2, width, height, 10);
    g.stroke({ width: 2, color: borderColor });
    btn.addChild(g);

    const label = new Text({
      text,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: textColor
      })
    });
    label.anchor.set(0.5);
    btn.addChild(label);

    btn.on('pointerover', () => {
      g.clear();
      g.roundRect(-width / 2, -height / 2, width, height, 10);
      g.fill({ color: borderColor, alpha: 0.9 });
      g.roundRect(-width / 2, -height / 2, width, height, 10);
      g.stroke({ width: 2.5, color: 0xffffff });
      label.style.fill = '#ffffff';
      btn.scale.set(1.02);
    });

    btn.on('pointerout', () => {
      g.clear();
      g.roundRect(-width / 2, -height / 2, width, height, 10);
      g.fill({ color: bgColor, alpha: 0.95 });
      g.roundRect(-width / 2, -height / 2, width, height, 10);
      g.stroke({ width: 2, color: borderColor });
      label.style.fill = textColor;
      btn.scale.set(1.0);
    });

    btn.on('pointerdown', (e) => {
      e.stopPropagation();
      onClick?.();
    });

    parent.addChild(btn);
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
