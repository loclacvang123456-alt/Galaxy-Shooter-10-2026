import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { WEAPON_DEFINITIONS } from '../weapons/WeaponRegistry.js';
import { i18n, t } from '../core/i18n.js';
import { renderIcon } from './IconRenderer.js';

export class HUD {
  constructor(engine, { onPauseClick } = {}) {
    this.engine = engine;
    this.onPauseClick = onPauseClick;
    this.container = new Container();
    this.engine.uiLayer.addChild(this.container);

    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.bossBannerTimer = 0;
    this.waveTransitionBanner = null;
    this.waveTransitionTimer = 0;
    this.setupTexts();
    this.setupButtons();

    this.unsubLang = i18n.onChange(() => this.onLanguageChanged());
  }

  onLanguageChanged() {
    this.weaponsLabel.text = t('hud.weapons');
    this.passivesLabel.text = t('hud.passives');
    if (this.bossWarningText) {
      this.bossWarningText.text = t('hud.boss_warning');
    }
    if (this.soulTitleText) {
      this.soulTitleText.text = t('hud.soul_title') || 'SOUL SIPHON';
    }
  }

  setupTexts() {
    const titleStyle = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: 13,
      fill: '#94a3b8',
      fontWeight: '600'
    });

    const valStyle = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: 16,
      fill: '#ffffff',
      fontWeight: 'bold'
    });

    this.levelText = new Text({
      text: t('hud.lv', { level: 1 }),
      style: new TextStyle({ fontFamily: 'system-ui, sans-serif', fontSize: 18, fill: '#00f0ff', fontWeight: 'bold' })
    });
    this.levelText.x = 24;
    this.levelText.y = 14;
    this.container.addChild(this.levelText);

    // Wave Text (TOP CENTER, CLEAN & FOCUSED)
    this.waveText = new Text({
      text: t('hud.wave', { wave: 1 }),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 20,
        fill: '#ffd700',
        fontWeight: 'bold',
        dropShadow: { color: '#ffd700', blur: 6, distance: 0 }
      })
    });
    this.waveText.anchor.set(0.5, 0);
    this.waveText.x = this.engine.width / 2;
    this.waveText.y = 14;
    this.container.addChild(this.waveText);

    // Score & Kills: Parked cleanly at top-right before the control buttons
    const rightOffset = this.engine.width - (36 + 12) * 4 - 30;

    this.scoreText = new Text({ text: t('hud.score', { score: '0' }), style: valStyle });
    this.scoreText.anchor.set(1, 0);
    this.scoreText.x = rightOffset;
    this.scoreText.y = 14;
    this.container.addChild(this.scoreText);

    this.killsText = new Text({ text: t('hud.kills', { kills: '0' }), style: titleStyle });
    this.killsText.anchor.set(1, 0);
    this.killsText.x = rightOffset;
    this.killsText.y = 36;
    this.container.addChild(this.killsText);

    // Dedicated Boss Health Bar Text (DOWN BELOW WAVE AT y = 48)
    this.bossBarText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fontWeight: '900',
        fill: '#ff0055',
        stroke: { color: '#000000', width: 3.5 },
        letterSpacing: 1,
        dropShadow: { color: '#ff0044', blur: 6, distance: 0 }
      })
    });
    this.bossBarText.anchor.set(0.5, 0);
    this.bossBarText.x = this.engine.width / 2;
    this.bossBarText.y = 48;
    this.bossBarText.visible = false;
    this.container.addChild(this.bossBarText);

    // Flashing Boss Warning Banner (MOVED DOWN TO y = 100)
    this.bossWarningBanner = new Container();
    this.bossWarningBanner.x = this.engine.width / 2;
    this.bossWarningBanner.y = 100;
    this.bossWarningBanner.visible = false;

    const bannerBg = new Graphics();
    bannerBg.roundRect(-240, -18, 480, 36, 8);
    bannerBg.fill({ color: 0x220505, alpha: 0.94 });
    bannerBg.stroke({ width: 2.5, color: 0xffea00 });
    this.bossWarningBanner.addChild(bannerBg);

    this.bossWarningText = new Text({
      text: t('hud.boss_warning'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 15,
        fontWeight: '900',
        fill: '#ffea00',
        stroke: { color: '#000000', width: 3.5 },
        dropShadow: { color: '#ff9900', blur: 10, distance: 0 },
        letterSpacing: 1.5
      })
    });
    this.bossWarningText.anchor.set(0.5);
    this.bossWarningBanner.addChild(this.bossWarningText);
    this.container.addChild(this.bossWarningBanner);

    // Section Labels (Bottom Left)
    const labelStyle = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: 10,
      fill: '#64748b',
      fontWeight: 'bold',
      letterSpacing: 1
    });

    this.weaponsLabel = new Text({ text: t('hud.weapons'), style: labelStyle });
    this.weaponsLabel.x = 24;
    this.weaponsLabel.y = this.engine.height - 98;
    this.container.addChild(this.weaponsLabel);

    this.passivesLabel = new Text({ text: t('hud.passives'), style: labelStyle });
    this.passivesLabel.x = 24;
    this.passivesLabel.y = this.engine.height - 52;
    this.container.addChild(this.passivesLabel);

    // 8. Soul Siphon Canister (Right-side Vertical Gauge)
    this.soulCanisterGroup = new Container();
    this.soulCanisterGroup.visible = false;
    this.container.addChild(this.soulCanisterGroup);

    this.soulGraphics = new Graphics();
    this.soulCanisterGroup.addChild(this.soulGraphics);

    this.soulTitleText = new Text({
      text: t('hud.soul_title') || 'SOUL SIPHON',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 10,
        fontWeight: '900',
        fill: '#f87171',
        stroke: { color: '#000000', width: 2.5 },
        letterSpacing: 1
      })
    });
    this.soulTitleText.anchor.set(0.5, 1);
    this.soulCanisterGroup.addChild(this.soulTitleText);

    this.soulStacksText = new Text({
      text: '0/15',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: '900',
        fill: '#ffffff',
        stroke: { color: '#000000', width: 3 }
      })
    });
    this.soulStacksText.anchor.set(0.5, 0.5);
    this.soulCanisterGroup.addChild(this.soulStacksText);

    this.soulBuffText = new Text({
      text: '+0.0% DMG',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 11,
        fontWeight: '900',
        fill: '#ffd700',
        stroke: { color: '#000000', width: 2.5 },
        dropShadow: { color: '#ffd700', blur: 4, distance: 0 }
      })
    });
    this.soulBuffText.anchor.set(0.5, 0);
    this.soulCanisterGroup.addChild(this.soulBuffText);

    this.soulFullText = new Text({
      text: '★ FULL ★',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 9,
        fontWeight: '900',
        fill: '#ff0055',
        stroke: { color: '#000000', width: 2 },
        letterSpacing: 0.8
      })
    });
    this.soulFullText.anchor.set(0.5, 0);
    this.soulCanisterGroup.addChild(this.soulFullText);
  }

  setupButtons() {
    const btnSize = 36;
    const padding = 16;
    const rightX = this.engine.width - padding - btnSize;

    // Fullscreen Button
    this.fsBtn = new Container();
    this.fsBtn.x = rightX;
    this.fsBtn.y = 16;
    this.fsBtn.eventMode = 'static';
    this.fsBtn.cursor = 'pointer';
    this.fsBtn.hitArea = new Rectangle(-8, -8, btnSize + 16, btnSize + 16);
    const fsG = new Graphics();
    fsG.roundRect(0, 0, btnSize, btnSize, 6);
    fsG.fill({ color: 0x1e293b, alpha: 0.8 });
    fsG.stroke({ width: 1.5, color: 0x475569 });
    fsG.rect(8, 8, 20, 20);
    fsG.stroke({ width: 2, color: 0x00f0ff });
    this.fsBtn.addChild(fsG);
    this.fsBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      this.engine.input.toggleFullscreen();
    });
    this.container.addChild(this.fsBtn);

    // Audio Button
    this.audioBtn = new Container();
    this.audioBtn.x = rightX - btnSize - 12;
    this.audioBtn.y = 16;
    this.audioBtn.eventMode = 'static';
    this.audioBtn.cursor = 'pointer';
    this.audioBtn.hitArea = new Rectangle(-8, -8, btnSize + 16, btnSize + 16);
    this.renderAudioBtn(false);
    this.audioBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      const muted = audio.toggleMute();
      this.renderAudioBtn(muted);
    });
    this.container.addChild(this.audioBtn);

    // Pause Button
    this.pauseBtn = new Container();
    this.pauseBtn.x = rightX - (btnSize + 12) * 2;
    this.pauseBtn.y = 16;
    this.pauseBtn.eventMode = 'static';
    this.pauseBtn.cursor = 'pointer';
    this.pauseBtn.hitArea = new Rectangle(-8, -8, btnSize + 16, btnSize + 16);
    const pG = new Graphics();
    pG.roundRect(0, 0, btnSize, btnSize, 6);
    pG.fill({ color: 0x1e293b, alpha: 0.8 });
    pG.stroke({ width: 1.5, color: 0x475569 });
    pG.rect(12, 10, 4, 16);
    pG.rect(20, 10, 4, 16);
    pG.fill({ color: 0xffffff });
    this.pauseBtn.addChild(pG);
    this.pauseBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      if (this.onPauseClick) {
        this.onPauseClick();
      } else {
        this.engine.togglePause();
      }
    });
    this.container.addChild(this.pauseBtn);

    // Balance Stats Button [B]
    this.statsBtn = new Container();
    this.statsBtn.x = rightX - (btnSize + 12) * 3;
    this.statsBtn.y = 16;
    this.statsBtn.eventMode = 'static';
    this.statsBtn.cursor = 'pointer';
    this.statsBtn.hitArea = new Rectangle(-8, -8, btnSize + 16, btnSize + 16);
    const stG = new Graphics();
    stG.roundRect(0, 0, btnSize, btnSize, 6);
    stG.fill({ color: 0x1e293b, alpha: 0.8 });
    stG.stroke({ width: 1.5, color: 0x0284c7 });
    stG.rect(10, 18, 4, 10);
    stG.rect(16, 12, 4, 16);
    stG.rect(22, 8, 4, 20);
    stG.fill({ color: 0x38bdf8 });
    this.statsBtn.addChild(stG);
    this.statsBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      this.engine.sceneManager.currentScene?.balancePanel?.toggle();
    });
    this.container.addChild(this.statsBtn);
  }

  renderAudioBtn(muted) {
    this.audioBtn.removeChildren();
    const g = new Graphics();
    g.roundRect(0, 0, 36, 36, 6);
    g.fill({ color: 0x1e293b, alpha: 0.8 });
    g.stroke({ width: 1.5, color: 0x475569 });

    g.poly([
      { x: 10, y: 14 },
      { x: 15, y: 14 },
      { x: 21, y: 9 },
      { x: 21, y: 27 },
      { x: 15, y: 22 },
      { x: 10, y: 22 }
    ]);
    g.fill({ color: muted ? 0xff4444 : 0x00f0ff });

    if (muted) {
      g.moveTo(24, 12);
      g.lineTo(28, 24);
      g.stroke({ width: 2.5, color: 0xff4444 });
    }
    this.audioBtn.addChild(g);
  }

  showWaveTransition(wave, isBoss) {
    if (this.waveTransitionBanner) {
      this.container.removeChild(this.waveTransitionBanner);
      this.waveTransitionBanner.destroy({ children: true });
      this.waveTransitionBanner = null;
    }

    const banner = new Container();
    banner.x = this.engine.width / 2;
    banner.y = 150;
    banner.alpha = 0;
    banner.scale.set(0.65);

    const isFirstWave = wave === 1;
    const bannerW = isBoss ? 500 : 430;
    const bannerH = isFirstWave ? 54 : 76;
    const accentColor = isBoss ? 0xff0055 : (isFirstWave ? 0x00f0ff : 0xffd700);

    const bg = new Graphics();
    // Outer neon glow stroke
    bg.roundRect(-bannerW / 2 - 2, -bannerH / 2 - 2, bannerW + 4, bannerH + 4, 14);
    bg.stroke({ width: 3.5, color: accentColor, alpha: 0.55 });
    // Dark core card
    bg.roundRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 12);
    bg.fill({ color: 0x030712, alpha: 0.94 });
    bg.roundRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 12);
    bg.stroke({ width: 1.8, color: accentColor, alpha: 0.95 });
    banner.addChild(bg);

    if (isFirstWave) {
      const startText = new Text({
        text: t('wave.start'),
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 16,
          fontWeight: '900',
          fill: '#00f0ff',
          letterSpacing: 1.5,
          dropShadow: { color: '#00f0ff', blur: 8, distance: 0 }
        })
      });
      startText.anchor.set(0.5);
      banner.addChild(startText);
    } else {
      const clearedText = new Text({
        text: t('wave.cleared', { wave: wave - 1 }),
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#10b981',
          letterSpacing: 1,
          dropShadow: { color: '#10b981', blur: 6, distance: 0 }
        })
      });
      clearedText.anchor.set(0.5);
      clearedText.y = -14;
      banner.addChild(clearedText);

      const nextText = new Text({
        text: isBoss ? t('wave.boss_incoming', { wave }) : t('wave.incoming', { wave }),
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 15,
          fontWeight: '900',
          fill: isBoss ? '#ff0055' : '#ffd700',
          letterSpacing: 1.2,
          dropShadow: { color: isBoss ? '#ff0055' : '#ffd700', blur: 8, distance: 0 }
        })
      });
      nextText.anchor.set(0.5);
      nextText.y = 14;
      banner.addChild(nextText);
    }

    this.container.addChild(banner);
    this.waveTransitionBanner = banner;
    this.waveTransitionTimer = 2.4;
  }

  showBossWarning() {
    this.bossBannerTimer = 5.0; // Flash for 5 seconds
    this.bossWarningBanner.visible = true;
  }

  update(turret, shield, xp, nextXp, level, score, kills, wave = 1, isBossWave = false, dt = 0.016, lightningPassive = null, blackHolePassive = null, activeBoss = null) {
    this.levelText.text = t('hud.lv', { level });
    this.scoreText.text = t('hud.score', { score: score.toLocaleString() });
    this.killsText.text = t('hud.kills', { kills });
    this.waveText.text = t('hud.wave', { wave });
    this.waveText.style.fill = isBossWave ? '#ff0055' : '#ffd700';

    if (this.bossBannerTimer > 0) {
      this.bossBannerTimer -= dt;
      this.bossWarningBanner.visible = Math.floor(this.bossBannerTimer * 4) % 2 === 0;
    } else {
      this.bossWarningBanner.visible = false;
    }

    if (this.waveTransitionBanner && this.waveTransitionTimer > 0) {
      this.waveTransitionTimer -= dt;
      const t = this.waveTransitionTimer;
      if (t > 2.05) {
        // Entrance: scale 0.65 -> 1.0, alpha 0 -> 1
        const progress = (2.4 - t) / 0.35;
        this.waveTransitionBanner.alpha = Math.min(1, progress);
        this.waveTransitionBanner.scale.set(0.65 + 0.35 * Math.sin(progress * Math.PI * 0.5));
      } else if (t <= 0.45) {
        // Exit fade out & lift
        this.waveTransitionBanner.alpha = Math.max(0, t / 0.45);
        this.waveTransitionBanner.y = 150 - (1 - t / 0.45) * 15;
      } else {
        this.waveTransitionBanner.alpha = 1;
        this.waveTransitionBanner.scale.set(1.0);
      }

      if (t <= 0) {
        this.container.removeChild(this.waveTransitionBanner);
        this.waveTransitionBanner.destroy({ children: true });
        this.waveTransitionBanner = null;
      }
    }

    this.graphics.clear();

    // 1. EXP Progress Bar (Full width top bar)
    const xpRatio = Math.min(1, xp / nextXp);
    this.graphics.rect(0, 0, this.engine.width, 6);
    this.graphics.fill({ color: 0x0f172a });
    this.graphics.rect(0, 0, this.engine.width * xpRatio, 6);
    this.graphics.fill({ color: 0x00f0ff });

    // 1b. Dedicated Mega Boss Health Bar (DOWN BELOW WAVE AT y = 68)
    if (activeBoss && activeBoss.isAlive) {
      const bRatio = Math.max(0, activeBoss.hp / activeBoss.maxHp);
      const bBarW = 380;
      const bBarH = 12;
      const bBarX = (this.engine.width - bBarW) / 2;
      const bBarY = 68;

      // Glow & Frame
      this.graphics.roundRect(bBarX - 2, bBarY - 2, bBarW + 4, bBarH + 4, 6);
      this.graphics.fill({ color: 0x450a0a, alpha: 0.75 });

      this.graphics.roundRect(bBarX, bBarY, bBarW, bBarH, 4);
      this.graphics.fill({ color: 0x0f172a, alpha: 0.95 });

      this.graphics.roundRect(bBarX, bBarY, bBarW * bRatio, bBarH, 4);
      this.graphics.fill({ color: 0xff0044 });

      this.graphics.roundRect(bBarX, bBarY, bBarW, bBarH, 4);
      this.graphics.stroke({ width: 1.5, color: 0xffea00 });

      const bossName = activeBoss.name || t('boss.' + activeBoss.type) || 'TITAN DREADNOUGHT';
      this.bossBarText.text = `★ ${bossName.toUpperCase()} ★ ${Math.ceil(activeBoss.hp)} / ${activeBoss.maxHp} (${Math.round(bRatio * 100)}%)`;
      this.bossBarText.visible = true;
    } else {
      this.bossBarText.visible = false;
    }

    // 2. Turret Health Bar
    const hpRatio = Math.max(0, turret.currentHp / turret.maxHp);
    const barW = 200;
    const barH = 12;
    const barX = 85;
    const barY = 22;

    this.graphics.roundRect(barX, barY, barW, barH, 4);
    this.graphics.fill({ color: 0x0f172a, alpha: 0.8 });
    this.graphics.roundRect(barX, barY, barW * hpRatio, barH, 4);
    this.graphics.fill({ color: hpRatio > 0.3 ? 0x10b981 : 0xef4444 });
    this.graphics.roundRect(barX, barY, barW, barH, 4);
    this.graphics.stroke({ width: 1.5, color: 0x334155 });

    // 3. Shield Health Bar
    const shieldRatio = Math.max(0, shield.currentHp / shield.maxHp);
    const sBarY = barY + 16;
    this.graphics.roundRect(barX, sBarY, barW, 8, 3);
    this.graphics.fill({ color: 0x0f172a, alpha: 0.8 });
    this.graphics.roundRect(barX, sBarY, barW * shieldRatio, 8, 3);
    this.graphics.fill({ color: 0x00e5ff });
    this.graphics.roundRect(barX, sBarY, barW, 8, 3);
    this.graphics.stroke({ width: 1, color: 0x0284c7 });

    // 4. ROW 1: EQUIPPED WEAPON SLOTS (Bottom Left)
    const slotStartX = 24;
    const wSlotY = this.engine.height - 84;
    const slotSize = 32;
    const slotGap = 10;

    for (let i = 0; i < 3; i++) {
      const sx = slotStartX + i * (slotSize + slotGap);
      const weapon = turret.equippedWeapons[i];

      this.graphics.roundRect(sx, wSlotY, slotSize, slotSize, 6);
      this.graphics.fill({ color: 0x1e293b, alpha: 0.85 });
      this.graphics.roundRect(sx, wSlotY, slotSize, slotSize, 6);
      this.graphics.stroke({ width: 1.5, color: weapon ? (weapon.tier === 5 ? 0xff0055 : 0x00f0ff) : 0x334155 });

      if (weapon) {
        const def = WEAPON_DEFINITIONS[weapon.id];

        // 3 Sub-upgrade horizontal progress bar chunks at top of slot (0/3, 1/3, 2/3, 3/3)
        if (weapon.tier < 5) {
          const subCount = weapon.subLevel || 0;
          const barW = slotSize - 8;
          const chunkW = (barW - 2 * 1.5) / 3;
          for (let s = 0; s < 3; s++) {
            const chX = sx + 4 + s * (chunkW + 1.5);
            const chY = wSlotY + 4;
            this.graphics.roundRect(chX, chY, chunkW, 2.5, 1);
            this.graphics.fill({ color: s < subCount ? 0xffd700 : 0x334155 });
          }
        }

        renderIcon(
          this.graphics,
          weapon.id,
          sx + slotSize / 2,
          wSlotY + slotSize / 2 + 1,
          8,
          weapon.tier === 5 ? 0xff0044 : (def?.color || 0xffffff)
        );

        // Major Tier pips (1 to 5) at bottom
        const pips = weapon.tier;
        const pipW = 4;
        const pipTotalW = pips * (pipW + 1.5) - 1.5;
        const pipStartX = sx + (slotSize - pipTotalW) / 2;
        for (let p = 0; p < pips; p++) {
          this.graphics.rect(pipStartX + p * (pipW + 1.5), wSlotY + slotSize - 6, pipW, 2.5);
          this.graphics.fill({ color: p === 4 ? 0xff0044 : 0x00ff66 });
        }

        // Fusion status indicators (2 sockets: weapon fusion & passive fusion)
        const hasWSyn = turret.hasWeaponSynergy(weapon.id);
        const hasPSyn = turret.hasPassiveSynergy(weapon.id);

        // Socket 1: Weapon Fusion (gold)
        this.graphics.circle(sx + slotSize - 6, wSlotY + 7, 2.5);
        this.graphics.fill({ color: hasWSyn ? 0xffd700 : 0x334155 });
        if (hasWSyn) {
          this.graphics.circle(sx + slotSize - 6, wSlotY + 7, 3.8);
          this.graphics.stroke({ width: 1, color: 0xffea00, alpha: 0.85 });
        }

        // Socket 2: Passive Fusion (cyan)
        this.graphics.circle(sx + slotSize - 13, wSlotY + 7, 2.5);
        this.graphics.fill({ color: hasPSyn ? 0x00f0ff : 0x334155 });
        if (hasPSyn) {
          this.graphics.circle(sx + slotSize - 13, wSlotY + 7, 3.8);
          this.graphics.stroke({ width: 1, color: 0x38bdf8, alpha: 0.85 });
        }
      }
    }

    // 5. ROW 2: SUPPORT PASSIVES SLOTS (Placed directly under weapon slots)
    const pSlotY = this.engine.height - 38;

    let passivesList = [
      { id: 'shield', name: 'SHIELD', tier: shield.tier || 1, maxTier: 5, color: 0x00e5ff }
    ];

    if (lightningPassive && typeof lightningPassive === 'object' && !('tier' in lightningPassive)) {
      // Received passives map
      for (const [pId, pInstance] of Object.entries(lightningPassive)) {
        if (pInstance && pInstance.tier > 0) {
          passivesList.push({
            id: pId,
            tier: pInstance.tier,
            maxTier: 5,
            color: pId.includes('chrono') ? 0x00f0ff
                 : pId.includes('nanite') ? 0x10b981
                 : pId.includes('quantum') ? 0x10b981
                 : pId.includes('overcharge') ? 0xffea00
                 : pId.includes('repulsor') ? 0x38bdf8
                 : pId.includes('vampiric') ? 0xef4444
                 : pId.includes('lightning') ? 0xffea00
                 : 0x9d4edd
          });
        }
      }
    } else {
      if (lightningPassive && lightningPassive.tier > 0) {
        passivesList.push({ id: 'passive_lightning', tier: lightningPassive.tier, maxTier: 5, color: 0xffea00 });
      }
      if (blackHolePassive && blackHolePassive.tier > 0) {
        passivesList.push({ id: 'passive_black_hole', tier: blackHolePassive.tier, maxTier: 5, color: 0x9d4edd });
      }
    }

    // Exactly 5 passive slots
    while (passivesList.length < 5) {
      passivesList.push({ id: 'locked', tier: 0, maxTier: 5, color: 0x475569 });
    }
    passivesList = passivesList.slice(0, 5);

    for (let i = 0; i < 5; i++) {
      const px = slotStartX + i * (slotSize + slotGap);
      const pData = passivesList[i];
      const isUnlocked = pData.tier > 0;
      const isMax = pData.tier >= 5;

      this.graphics.roundRect(px, pSlotY, slotSize, slotSize, 6);
      this.graphics.fill({ color: 0x0f172a, alpha: isUnlocked ? 0.9 : 0.45 });
      this.graphics.roundRect(px, pSlotY, slotSize, slotSize, 6);
      this.graphics.stroke({ width: 1.5, color: isUnlocked ? (isMax ? 0xff0055 : pData.color) : 0x334155 });

      const cx = px + slotSize / 2;
      const cy = pSlotY + slotSize / 2 - 3;

      if (isUnlocked) {
        renderIcon(this.graphics, pData.id, cx, cy, 7.5, isMax ? 0xff0055 : pData.color);
      } else {
        renderIcon(this.graphics, 'locked', cx, cy, 5.5, 0x475569);
      }

      // Passive Tier Pips (Underneath icon)
      if (isUnlocked) {
        const pips = pData.tier;
        const pipW = 4;
        const pipTotalW = pips * (pipW + 1.5) - 1.5;
        const pipStartX = px + (slotSize - pipTotalW) / 2;
        for (let p = 0; p < pips; p++) {
          this.graphics.rect(pipStartX + p * (pipW + 1.5), pSlotY + slotSize - 6, pipW, 2.5);
          this.graphics.fill({ color: p === 4 ? 0xff0044 : pData.color });
        }
      }
    }

    // 6. Render Soul Siphon Canister Gauge on the right
    const vampiric = (lightningPassive && typeof lightningPassive === 'object' && lightningPassive['passive_vampiric'])
      || this.engine.sceneManager.currentScene?.vampiricPassive;
    this.renderSoulCanister(vampiric, dt);
  }

  renderSoulCanister(vampiric, dt) {
    if (!vampiric || vampiric.tier <= 0) {
      this.soulCanisterGroup.visible = false;
      return;
    }

    this.soulCanisterGroup.visible = true;
    this.soulAnimTimer = (this.soulAnimTimer || 0) + dt;

    const canW = 48;
    const canH = 145;
    const canX = this.engine.width - 68;
    const canY = Math.round(this.engine.height / 2 - canH / 2);

    const stacks = vampiric.stacks || 0;
    const maxStacks = vampiric.maxStacks || (10 + vampiric.tier * 5);
    const fillRatio = Math.min(1, Math.max(0, stacks / maxStacks));
    const isFull = stacks >= maxStacks;
    const dmgPct = (stacks * 2.5).toFixed(1);
    const pulse = 0.5 + Math.sin(this.soulAnimTimer * 7) * 0.5;

    this.soulGraphics.clear();

    // 1. Canister Outer Glow (Radiates intensely when full or filling)
    if (isFull) {
      this.soulGraphics.roundRect(canX - 6, canY - 6, canW + 12, canH + 12, 16);
      this.soulGraphics.fill({ color: 0xff0044, alpha: 0.28 * pulse });
      this.soulGraphics.stroke({ width: 2.5, color: 0xff0055, alpha: 0.85 * pulse });
    } else if (fillRatio > 0) {
      this.soulGraphics.roundRect(canX - 3, canY - 3, canW + 6, canH + 6, 13);
      this.soulGraphics.fill({ color: 0xef4444, alpha: 0.12 * fillRatio });
    }

    // 2. Metallic Top Cap / Valve
    this.soulGraphics.roundRect(canX + 8, canY - 10, canW - 16, 9, 3);
    this.soulGraphics.fill({ color: 0x1e293b });
    this.soulGraphics.stroke({ width: 1.5, color: isFull ? 0xff0055 : 0xef4444 });
    // Intake nozzle
    this.soulGraphics.circle(canX + canW / 2, canY - 13, 3);
    this.soulGraphics.fill({ color: isFull ? 0xff0055 : 0xef4444 });

    // 3. Metallic Bottom Base Pedestal
    this.soulGraphics.roundRect(canX + 4, canY + canH + 1, canW - 8, 8, 3);
    this.soulGraphics.fill({ color: 0x1e293b });
    this.soulGraphics.stroke({ width: 1.5, color: 0x475569 });

    // 4. Glass Chamber Flask Body
    this.soulGraphics.roundRect(canX, canY, canW, canH, 10);
    this.soulGraphics.fill({ color: 0x070b16, alpha: 0.92 });
    this.soulGraphics.stroke({ width: 2, color: isFull ? (pulse > 0.5 ? 0xffea00 : 0xff0055) : 0x334155 });

    // 5. Graduation Tick Marks (25%, 50%, 75%, 100%)
    const ticks = [0.25, 0.5, 0.75, 1.0];
    for (const t of ticks) {
      const ty = canY + canH - 4 - (canH - 8) * t;
      this.soulGraphics.moveTo(canX + 3, ty);
      this.soulGraphics.lineTo(canX + 9, ty);
      this.soulGraphics.stroke({ width: 1.5, color: 0x94a3b8, alpha: 0.55 });

      this.soulGraphics.moveTo(canX + canW - 9, ty);
      this.soulGraphics.lineTo(canX + canW - 3, ty);
      this.soulGraphics.stroke({ width: 1.5, color: 0x94a3b8, alpha: 0.55 });
    }

    // 6. Liquid Soul Essence Fill (Dâng lên theo số lượng linh hồn)
    if (fillRatio > 0) {
      const innerW = canW - 6;
      const liquidMaxH = canH - 6;
      const liquidH = Math.max(6, liquidMaxH * fillRatio);
      const liquidY = canY + canH - 3 - liquidH;

      // Main liquid volume
      this.soulGraphics.roundRect(canX + 3, liquidY, innerW, liquidH, 7);
      this.soulGraphics.fill({ color: isFull ? 0xff0044 : 0xdc2626, alpha: 0.9 });

      // Inner liquid luminance gradient
      this.soulGraphics.roundRect(canX + 6, liquidY + 2, innerW - 6, liquidH - 4, 5);
      this.soulGraphics.fill({ color: isFull ? 0xff3366 : 0xef4444, alpha: 0.45 });

      // Meniscus / Wavy bubbling surface
      const wave = Math.sin(this.soulAnimTimer * 5.5) * 1.8;
      this.soulGraphics.moveTo(canX + 4, liquidY + wave);
      this.soulGraphics.lineTo(canX + canW - 4, liquidY - wave);
      this.soulGraphics.stroke({ width: 2.2, color: 0xfca5a5, alpha: 0.95 });

      // Rising spirit bubbles inside the liquid
      for (let b = 0; b < 3; b++) {
        const bProgress = ((this.soulAnimTimer * 0.45 + b * 0.33) % 1.0);
        const by = (canY + canH - 6) - bProgress * (liquidH - 8);
        const bx = canX + 12 + ((b * 12 + Math.sin(this.soulAnimTimer * 4 + b) * 6) % (canW - 24));
        if (by >= liquidY + 4 && by <= canY + canH - 6) {
          this.soulGraphics.circle(bx, by, 2.2);
          this.soulGraphics.fill({ color: 0xffffff, alpha: 0.75 });
        }
      }
    }

    // 7. Glass Specular Reflection Streak
    this.soulGraphics.moveTo(canX + 5, canY + 8);
    this.soulGraphics.lineTo(canX + 5, canY + canH - 8);
    this.soulGraphics.stroke({ width: 2, color: 0xffffff, alpha: 0.25 });

    // 8. Texts & Labels Update
    this.soulTitleText.x = canX + canW / 2;
    this.soulTitleText.y = canY - 14;
    this.soulTitleText.text = t('hud.soul_title') || 'SOUL SIPHON';

    this.soulStacksText.x = canX + canW / 2;
    this.soulStacksText.y = canY + canH / 2;
    this.soulStacksText.text = `${stacks}/${maxStacks}`;
    this.soulStacksText.style.fill = isFull ? '#ffd700' : '#ffffff';

    this.soulBuffText.x = canX + canW / 2;
    this.soulBuffText.y = canY + canH + 13;
    this.soulBuffText.text = `+${dmgPct}% DMG`;
    this.soulBuffText.style.fill = isFull ? '#ffea00' : '#ffd700';

    if (isFull) {
      this.soulFullText.visible = true;
      this.soulFullText.x = canX + canW / 2;
      this.soulFullText.y = canY + canH + 28;
      this.soulFullText.text = t('hud.soul_full') || '★ MAX OVERDRIVE ★';
      this.soulFullText.style.fill = pulse > 0.5 ? '#ffd700' : '#ff0055';
    } else if (stacks > 0 && vampiric.stackTimer <= 2.0) {
      // Show subtle decaying warning
      this.soulFullText.visible = true;
      this.soulFullText.x = canX + canW / 2;
      this.soulFullText.y = canY + canH + 28;
      this.soulFullText.text = `▼ ${vampiric.stackTimer.toFixed(1)}s`;
      this.soulFullText.style.fill = '#f87171';
    } else {
      this.soulFullText.visible = false;
    }
  }

  destroy() {
    this.unsubLang?.();
    this.container.destroy({ children: true });
  }
}
