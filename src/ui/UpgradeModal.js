import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { sdk } from '../sdk/SDKManager.js';
import {
  WEAPON_DEFINITIONS,
  PASSIVE_DEFINITIONS,
  WEAPON_TYPES,
  PASSIVE_TYPES,
  getSynergy,
  getPassiveSynergy,
  getUpgradeDesc,
  getUpgradeSubtitle
} from '../weapons/WeaponRegistry.js';
import { t, i18n } from '../core/i18n.js';
import { renderIcon } from './IconRenderer.js';
import { glowVFX } from '../vfx/GlowVFX.js';

export class UpgradeModal {
  constructor(engine, onUpgradeSelected) {
    this.engine = engine;
    this.onUpgradeSelected = onUpgradeSelected;
    this.container = new Container();
    this.container.visible = false;
    this.engine.uiLayer.addChild(this.container);

    this.cardWidth = 260;
    this.cardHeight = 380;
    this.animId = null;
  }

  show(turret, shield, passivesOrLightning, blackHole) {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    this.container.removeChildren();
    this.container.visible = true;

    this.lastTurret = turret;
    this.lastShield = shield;
    this.lastPassives = passivesOrLightning;
    this.lastLightning = passivesOrLightning;
    this.lastBlackHole = blackHole;

    // Dim background overlay
    const bg = new Graphics();
    bg.rect(0, 0, this.engine.width, this.engine.height);
    bg.fill({ color: 0x030712, alpha: 0.85 });
    bg.eventMode = 'static'; // Block clicks to game world
    this.container.addChild(bg);

    // Title
    const title = new Text({
      text: t('upgrade.title'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#00f0ff',
        dropShadow: { color: '#00f0ff', blur: 10, distance: 0 }
      })
    });
    title.anchor.set(0.5);
    title.x = this.engine.width / 2;
    title.y = 70;
    this.container.addChild(title);

    // Generate 3 choices
    const choices = this.generateChoices(turret, shield, passivesOrLightning, blackHole);
    const startX = (this.engine.width - (3 * this.cardWidth + 2 * 24)) / 2;
    const cardY = Math.round((this.engine.height - this.cardHeight) / 2) + 5;

    const renderedCards = [];
    choices.forEach((choice, index) => {
      const cardX = startX + index * (this.cardWidth + 24);
      const card = this.renderCard(choice, cardX, cardY);
      renderedCards.push({
        card,
        targetX: cardX + this.cardWidth / 2,
        targetY: cardY + this.cardHeight / 2,
        index
      });
    });

    // Rewarded Ad: Reroll Button (Monetization)
    const rerollBtn = new Container();
    rerollBtn.x = this.engine.width / 2;
    rerollBtn.y = cardY + this.cardHeight + 28;
    rerollBtn.eventMode = 'static';
    rerollBtn.cursor = 'pointer';

    const rrBg = new Graphics();
    rrBg.roundRect(-160, -18, 320, 36, 18);
    rrBg.fill({ color: 0x1e293b, alpha: 0.95 });
    rrBg.roundRect(-160, -18, 320, 36, 18);
    rrBg.stroke({ width: 1.5, color: 0x38bdf8 });
    rerollBtn.addChild(rrBg);

