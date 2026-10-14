import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { storage } from '../storage/StorageManager.js';
import { BackgroundStarfield } from '../vfx/BackgroundStarfield.js';
import { t, i18n } from '../core/i18n.js';

export class MenuScene {
  constructor() {
    this.engine = null;
    this.starfield = null;
    this.container = new Container();
    this._onLangChange = null;
  }

  async init(engine) {
    this.engine = engine;
    this.engine.uiLayer.addChild(this.container);

    // Starfield in background
    this.starfield = new BackgroundStarfield(this.engine);

    this._onLangChange = () => this.renderMenu();
    i18n.onChange(this._onLangChange);

    this.renderMenu();
  }

  renderMenu() {
    this.container.removeChildren();

    const w = this.engine.width;
    const h = this.engine.height;
    const cx = w / 2;

    // Language Toggle button in top right corner
    const langBtn = new Container();
    langBtn.x = w - 110;
    langBtn.y = 16;
    langBtn.eventMode = 'static';
    langBtn.cursor = 'pointer';
    langBtn.hitArea = new Rectangle(-6, -6, 102, 44);

    const langBg = new Graphics();
    langBg.roundRect(0, 0, 90, 32, 8);
    langBg.fill({ color: 0x1e293b, alpha: 0.85 });
    langBg.stroke({ width: 1.5, color: 0x38bdf8 });
    langBtn.addChild(langBg);

    const langText = new Text({
      text: i18n.getLanguage() === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#38bdf8'
      })
    });
    langText.anchor.set(0.5);
    langText.x = 45;
    langText.y = 16;
    langBtn.addChild(langText);

    langBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      i18n.toggleLanguage();
    });
    this.container.addChild(langBtn);

    // Title
    const titleSize = Math.min(48, Math.max(30, Math.floor(w * 0.055)));
    const title = new Text({
      text: t('menu.title'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: titleSize,
        fontWeight: '900',
        fill: '#00f0ff',
        dropShadow: { color: '#00f0ff', blur: 20, distance: 0 },
        letterSpacing: 4
      })
    });
    title.anchor.set(0.5);
    title.x = cx;
    title.y = Math.min(120, h * 0.18);
    this.container.addChild(title);

    const sub = new Text({
      text: t('menu.sub'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: Math.min(15, Math.max(12, Math.floor(w * 0.022))),
        fontWeight: 'bold',
        fill: '#38bdf8',
        letterSpacing: 2
      })
    });
    sub.anchor.set(0.5);
    sub.x = cx;
    sub.y = title.y + 45;
    this.container.addChild(sub);

    // Gameplay guide info box
    const infoW = Math.min(520, w - 36);
    const infoH = 175;
    const infoBox = new Container();
    infoBox.x = cx - infoW / 2;
    infoBox.y = sub.y + 40;

    const infoG = new Graphics();
    infoG.roundRect(0, 0, infoW, infoH, 14);
    infoG.fill({ color: 0x0f172a, alpha: 0.9 });
    infoG.stroke({ width: 1.5, color: 0x334155 });
    infoBox.addChild(infoG);

    const guidePoints = [
      t('menu.guide1'),
      t('menu.guide2'),
      t('menu.guide3'),
      t('menu.guide4'),
      t('menu.guide5'),
      t('menu.guide6')
    ];

    guidePoints.forEach((line, i) => {
      const lineText = new Text({
        text: line,
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: Math.min(13, Math.max(11, Math.floor(infoW * 0.026))),
          fill: '#cbd5e1',
          wordWrap: true,
          wordWrapWidth: infoW - 32,
          lineHeight: 20
        })
      });
      lineText.x = 16;
      lineText.y = 12 + i * 26;
      infoBox.addChild(lineText);
    });

    this.container.addChild(infoBox);

    // Start Game Button
    const btnW = Math.min(260, w - 48);
    const btnH = 56;
    const playBtn = new Container();
    playBtn.x = cx - btnW / 2;
    playBtn.y = infoBox.y + infoH + 35;
    playBtn.eventMode = 'static';
    playBtn.cursor = 'pointer';
    playBtn.hitArea = new Rectangle(0, 0, btnW, btnH);

    const pG = new Graphics();
    const renderBtnBg = (fillColor) => {
      pG.clear();
      pG.roundRect(0, 0, btnW, btnH, 14);
      pG.fill({ color: fillColor });
      pG.stroke({ width: 2, color: 0xffffff });
    };
    renderBtnBg(0x00f0ff);
    pG.eventMode = 'none';
    playBtn.addChild(pG);

    const playText = new Text({
      text: t('menu.start'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: '#030712',
        letterSpacing: 2
      })
    });
    playText.anchor.set(0.5);
    playText.x = btnW / 2;
    playText.y = btnH / 2;
    playText.eventMode = 'none';
    playBtn.addChild(playText);

    // Hover effect
    playBtn.on('pointerover', () => {
      renderBtnBg(0x38bdf8);
    });
    playBtn.on('pointerout', () => {
      renderBtnBg(0x00f0ff);
    });

    let hasStarted = false;
    const triggerStart = (e) => {
      if (e) {
        e.stopPropagation?.();
      }
      if (hasStarted) return;
      hasStarted = true;
      audio.playClick();
      audio.resumeContext();
      this.startGame();
    };

    playBtn.on('pointerdown', triggerStart);
    playBtn.on('pointertap', triggerStart);
    playBtn.on('click', triggerStart);
    this.container.addChild(playBtn);

    // High Score and Controls Hint
    const highScore = storage.getHighScore();
    const hint = new Text({
      text: t('menu.hint', { score: highScore.toLocaleString() }),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: Math.min(13, Math.max(10, Math.floor(w * 0.018))),
        fill: '#64748b',
        wordWrap: true,
        wordWrapWidth: w - 32,
        align: 'center'
      })
    });
    hint.anchor.set(0.5);
    hint.x = cx;
    hint.y = Math.min(h - 25, playBtn.y + 75);
    this.container.addChild(hint);
  }

  startGame() {
    console.log('[MenuScene] Starting game...');
    // Start game without pre-selected weapon so player picks 1 of 3 random starter weapons
    this.engine.sceneManager.loadScene('game').catch((err) => {
      console.error('[MenuScene] Error starting game:', err);
    });
  }

  update(dt) {
    if (this.starfield) {
      this.starfield.update(dt);
    }
  }

  destroy() {
    if (this._onLangChange) {
      i18n.offChange(this._onLangChange);
      this._onLangChange = null;
    }
    if (this.starfield) {
      this.starfield.destroy();
      this.starfield = null;
    }
    this.container.destroy({ children: true });
  }
}