    const rrText = new Text({
      text: t('upgrade.reroll'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#38bdf8'
      })
    });
    rrText.anchor.set(0.5);
    rerollBtn.addChild(rrText);

    rerollBtn.on('pointerover', () => {
      rrBg.clear();
      rrBg.roundRect(-160, -18, 320, 36, 18);
      rrBg.fill({ color: 0x0284c7 });
      rrBg.stroke({ width: 2, color: 0xffffff });
      rrText.style.fill = '#ffffff';
    });
    rerollBtn.on('pointerout', () => {
      rrBg.clear();
      rrBg.roundRect(-160, -18, 320, 36, 18);
      rrBg.fill({ color: 0x1e293b, alpha: 0.95 });
      rrBg.stroke({ width: 1.5, color: 0x38bdf8 });
      rrText.style.fill = '#38bdf8';
    });

    rerollBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      sdk.showRewarded({
        onReward: () => {
          this.show(this.lastTurret, this.lastShield, this.lastPassives, this.lastBlackHole);
        }
      });
    });
    this.container.addChild(rerollBtn);

    // ============================================
    // ENTRANCE ANIMATION: Cards swoop in with stagger
    // ============================================
    const cardAnims = renderedCards.map((rc, idx) => {
      const startDx = idx === 0 ? -220 : idx === 2 ? 220 : 0;
      const startDy = idx === 1 ? 280 : 230;
      const startRot = idx === 0 ? -0.15 : idx === 2 ? 0.15 : 0;

      rc.card.x = rc.targetX + startDx;
      rc.card.y = rc.targetY + startDy;
      rc.card.rotation = startRot;
      rc.card.scale.set(0.55);
      rc.card.alpha = 0;

      return {
        ...rc,
        startDx,
        startDy,
        startRot,
        delay: idx * 75, // Stagger 75ms
        duration: 320,
        soundPlayed: false
      };
    });

    rerollBtn.alpha = 0;
    rerollBtn.scale.set(0.7);

    const animStartTime = performance.now();
    const totalAnimDuration = 2 * 75 + 320 + 160;

    const animateCards = (now) => {
      const elapsed = now - animStartTime;
      let allDone = true;

      for (const item of cardAnims) {
        if (elapsed < item.delay) {
          allDone = false;
          continue;
        }

        if (!item.soundPlayed) {
          item.soundPlayed = true;
          audio.playClick();
        }

        const p = Math.min(1, (elapsed - item.delay) / item.duration);
        if (p < 1) allDone = false;

        // Dynamic elastic bounce overshoot
        const c1 = 1.35;
        const c3 = c1 + 1;
        const ease = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);

        item.card.x = item.targetX + item.startDx * (1 - p);
        item.card.y = item.targetY + item.startDy * (1 - ease);
        item.card.rotation = item.startRot * (1 - p);
        item.card.scale.set(0.55 + 0.45 * ease);
        item.card.alpha = Math.min(1, p * 1.8);

        if (p >= 1) {
          item.card.x = item.targetX;
          item.card.y = item.targetY;
          item.card.rotation = 0;
          item.card.scale.set(1.0);
          item.card.alpha = 1;
        }
      }

      // Reroll button entrance
      if (elapsed > 200) {
        const rp = Math.min(1, (elapsed - 200) / 220);
        rerollBtn.alpha = rp;
        rerollBtn.scale.set(0.7 + 0.3 * rp);
      }

      // Continuously update twinkling sparkle stars
      for (const item of cardAnims) {
        if (item.card.updateSparkles) {
          item.card.updateSparkles(now);
        }
      }

      if (!allDone || elapsed < totalAnimDuration) {
        this.animId = requestAnimationFrame(animateCards);
      } else {
        rerollBtn.alpha = 1;
        rerollBtn.scale.set(1.0);
        // Continue animation loop for sparkling cards while modal is visible
        const hasSparkles = cardAnims.some(item => !!item.card.updateSparkles);
        if (hasSparkles && this.container.visible) {
          this.animId = requestAnimationFrame(animateCards);
        } else {
          this.animId = null;
        }
      }
    };

    this.animId = requestAnimationFrame(animateCards);
  }

  generateChoices(turret, shield, passivesOrLightning, blackHole) {
    const candidates = [];
    const equippedIds = turret.equippedWeapons.map(w => w.id);

    // Normalize passives map
    let passives = {};
    if (passivesOrLightning && typeof passivesOrLightning === 'object' && !('tier' in passivesOrLightning)) {
      passives = passivesOrLightning;
    } else {
      passives = {
        [PASSIVE_TYPES.LIGHTNING]: passivesOrLightning,
        [PASSIVE_TYPES.BLACK_HOLE]: blackHole
      };
    }

    // 0. CHECK FOR READY SYNERGIES (Weapon + Weapon & Weapon + Passive)
    const synergyCandidates = [];
    const highTierWeapons = turret.equippedWeapons.filter(w => w.tier >= 4);

    // Weapon + Weapon fusions: Available when both weapons are >= Tier 4 and at least one is Tier 5
    // RULE: Each weapon can only fuse with at most 1 other weapon in a match!
    for (let i = 0; i < highTierWeapons.length; i++) {
      for (let j = i + 1; j < highTierWeapons.length; j++) {
        const w1 = highTierWeapons[i];
        const w2 = highTierWeapons[j];

        if (turret.hasWeaponSynergy?.(w1.id) || turret.hasWeaponSynergy?.(w2.id)) {
          continue;
        }

        if (w1.tier === 5 || w2.tier === 5) {
          const syn = getSynergy(w1.id, w2.id);
          if (syn && !turret.hasSynergy(syn.id)) {
            synergyCandidates.push({
              type: 'synergy',
              id: syn.id,
              syn: syn,
              name: t('upgrade.fusion_prefix', { name: syn.name }),
              subtitle: `[${getUpgradeSubtitle(syn)}]`,
              desc: getUpgradeDesc(syn),
              color: syn.color || 0xffd700,
              isSynergy: true
            });
          }
        }
      }
    }

    // Weapon + Passive fusions: Available if weapon is >= Tier 4 and passive is active (Tier >= 1)
    // RULE: Each weapon can only fuse with at most 1 passive in a match!
    const activePassives = [];
    if (shield && shield.tier >= 1) activePassives.push({ id: PASSIVE_TYPES.SHIELD, name: 'SHIELD' });
    for (const [pId, pInstance] of Object.entries(passives)) {
      if (pInstance && pInstance.tier >= 1) {
        activePassives.push({ id: pId, name: pId });
      }
    }

    for (const weapon of highTierWeapons) {
      if (turret.hasPassiveSynergy?.(weapon.id)) {
        continue;
      }

      for (const p of activePassives) {
        const pSyn = getPassiveSynergy(weapon.id, p.id);
        if (pSyn && !turret.hasSynergy(pSyn.id)) {
          synergyCandidates.push({
            type: 'synergy',
            id: pSyn.id,
            syn: pSyn,
            name: t('upgrade.synergy_prefix', { name: pSyn.name }),
            subtitle: `[${getUpgradeSubtitle(pSyn)}]`,
            desc: getUpgradeDesc(pSyn),
            color: pSyn.color || 0xffd700,
            isSynergy: true
          });
        }
      }
    }

    // 1. Upgrade existing equipped weapons (if < Tier 5)
    for (const weapon of turret.equippedWeapons) {
      if (weapon.tier < 5) {
        const def = WEAPON_DEFINITIONS[weapon.id];
        if (weapon.subLevel < weapon.maxSubLevel) {
          // Sub-upgrade stage (0/3, 1/3, 2/3)
          candidates.push({
            type: 'weapon_sub_upgrade',
            id: weapon.id,
            name: `${def.name} (Tier ${weapon.tier})`,
            subtitle: t('upgrade.progress', { n: weapon.subLevel, max: weapon.maxSubLevel }),
            desc: t('upgrade.minor_desc'),
            color: def.color,
            subOptions: def.subOptions || [],
            weapon: weapon
          });
        } else {
          // Major Tier Evolution (Keep weapon color & icon, styled with golden shimmering border)
          const nextTier = weapon.tier + 1;
          const tierInfo = def.tiers[nextTier - 1];
          candidates.push({
            type: 'weapon_major_upgrade',
            id: weapon.id,
            name: `${tierInfo.name}`,
            subtitle: t('upgrade.evolve_tier', { tier: nextTier }),
            desc: getUpgradeDesc(tierInfo),
            color: def.color,
            tier: nextTier,
            weapon: weapon
          });
        }
      }
    }

    // 2. Equip new weapons (if slots < 3)
    if (turret.equippedWeapons.length < 3) {
      const allWeaponIds = Object.values(WEAPON_TYPES);
      const unequipped = allWeaponIds.filter(id => !equippedIds.includes(id));
      for (const id of unequipped) {
        const def = WEAPON_DEFINITIONS[id];
        const tierInfo = def.tiers[0];
        candidates.push({
          type: 'weapon_new',
          id: id,
          name: t('upgrade.new_weapon', { name: def.name }),
          subtitle: tierInfo.name,
          desc: getUpgradeDesc(tierInfo),
          color: def.color,
          tier: 1
        });
      }
    }

    // 3. Support Passives
    // Shield
    if (shield && shield.tier < 5) {
      const def = PASSIVE_DEFINITIONS[PASSIVE_TYPES.SHIELD];
      const nextTier = shield.tier + 1;
      const tierInfo = def.tiers[nextTier - 1];
      candidates.push({
        type: 'passive_shield',
        id: PASSIVE_TYPES.SHIELD,
        name: nextTier === 1 ? t('upgrade.new_weapon', { name: def.name }) : `${def.name} Tier ${nextTier}`,
        subtitle: tierInfo.name,
        desc: getUpgradeDesc(tierInfo),
        color: def.color,
        tier: nextTier
      });
    }

    // All registered passives from PASSIVE_DEFINITIONS (Max 5 passives total)
    const isMaxPassivesReached = activePassives.length >= 5;
    for (const [pId, def] of Object.entries(PASSIVE_DEFINITIONS)) {
      if (pId === PASSIVE_TYPES.SHIELD) continue;
      const pInstance = passives[pId];
      const currentTier = pInstance ? pInstance.tier : 0;

      // When player reached 5 passives, only allow upgrading owned passives (currentTier > 0)
      if (currentTier === 0 && isMaxPassivesReached) {
        continue;
      }

      if (currentTier < 5) {
        const nextTier = currentTier + 1;
        const tierInfo = def.tiers[nextTier - 1];
        candidates.push({
          type: pId,
          id: pId,
          name: nextTier === 1 ? t('upgrade.new_weapon', { name: def.name }) : `${def.name} Tier ${nextTier}`,
          subtitle: tierInfo.name,
          desc: getUpgradeDesc(tierInfo),
          color: def.color,
          tier: nextTier
        });
      }
    }

    // Fallback if player maxed everything and no synergies left
    if (candidates.length === 0 && synergyCandidates.length === 0) {
      candidates.push({
        type: 'overdrive_bonus',
        id: 'overdrive',
        name: t('upgrade.overdrive_title'),
        subtitle: t('upgrade.overdrive_sub'),
        desc: t('upgrade.overdrive_desc'),
        color: 0x00f0ff
      });
    }

    const result = [];

    // GUARANTEE: If any synergy is ready, ALWAYS put at least 1 synergy card in the choices!
    if (synergyCandidates.length > 0) {
      const luckySynIdx = Math.floor(Math.random() * synergyCandidates.length);
      result.push(synergyCandidates.splice(luckySynIdx, 1)[0]);
      if (synergyCandidates.length > 0 && Math.random() < 0.4) {
        result.push(synergyCandidates.pop());
      }
    }

    // If player has fewer than 3 weapons, guarantee at least 1 new weapon choice
    const newWeapons = candidates.filter(c => c.type === 'weapon_new');
    if (newWeapons.length > 0 && turret.equippedWeapons.length < 3 && result.length < 3) {
      const luckyIdx = Math.floor(Math.random() * newWeapons.length);
      result.push(newWeapons.splice(luckyIdx, 1)[0]);
    }

    // Fill remaining slots
    const pool = candidates.filter(c => !result.includes(c)).sort(() => 0.5 - Math.random());
    while (result.length < 3 && pool.length > 0) {
      result.push(pool.pop());
    }

    return result.sort(() => 0.5 - Math.random());
  }

  renderCard(choice, x, y) {
    const card = new Container();
    card.pivot.set(this.cardWidth / 2, this.cardHeight / 2);
    const targetX = x + this.cardWidth / 2;
    const targetY = y + this.cardHeight / 2;
    card.x = targetX;
    card.y = targetY;
    card.eventMode = 'static';

    const isSubUpgrade = choice.type === 'weapon_sub_upgrade';
    const isMajorEvolution = choice.type === 'weapon_major_upgrade';
    const isSynergy = choice.type === 'synergy';
    const isSpecial = isMajorEvolution || isSynergy;

    const bgG = new Graphics();
    bgG.roundRect(0, 0, this.cardWidth, this.cardHeight, 14);
    bgG.fill({ color: isSynergy ? 0x221300 : isMajorEvolution ? 0x181024 : 0x0f172a });

    let halo = null;
    let starFlare = null;
    let topStreak = null;

    if (isMajorEvolution) {
      // 1. Additive Golden Bloom Halo (Behind card)
      halo = glowVFX.createGlowSprite(this.cardWidth * 1.35, 0xffd700, 0.45);
      halo.x = this.cardWidth / 2;
      halo.y = this.cardHeight / 2;
      card.addChild(halo);

      // 2. Sparkling Golden Borders with Twinkling Stars
      bgG.roundRect(0, 0, this.cardWidth, this.cardHeight, 14);
      bgG.stroke({ width: 3.5, color: 0xffd700 });
      bgG.roundRect(2.5, 2.5, this.cardWidth - 5, this.cardHeight - 5, 12);
      bgG.stroke({ width: 1.5, color: 0xfff08a, alpha: 0.75 });

      // Twinkling stars sparkle graphics
      const sparklesG = new Graphics();
      card.addChild(sparklesG);

      const cw = this.cardWidth;
      const ch = this.cardHeight;
      const stars = [
        { x: 10, y: 10, phase: 0.0, speed: 1.2, baseSize: 1.1 },
        { x: cw - 10, y: 10, phase: 1.5, speed: 1.0, baseSize: 1.1 },
        { x: cw - 10, y: ch - 10, phase: 3.1, speed: 1.3, baseSize: 1.1 },
        { x: 10, y: ch - 10, phase: 4.7, speed: 0.9, baseSize: 1.1 },
        { x: cw * 0.32, y: 2, phase: 0.8, speed: 1.1, baseSize: 0.9 },
        { x: cw * 0.68, y: 2, phase: 2.4, speed: 1.4, baseSize: 1.0 },
        { x: cw * 0.35, y: ch - 2, phase: 1.9, speed: 1.2, baseSize: 0.9 },
        { x: cw * 0.65, y: ch - 2, phase: 4.2, speed: 1.0, baseSize: 1.0 },
        { x: 2, y: ch * 0.35, phase: 2.8, speed: 1.3, baseSize: 0.85 },
        { x: 2, y: ch * 0.72, phase: 5.1, speed: 1.1, baseSize: 0.9 },
        { x: cw - 2, y: ch * 0.35, phase: 0.4, speed: 1.0, baseSize: 0.85 },
        { x: cw - 2, y: ch * 0.72, phase: 3.7, speed: 1.2, baseSize: 0.9 }
      ];

      card.updateSparkles = (now) => {
        if (halo) {
          halo.alpha = 0.35 + 0.15 * Math.sin(now * 0.005);
        }
        if (starFlare) {
          starFlare.rotation = now * 0.001;
        }
        if (topStreak) {
          topStreak.scale.x = 1.0 + 0.12 * Math.sin(now * 0.006);
        }

        sparklesG.clear();
        for (const star of stars) {
          const t = now * 0.0035 * star.speed + star.phase;
          const sinVal = Math.sin(t);
          if (sinVal <= 0.08) continue;
          const alpha = Math.min(1, Math.pow(sinVal, 1.8) * 1.25);
          const rad = (4.5 + 6.5 * Math.pow(sinVal, 2)) * star.baseSize;

          sparklesG.moveTo(star.x - rad, star.y);
          sparklesG.lineTo(star.x - rad * 0.25, star.y - rad * 0.25);
          sparklesG.lineTo(star.x, star.y - rad);
          sparklesG.lineTo(star.x + rad * 0.25, star.y - rad * 0.25);
          sparklesG.lineTo(star.x + rad, star.y);
          sparklesG.lineTo(star.x + rad * 0.25, star.y + rad * 0.25);
          sparklesG.lineTo(star.x, star.y + rad);
          sparklesG.lineTo(star.x - rad * 0.25, star.y + rad * 0.25);
          sparklesG.lineTo(star.x - rad, star.y);
          sparklesG.fill({ color: 0xffea00, alpha });

          sparklesG.circle(star.x, star.y, Math.max(1, rad * 0.32));
          sparklesG.fill({ color: 0xffffff, alpha });
        }
      };
    } else {
      bgG.roundRect(0, 0, this.cardWidth, this.cardHeight, 14);
      bgG.stroke({ width: isSynergy ? 3.5 : 2, color: choice.color, alpha: 1 });
    }

    // Icon Circle Badge
    const iconCy = 46;
    bgG.circle(this.cardWidth / 2, iconCy, 24);
    bgG.fill({ color: isSynergy ? 0x3d2703 : 0x1e293b });
    bgG.circle(this.cardWidth / 2, iconCy, 24);
    bgG.stroke({ width: 1.8, color: choice.color });

    // Render Standard Distinct Icon
    renderIcon(bgG, choice.id, this.cardWidth / 2, iconCy, 14, choice.color);
    card.addChild(bgG);

    // Lens flare & streak for major tier up card
    if (isMajorEvolution) {
      topStreak = glowVFX.createStreakSprite(this.cardWidth * 1.25, 22, 0xffea00, 0.75);
      topStreak.x = this.cardWidth / 2;
      topStreak.y = iconCy;
      card.addChild(topStreak);

      starFlare = glowVFX.createStarFlareSprite(44, 0xffffff, 0.95);
      starFlare.x = this.cardWidth / 2;
      starFlare.y = iconCy;
      card.addChild(starFlare);
    }

    // Text: Name
    const nameText = new Text({
      text: choice.name,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: isSpecial ? 15 : 16,
        fontWeight: 'bold',
        fill: isSpecial ? '#ffd700' : '#ffffff',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.cardWidth - 24
      })
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = this.cardWidth / 2;
    nameText.y = 76;
    card.addChild(nameText);

    // Text: Subtitle (Positioned dynamically directly under nameText)
    const subText = new Text({
      text: choice.subtitle,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
        fill: isSynergy ? '#fbbf24' : isMajorEvolution ? '#f59e0b' : '#38bdf8',
        align: 'center'
      })
    });
    subText.anchor.set(0.5, 0);
    subText.x = this.cardWidth / 2;
    subText.y = nameText.y + nameText.height + 4;
    card.addChild(subText);

    // Text: Description (Positioned dynamically directly under subText)
    const descText = new Text({
      text: choice.desc,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 11.5,
        fill: '#94a3b8',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.cardWidth - 28,
        lineHeight: 15
      })
    });
    descText.anchor.set(0.5, 0);
    descText.x = this.cardWidth / 2;
    descText.y = subText.y + subText.height + 6;
    card.addChild(descText);

    if (isSubUpgrade && choice.subOptions && choice.subOptions.length >= 2) {
      // 1. Progress Bar Container anchored at bottom of card
      const pContainer = new Container();
      pContainer.x = 14;
      pContainer.y = this.cardHeight - 68;

      const pG = new Graphics();
      pG.roundRect(0, 0, this.cardWidth - 28, 56, 8);
      pG.fill({ color: 0x0b1120, alpha: 0.92 });
      pG.roundRect(0, 0, this.cardWidth - 28, 56, 8);
      pG.stroke({ width: 1, color: 0x1e293b });

      // Label Row
      const pTitle = new Text({
        text: t('upgrade.tier_progress'),
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#94a3b8',
          letterSpacing: 0.5
        })
      });
      pTitle.x = 8;
      pTitle.y = 6;
      pContainer.addChild(pTitle);

      const pCount = new Text({
        text: `${choice.weapon.subLevel} / ${choice.weapon.maxSubLevel}`,
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 11,
          fontWeight: '900',
          fill: choice.weapon.subLevel > 0 ? '#38bdf8' : '#ffffff'
        })
      });
      pCount.anchor.set(1, 0);
      pCount.x = this.cardWidth - 28 - 8;
      pCount.y = 5;
      pContainer.addChild(pCount);

      // Horizontal Segmented Bar (3 chunks)
      const barW = this.cardWidth - 28 - 16;
      const segGap = 6;
      const totalSegs = choice.weapon.maxSubLevel || 3;
      const segW = (barW - (totalSegs - 1) * segGap) / totalSegs;
      const segH = 8;
      const segY = 23;

      for (let s = 0; s < totalSegs; s++) {
        const segX = 8 + s * (segW + segGap);
        const isLit = s < choice.weapon.subLevel;

        pG.roundRect(segX, segY, segW, segH, 4);
        if (isLit) {
          pG.fill({ color: choice.color });
          pG.rect(segX + 2, segY + 1, segW - 4, 2);
          pG.fill({ color: 0xffffff, alpha: 0.65 });
          pG.roundRect(segX, segY, segW, segH, 4);
          pG.stroke({ width: 1.5, color: 0xffffff, alpha: 0.85 });
        } else {
          pG.fill({ color: 0x1e293b, alpha: 0.95 });
          pG.stroke({ width: 1.2, color: 0x334155 });
        }
      }

      pContainer.addChild(pG);

      const hintText = new Text({
        text: t('upgrade.progress_hint'),
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 9,
          fontWeight: '600',
          fill: '#64748b',
          align: 'center'
        })
      });
      hintText.anchor.set(0.5, 0);
      hintText.x = (this.cardWidth - 28) / 2;
      hintText.y = 37;
      pContainer.addChild(hintText);

      card.addChild(pContainer);

      // 2. 2 Sub-Upgrade Square Choice Boxes (Anchored above progress bar)
      const boxW = 112;
      const boxH = 72;
      const boxY = pContainer.y - boxH - 10;
      const boxXs = [13, 135];

      choice.subOptions.slice(0, 2).forEach((opt, idx) => {
        const box = new Container();
        box.x = boxXs[idx];
        box.y = boxY;
        box.eventMode = 'static';
        box.cursor = 'pointer';

        const bG = new Graphics();
        bG.roundRect(0, 0, boxW, boxH, 8);
        bG.fill({ color: 0x1e293b });
        bG.stroke({ width: 1.5, color: choice.color });

        // Icon Badge Circle
        bG.circle(boxW / 2, 16, 12);
        bG.fill({ color: 0x0f172a });
        bG.stroke({ width: 1.2, color: choice.color });
        box.addChild(bG);

        // Icon Glyph
        const iconText = new Text({
          text: opt.glyph || (opt.icon === 'speed' ? '⚡' : opt.icon === 'aoe' ? '💥' : opt.icon === 'range' ? '🎯' : '⚔️'),
          style: new TextStyle({ fontSize: 12, align: 'center' })
        });
        iconText.anchor.set(0.5);
        iconText.x = boxW / 2;
        iconText.y = 16;
        box.addChild(iconText);

        // Stat Boost Text (e.g. +35% ST)
        const valText = new Text({
          text: t('sub.' + opt.key) || opt.name,
          style: new TextStyle({
            fontFamily: 'system-ui, sans-serif',
            fontSize: 11,
            fontWeight: '900',
            fill: idx === 0 ? '#38bdf8' : '#ffd700',
            align: 'center'
          })
        });
        valText.anchor.set(0.5);
        valText.x = boxW / 2;
        valText.y = 35;
        box.addChild(valText);

        // Stat Label Text (e.g. SÁT THƯƠNG / TỐC BẮN)
        const labelText = new Text({
          text: t('sub.lbl_' + opt.key) || opt.label || opt.key.toUpperCase(),
          style: new TextStyle({
            fontFamily: 'system-ui, sans-serif',
            fontSize: 9.5,
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'center',
            letterSpacing: 0.5
          })
        });
        labelText.anchor.set(0.5);
        labelText.x = boxW / 2;
        labelText.y = 49;
        box.addChild(labelText);

        // Sub Button Hint Badge
        const hintTextBadge = new Text({
          text: t('upgrade.pick', { n: idx + 1 }),
          style: new TextStyle({
            fontFamily: 'system-ui, sans-serif',
            fontSize: 8.5,
            fontWeight: 'bold',
            fill: '#94a3b8',
            align: 'center'
          })
        });
        hintTextBadge.anchor.set(0.5);
        hintTextBadge.x = boxW / 2;
        hintTextBadge.y = 62;
        box.addChild(hintTextBadge);

        // Hover & Click Interactions
        box.on('pointerover', () => {
          bG.clear();
          bG.roundRect(0, 0, boxW, boxH, 8);
          bG.fill({ color: 0x334155 });
          bG.stroke({ width: 2.2, color: 0xffffff });
          bG.circle(boxW / 2, 16, 12);
          bG.fill({ color: 0x1e293b });
          bG.stroke({ width: 1.8, color: 0xffffff });
          box.y = boxY - 3;
        });

        box.on('pointerout', () => {
          bG.clear();
          bG.roundRect(0, 0, boxW, boxH, 8);
          bG.fill({ color: 0x1e293b });
          bG.stroke({ width: 1.5, color: choice.color });
          bG.circle(boxW / 2, 16, 12);
          bG.fill({ color: 0x0f172a });
          bG.stroke({ width: 1.2, color: choice.color });
          box.y = boxY;
        });

        box.on('pointerdown', (e) => {
          e.stopPropagation();
          audio.playClick();
          sdk.analytics.trackUpgradeUnlocked(choice.id, choice.weapon.subLevel + 1);
          this.hide();
          this.onUpgradeSelected({
            type: 'weapon_sub_upgrade',
            id: choice.id,
            subKey: opt.key,
            name: opt.name
          });
        });

        card.addChild(box);
      });
    } else {
      card.cursor = 'pointer';

      if (isMajorEvolution) {
        // NÚT BẤM TIẾN HÓA BẬC TO (Anchored at bottom of card)
        const btnH = 44;
        const btnY = this.cardHeight - 18 - btnH;
        const btnG = new Graphics();
        btnG.roundRect(16, btnY, this.cardWidth - 32, btnH, 10);
        btnG.fill({ color: choice.color });
        btnG.roundRect(16, btnY, this.cardWidth - 32, btnH, 10);
        btnG.stroke({ width: 2.5, color: 0xffd700 });
        card.addChild(btnG);

        const btnText = new Text({
          text: t('upgrade.evolve_tier', { tier: choice.tier }),
          style: new TextStyle({
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 'bold',
            fill: '#030712'
          })
        });
        btnText.anchor.set(0.5);
        btnText.x = this.cardWidth / 2;
        btnText.y = btnY + btnH / 2;
        card.addChild(btnText);

        // THANH TIẾN TRÌNH 3/3 GỌN GÀNG (3 segments vàng kim ngay trên nút, không che chữ)
        const pContainer = new Container();
        pContainer.x = 24;
        pContainer.y = btnY - 20;

        const pG = new Graphics();
        const barW = this.cardWidth - 48;
        const segGap = 6;
        const segW = (barW - 2 * segGap) / 3;
        const segH = 8;

        for (let s = 0; s < 3; s++) {
          const segX = s * (segW + segGap);
          pG.roundRect(segX, 0, segW, segH, 4);
          pG.fill({ color: 0xffd700 });
          pG.rect(segX + 2, 1, segW - 4, 2);
          pG.fill({ color: 0xffffff, alpha: 0.85 });
          pG.roundRect(segX, 0, segW, segH, 4);
          pG.stroke({ width: 1.5, color: 0xffea00 });
        }

        pContainer.addChild(pG);
        card.addChild(pContainer);
      } else {
        // THẺ THƯỜNG / HỢP THỂ / PASSIVE / VŨ KHÍ MỚI
        const btnH = 42;
        const btnY = this.cardHeight - 18 - btnH;

        if (choice.tier && choice.tier > 1) {
          // Mini tier bar for passives (5 chunks)
          const pContainer = new Container();
          pContainer.x = 24;
          pContainer.y = btnY - 14;
          const pG = new Graphics();
          const barW = this.cardWidth - 48;
          const maxT = 5;
          const segGap = 4;
          const segW = (barW - (maxT - 1) * segGap) / maxT;

          for (let s = 0; s < maxT; s++) {
            const segX = s * (segW + segGap);
            const isLit = s < choice.tier;
            pG.roundRect(segX, 0, segW, 6, 2.5);
            pG.fill({ color: isLit ? choice.color : 0x1e293b });
            if (isLit) {
              pG.roundRect(segX, 0, segW, 6, 2.5);
              pG.stroke({ width: 1, color: 0xffffff, alpha: 0.6 });
            }
          }
          pContainer.addChild(pG);
          card.addChild(pContainer);
        }

        const btnG = new Graphics();
        btnG.roundRect(24, btnY, this.cardWidth - 48, btnH, 8);
        btnG.fill({ color: choice.color });
        card.addChild(btnG);

        const btnText = new Text({
          text: choice.type === 'starter_weapon' ? t('starter.select') : (isSynergy ? t('upgrade.activate_fusion') : t('upgrade.select')),
          style: new TextStyle({
            fontFamily: 'system-ui, sans-serif',
            fontSize: isSynergy ? 12 : 14,
            fontWeight: 'bold',
            fill: '#030712'
          })
        });
        btnText.anchor.set(0.5);
        btnText.x = this.cardWidth / 2;
        btnText.y = btnY + btnH / 2;
        card.addChild(btnText);
      }

      card.on('pointerdown', (e) => {
        e.stopPropagation();
        audio.playClick();
        sdk.analytics.trackUpgradeUnlocked(choice.id, choice.tier || 1);
        this.hide();
        if (choice.type === 'starter_weapon' && this.onStarterSelected) {
          const cb = this.onStarterSelected;
          this.onStarterSelected = null;
          cb(choice);
        } else {
          this.onUpgradeSelected(choice);
        }
      });
    }

    // Card Hover Elevation
    card.on('pointerover', () => {
      bgG.stroke({ width: isMajorEvolution ? 4 : 3, color: isMajorEvolution ? 0xffea00 : 0xffffff });
      card.y = targetY - 6;
      card.scale.set(1.02);
    });
    card.on('pointerout', () => {
      if (isMajorEvolution) {
        bgG.stroke({ width: 3.5, color: 0xffd700 });
      } else {
        bgG.stroke({ width: isSynergy ? 3.5 : 2, color: choice.color, alpha: isSynergy ? 1 : 0.85 });
      }
      card.y = targetY;
      card.scale.set(1.0);
    });

    this.container.addChild(card);
    return card;
  }

  showStarterSelection(onSelected) {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    this.onStarterSelected = onSelected;
    this.container.removeChildren();
    this.container.visible = true;

    // Dim background overlay
    const bg = new Graphics();
    bg.rect(0, 0, this.engine.width, this.engine.height);
    bg.fill({ color: 0x030712, alpha: 0.90 });
    bg.eventMode = 'static';
    this.container.addChild(bg);

    // Title
    const title = new Text({
      text: t('starter.title'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: Math.min(26, Math.max(18, Math.floor(this.engine.width * 0.038))),
        fontWeight: '900',
        fill: '#00f0ff',
        dropShadow: { color: '#00f0ff', blur: 14, distance: 0 },
        letterSpacing: 2
      })
    });
    title.anchor.set(0.5);
    title.x = this.engine.width / 2;
    title.y = 65;
    this.container.addChild(title);

    // Subtitle
    const subTitle = new Text({
      text: t('starter.subtitle'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#94a3b8',
        letterSpacing: 1
      })
    });
    subTitle.anchor.set(0.5);
    subTitle.x = this.engine.width / 2;
    subTitle.y = 96;
    this.container.addChild(subTitle);

    // Pick 3 random unique weapons out of all available weapons
    const allWeapons = Object.values(WEAPON_TYPES);
    const shuffled = [...allWeapons].sort(() => Math.random() - 0.5);
    const chosen3 = shuffled.slice(0, 3);
    const isVi = i18n.getLanguage() === 'vi';

    const choices = chosen3.map(wId => {
      const def = WEAPON_DEFINITIONS[wId];
      const tier1 = def?.tiers?.[0];
      const desc = isVi ? (tier1?.desc_vi || def?.description || '') : (tier1?.desc || def?.description || '');
      return {
        type: 'starter_weapon',
        id: wId,
        name: def?.name || wId,
        subtitle: isVi ? 'VŨ KHÍ KHỞI ĐẦU' : 'STARTER WEAPON',
        desc: desc,
        color: def?.color || 0x00f0ff,
        tier: 1
      };
    });

    // Mobile-responsive card sizing
    const cardGap = this.engine.width < 760 ? 12 : 24;
    const maxAvailableW = this.engine.width - 32;
    const idealW = (maxAvailableW - 2 * cardGap) / 3;
    this.cardWidth = Math.min(260, Math.max(180, Math.floor(idealW)));

    const startX = (this.engine.width - (3 * this.cardWidth + 2 * cardGap)) / 2;
    const cardY = Math.round((this.engine.height - this.cardHeight) / 2) + 20;

    const renderedCards = [];
    choices.forEach((choice, index) => {
      const cardX = startX + index * (this.cardWidth + cardGap);
      const card = this.renderCard(choice, cardX, cardY);
      renderedCards.push({
        card,
        targetX: cardX + this.cardWidth / 2,
        targetY: cardY + this.cardHeight / 2,
        index
      });
    });

    // Staggered entrance animation
    const cardAnims = renderedCards.map((rc, idx) => {
      const startDx = idx === 0 ? -220 : idx === 2 ? 220 : 0;
      const startDy = idx === 1 ? 280 : 230;
      const startRot = idx === 0 ? -0.15 : idx === 2 ? 0.15 : 0;

      rc.card.x = rc.targetX + startDx;
      rc.card.y = rc.targetY + startDy;
      rc.card.rotation = startRot;
      rc.card.scale.set(0.55);
      rc.card.alpha = 0;

      return {
        ...rc,
        startDx,
        startDy,
        startRot,
        delay: idx * 75,
        duration: 320,
        soundPlayed: false
      };
    });

    const animStartTime = performance.now();
    const totalAnimDuration = 2 * 75 + 320 + 160;

    const animateCards = (now) => {
      const elapsed = now - animStartTime;
      let allDone = true;

      for (const item of cardAnims) {
        if (elapsed < item.delay) {
          allDone = false;
          continue;
        }

        if (!item.soundPlayed) {
          item.soundPlayed = true;
          audio.playClick();
        }

        const p = Math.min(1, (elapsed - item.delay) / item.duration);
        if (p < 1) allDone = false;

        const c1 = 1.35;
        const c3 = c1 + 1;
        const ease = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);

        item.card.x = item.targetX + item.startDx * (1 - p);
        item.card.y = item.targetY + item.startDy * (1 - ease);
        item.card.rotation = item.startRot * (1 - p);
        item.card.scale.set(0.55 + 0.45 * ease);
        item.card.alpha = Math.min(1, p * 1.8);

        if (p >= 1) {
          item.card.x = item.targetX;
          item.card.y = item.targetY;
          item.card.rotation = 0;
          item.card.scale.set(1.0);
          item.card.alpha = 1;
        }
      }

      if (!allDone || elapsed < totalAnimDuration) {
        this.animId = requestAnimationFrame(animateCards);
      } else {
        this.animId = null;
      }
    };

    this.animId = requestAnimationFrame(animateCards);
  }

  hide() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.container.visible = false;
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.container.destroy({ children: true });
  }
}
