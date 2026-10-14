import { Graphics } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { ShipRenderer } from './ShipRenderer.js';
import { glowVFX } from '../vfx/GlowVFX.js';

export class Enemy {
  constructor(engine) {
    this.engine = engine;
    this.graphics = new Graphics();
    this.graphics.visible = false;
    this.engine.gameWorldLayer.addChild(this.graphics);

    this.isAlive = false;
    this.type = 'swarm';
    this.x = 0;
    this.y = 0;
    this.hp = 10;
    this.maxHp = 10;
    this.speed = 100;
    this.damage = 10;
    this.xp = 1;
    this.size = 15;
    this.color = 0xff0044;

    // Status effects
    this.burnDuration = 0;
    this.burnDps = 0;
    this.hitFlash = 0;
    this.pulseAnim = 0;

    // Health bar tracking
    this.lastRenderedHp = 10;
    this.speedModifier = 1.0;
    this.hasteTimer = 0;

    // DoT damage number throttling
    this.dotAccumulator = 0;
    this.dotSource = null;
    this.dotTimer = 0.25;

    // Status debuffs
    this.slowDuration = 0;
    this.slowFactor = 1.0;
    this.needleHits = 0;
    this.armorDebuff = 0;

    // Ability timers & Boss Mechanics
    this.isBoss = false;
    this.minionTimer = 0;
    this.healTimer = 2.0;
    this.partner = null; // For twin enemy pairing
    this.teleportTimer = 2.4;
    this.cryoPulseTimer = 5.2;
    this.chargeTimer = 4.0;
    this.isCharging = 0;
    this.chargeWindup = 0;
    this.siphonTimer = 2.8;
    this.barrierTimer = 4.0;
    this.isBarrierActive = false;
    this.barrierDuration = 0;
    this.solarBeamTimer = 5.0;
    this.solarBeamActive = 0;
    this.broodTimer = 3.2;
    this.clonesSpawned = 0;
    this.isClone = false;
    this.singularityTimer = 3.0;
    this.chronoTimer = 3.5;
    this.bossPhase = 1;
    this.isEnraged = false;
    this.isLatched = false;
    this.devourTimer = 1.8;
  }

  applySlow(factor = 0.5, duration = 2.0) {
    this.slowFactor = Math.min(this.slowFactor || 1.0, factor);
    this.slowDuration = Math.max(this.slowDuration || 0, duration);
  }

  reset(config, x, y) {
    this.type = config.type;
    this.name = config.name || config.type;
    this.x = x;
    this.y = y;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.lastRenderedHp = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.xp = config.xp;
    this.size = config.size;
    this.color = config.color;

    this.isBoss = !!config.isBoss || config.type === 'mega_boss' || config.type.startsWith('boss_');
    this.burnDuration = 0;
    this.burnDps = 0;
    this.slowDuration = 0;
    this.slowFactor = 1.0;
    this.needleHits = 0;
    this.armorDebuff = 0;
    this.hitFlash = 0;
    this.pulseAnim = Math.random() * Math.PI * 2;
    this.speedModifier = 1.0;
    this.hasteTimer = 0;
    this.dotAccumulator = 0;
    this.dotSource = null;
    this.dotTimer = 0.25;
    this.minionTimer = 2.0;
    this.healTimer = 2.0;
    this.partner = null;

    // Boss Mechanics Reset
    this.teleportTimer = 2.4;
    this.cryoPulseTimer = 5.2;
    this.chargeTimer = 4.0;
    this.isCharging = 0;
    this.chargeWindup = 0;
    this.siphonTimer = 2.8;
    this.barrierTimer = 4.0;
    this.isBarrierActive = false;
    this.barrierDuration = 0;
    this.solarBeamTimer = 5.0;
    this.solarBeamActive = 0;
    this.broodTimer = 3.2;
    this.clonesSpawned = 0;
    this.isClone = !!config.isClone;
    this.singularityTimer = 3.0;
    this.chronoTimer = 3.5;
    this.bossPhase = 1;
    this.isEnraged = false;
    this.isLatched = false;
    this.devourTimer = 1.8;

    this.isAlive = true;
    this.graphics.visible = true;

    this.render();
  }

  render() {
    this.graphics.clear();
    this.graphics.x = this.x;
    this.graphics.y = this.y;

    // 1. Procedural Spaceship Render (All 10 enemies + 11 boss flagships)
    ShipRenderer.draw(this.graphics, this);

    // 2. Boss Special Overlays
    if (this.isBarrierActive) {
      this.graphics.circle(0, 0, this.size * 1.35);
      this.graphics.stroke({ width: 3.5, color: 0x06b6d4, alpha: 0.85 });
      this.graphics.circle(0, 0, this.size * 1.35);
      this.graphics.fill({ color: 0x06b6d4, alpha: 0.22 });
    }

    if (this.solarBeamActive > 0) {
      this.graphics.moveTo(0, 0);
      this.graphics.lineTo(400, 0);
      this.graphics.stroke({ width: 8, color: 0xff6600, alpha: 0.85 });
      this.graphics.moveTo(0, 0);
      this.graphics.lineTo(400, 0);
      this.graphics.stroke({ width: 3, color: 0xffffff, alpha: 0.95 });
    }

    // 3. Health bar for damaged or heavy enemies
    const isBoss = this.isBoss || this.type === 'mega_boss' || this.type.startsWith('boss_');
    const isHeavy = isBoss || this.type === 'tank' || this.type === 'splitter_large' || this.type === 'vanguard';
    if (isHeavy || this.hp < this.maxHp) {
      const barW = isBoss ? this.size * 2.2 : Math.max(24, this.size * 1.8);
      const barH = isBoss ? 8 : 4;
      const hpPct = Math.max(0, this.hp / this.maxHp);
      const barY = -this.size - (isBoss ? 22 : 10);

      this.graphics.roundRect(-barW / 2, barY, barW, barH, 2);
      this.graphics.fill({ color: 0x111111, alpha: 0.88 });
      this.graphics.roundRect(-barW / 2, barY, barW * hpPct, barH, 2);
      this.graphics.fill({ color: isBoss ? 0xff0044 : (hpPct > 0.4 ? 0x00ff66 : 0xff3333) });
      this.graphics.roundRect(-barW / 2, barY, barW, barH, 2);
      this.graphics.stroke({ width: 1, color: 0xffffff, alpha: 0.75 });
    }
  }

  takeDamage(amount, source = 'normal') {
    if (!this.isAlive) return;

    // Vanguard directional shield mitigation: -60% kinetic & missile
    let finalAmount = amount;
    if (this.type === 'vanguard' && (source === 'normal' || source === 'missile')) {
      finalAmount *= 0.4;
    }

    // Aegis Prism Bastion: -75% damage when reflective barrier is active
    if (this.isBarrierActive) {
      finalAmount *= 0.25;
    }

    // Mirage Decoy Clone: takes 3x damage and dies quickly
    if (this.isClone) {
      finalAmount *= 3.0;
    }

    // Mirror Reflector: -70% damage from direct kinetic & laser beams
    if (this.type === 'mirror_reflector' && (source === 'normal' || source === 'laser')) {
      finalAmount *= 0.3;
    }

    if (this.armorDebuff > 0) {
      finalAmount *= (1 + this.armorDebuff);
    }

    const scene = this.engine.sceneManager.currentScene;

    // Frostfire Cataclysm (cryo + flame synergy): Thermal Shock Reaction
    if (scene?.turret?.hasSynergy('cryo+flame')) {
      const isThermalShock = (source === 'burn' && this.slowDuration > 0) ||
                             (source === 'frost' && this.burnDuration > 0);
      if (isThermalShock) {
        finalAmount *= 2.0; // 2.0x finishing damage
        scene?.particles?.emitExplosion(this.x, this.y, 80, 0xa5f3fc);
        scene?.particles?.emitShockwave(this.x, this.y, 100, 0xff5500);
        audio.playExplosion?.(0.5);
        if (scene?.spawner?.enemies) {
          for (const other of scene.spawner.enemies) {
            if (!other.isAlive || other === this) continue;
            const dist = Math.hypot(other.x - this.x, other.y - this.y);
            if (dist <= 100) {
              other.takeDamage(finalAmount * 0.4, 'explosion');
              const nx = (other.x - this.x) / (dist || 1);
              const ny = (other.y - this.y) / (dist || 1);
              other.x += nx * 25;
              other.y += ny * 25;
            }
          }
        }
      }
    }

    // 1. Vampiric Siphon (Soul Harvest) damage amplification:
    if (scene?.vampiricPassive && scene.vampiricPassive.tier > 0) {
      finalAmount *= scene.vampiricPassive.damageMultiplier;
    }

    // 2. Overcharge Passive (Critical Strike Core):
    const isDoT = source === 'burn' || source === 'black_hole' || source === 'laser';
    const overcharge = scene?.overchargePassive;
    const hasOvercharge = overcharge && overcharge.tier > 0;
    const critChance = hasOvercharge ? overcharge.critChance : 0.12;
    const isCrit = source === 'crit' || (!isDoT && Math.random() < critChance);
    if (isCrit && source !== 'crit') {
      const critMult = hasOvercharge ? overcharge.critMultiplier : 1.5;
      finalAmount *= critMult;
      if (hasOvercharge && overcharge.tier === 5) {
        scene?.particles?.emitShockwave(this.x, this.y, 65, 0xffea00);
      }
    }

    this.hp -= finalAmount;

    // Black hole & continuous DoT should NOT lock hitFlash whiteout
    if (source !== 'black_hole') {
      this.hitFlash = 0.08;
    }

    if (scene?.tracker) {
      scene.tracker.recordDamage(source, finalAmount);
    }

    if (scene?.damageNumbers) {
      if (isDoT) {
        this.dotAccumulator += finalAmount;
        this.dotSource = source;
      } else {
        scene.damageNumbers.spawn(this.x, this.y, finalAmount, isCrit, isCrit ? '#ffd700' : '#ffffff');
      }
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  applyBurn(dps, duration) {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burnDuration = Math.max(this.burnDuration, duration);
  }

  die() {
    this.isAlive = false;
    this.graphics.visible = false;
    const isBoss = this.isBoss || this.type === 'mega_boss' || this.type.startsWith('boss_');
    audio.playExplosion(isBoss ? 3.0 : (this.type === 'tank' || this.type === 'splitter_large') ? 1.5 : 0.8);

    const scene = this.engine.sceneManager.currentScene;
    if (scene) {
      scene.tracker?.recordKill(this.type);

      // GEM DROPS: Bosses drop 5 GREEN MEGA GEMS (x10+ XP each, zero lag!)
      if (isBoss) {
        const gemCount = 5;
        const gemXp = Math.round(this.xp / gemCount);
        for (let g = 0; g < gemCount; g++) {
          scene.gems.spawn(
            this.x + (Math.random() - 0.5) * 70,
            this.y + (Math.random() - 0.5) * 70,
            gemXp,
            true // Green Mega Gem!
          );
        }
        scene.particles.emitShockwave(this.x, this.y, 250, this.color || 0xff0055);
        glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 220, this.color || 0xff0055);
        setTimeout(() => {
          scene.showBossRewardChest?.(Math.max(1, Math.floor((scene.spawner?.currentWave || 5) / 5)));
        }, 500);
      } else if (this.type === 'tank' || this.type === 'splitter_large' || this.xp >= 15) {
        // High XP enemies drop a Green Mega Gem
        scene.gems.spawn(this.x, this.y, this.xp, true);
      } else {
        // Regular enemies drop standard gem
        scene.gems.spawn(this.x, this.y, this.xp, false);
      }

      // SPLITTER DEATH ABILITY: Spawns smaller child blocks
      if (scene.spawner) {
        if (this.type === 'splitter_large') {
          scene.spawner.spawnSplitter('splitter_med', this.x - 14, this.y);
          scene.spawner.spawnSplitter('splitter_med', this.x + 14, this.y);
        } else if (this.type === 'splitter_med') {
          scene.spawner.spawnSplitter('splitter_small', this.x - 10, this.y);
          scene.spawner.spawnSplitter('splitter_small', this.x + 10, this.y);
        }
      }

      // Untether magnetic partner
      if (this.partner) {
        this.partner.partner = null;
        this.partner = null;
      }

      scene.particles.emitExplosion(this.x, this.y, this.size * 2.2, this.color);
      scene.onEnemyKilled(this);
    }
  }

  spawnMirageDecoys(spawner) {
    if (!spawner) return;
    for (let c = 0; c < 2; c++) {
      const angle = (c * Math.PI) + (Math.random() - 0.5);
      const cx = this.x + Math.cos(angle) * (this.size + 30);
      const cy = this.y + Math.sin(angle) * (this.size + 30);
      const cloneConfig = {
        type: 'boss_mirage',
        name: 'Mirage Decoy',
        hp: Math.round(this.maxHp * 0.15),
        speed: this.speed * 1.1,
        damage: Math.round(this.damage * 0.4),
        xp: 20,
        color: 0xd946ef,
        size: this.size * 0.85,
        isBoss: false,
        isClone: true
      };
      const clone = spawner.pool.get(cloneConfig, cx, cy);
      spawner.enemies.push(clone);
      glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, cx, cy, 90, 0xd946ef);
    }
  }

  update(dt, turret, shield, spawner) {
    if (!this.isAlive) return;

    this.pulseAnim += dt * 3;

    // Dynamic health bar update when HP changes
    if (Math.abs(this.hp - this.lastRenderedHp) >= Math.max(0.5, this.maxHp * 0.015)) {
      this.lastRenderedHp = this.hp;
      this.render();
    }

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      if (this.hitFlash <= 0) {
        this.render();
      }
    }

    // Flush throttled DoT damage numbers
    this.dotTimer -= dt;
    if (this.dotTimer <= 0) {
      this.dotTimer = 0.25;
      if (this.dotAccumulator >= 1 && this.isAlive) {
        const scene = this.engine.sceneManager.currentScene;
        const color = this.dotSource === 'black_hole' ? '#d946ef' : this.dotSource === 'burn' ? '#ff6600' : '#00ffcc';
        scene?.damageNumbers?.spawn(this.x, this.y, this.dotAccumulator, false, color);
        this.dotAccumulator = 0;
      }
    }

    // DoT Burn Effect
    if (this.burnDuration > 0) {
      this.burnDuration -= dt;
      this.takeDamage(this.burnDps * dt, 'burn');
      if (!this.isAlive) return;
    }

    // Healer Drone: Emits periodic healing wave to nearby damaged allies
    if (this.type === 'healer' && spawner) {
      this.healTimer -= dt;
      if (this.healTimer <= 0) {
        this.healTimer = 2.2;
        let healedAny = false;
        for (const ally of spawner.enemies) {
          if (!ally.isAlive || ally === this) continue;
          if (Math.hypot(ally.x - this.x, ally.y - this.y) <= 130 && ally.hp < ally.maxHp) {
            ally.hp = Math.min(ally.maxHp, ally.hp + 22);
            ally.render();
            healedAny = true;
          }
        }
        if (healedAny) {
          this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 110, 0x10b981);
        }
      }
    }

    // =========================================================================
    // THE 11 EPIC BOSS SPECIAL ABILITIES
    // =========================================================================

    // 1. Titan Dreadnought: Minion Spawner
    if ((this.type === 'mega_boss' || this.type === 'boss_titan') && spawner) {
      this.minionTimer -= dt;
      if (this.minionTimer <= 0) {
        this.minionTimer = 2.6;
        const minionCount = 4;
        for (let m = 0; m < minionCount; m++) {
          const mAngle = (m * Math.PI * 2) / minionCount + Math.random() * 0.5;
          const mx = this.x + Math.cos(mAngle) * (this.size + 15);
          const my = this.y + Math.sin(mAngle) * (this.size + 15);
          spawner.spawnMinion(mx, my);
        }
        this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 90, 0xff0055);
      }
    }

    // 2. Shadow Phantom: Continuous Quantum Teleportation
    if (this.type === 'boss_phantom') {
      this.teleportTimer -= dt;
      if (this.teleportTimer <= 0) {
        this.teleportTimer = 2.4;
        const scene = this.engine.sceneManager.currentScene;
        scene?.particles?.emitShockwave(this.x, this.y, 90, 0xa855f7);
        glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 80, 0xa855f7);
        // Warp to new angle around turret
        const warpAngle = Math.random() * Math.PI * 2;
        const warpDist = 220 + Math.random() * 110;
        this.x = turret.x + Math.cos(warpAngle) * warpDist;
        this.y = turret.y + Math.sin(warpAngle) * warpDist;
        this.graphics.x = this.x;
        this.graphics.y = this.y;
        scene?.particles?.emitShockwave(this.x, this.y, 120, 0xa855f7);
      }
    }

    // 3. Absolute Zero: Sub-Zero Cryo EMP Weapon Freeze
    if (this.type === 'boss_cryo') {
      this.cryoPulseTimer -= dt;
      if (this.cryoPulseTimer <= 0) {
        this.cryoPulseTimer = 5.2;
        const scene = this.engine.sceneManager.currentScene;
        scene?.particles?.emitShockwave(this.x, this.y, 350, 0x00f0ff, 5.0);
        glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 140, 0x00f0ff);
        turret.freezeTimer = 2.2; // Freeze player weapons for 2.2 seconds!
        audio.playClick();
      }
    }

    // 4. Cosmic Singularity: Gravitational Pull Pulse
    if (this.type === 'boss_singularity') {
      this.singularityTimer -= dt;
      if (this.singularityTimer <= 0) {
        this.singularityTimer = 3.2;
        const scene = this.engine.sceneManager.currentScene;
        scene?.particles?.emitShockwave(this.x, this.y, 220, 0x6366f1, 4.0);
        glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 120, 0x6366f1);
      }
    }

    // 5. Solar Prominence: Sweeping Solar Beam Cannon
    if (this.type === 'boss_solar') {
      this.solarBeamTimer -= dt;
      if (this.solarBeamActive > 0) {
        this.solarBeamActive -= dt;
        if (shield.isActive) {
          shield.takeDamage(45 * dt);
        } else {
          turret.takeDamage(30 * dt);
        }
        if (this.solarBeamActive <= 0) this.render();
      } else if (this.solarBeamTimer <= 0) {
        this.solarBeamTimer = 5.4;
        this.solarBeamActive = 1.2;
        glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 130, 0xff6600);
        this.render();
      }
    }

    // 6. Aegis Prism Bastion: Reflective Mirror Barrier
    if (this.type === 'boss_aegis') {
      this.barrierTimer -= dt;
      if (this.isBarrierActive) {
        this.barrierDuration -= dt;
        if (this.barrierDuration <= 0) {
          this.isBarrierActive = false;
          this.render();
        }
      } else if (this.barrierTimer <= 0) {
        this.barrierTimer = 4.2;
        this.isBarrierActive = true;
        this.barrierDuration = 2.2;
        this.render();
        this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 130, 0x06b6d4);
      }
    }

    // 7. Aeon Chrono Weaver: Temporal Distortion Ripples
    if (this.type === 'boss_chrono') {
      this.chronoTimer -= dt;
      if (this.chronoTimer <= 0) {
        this.chronoTimer = 3.5;
        this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 240, 0x14b8a6, 3.5);
      }
    }

    // 8. Hydra Broodmother: Swarm Spore Carrier
    if (this.type === 'boss_broodmother' && spawner) {
      this.broodTimer -= dt;
      if (this.broodTimer <= 0) {
        this.broodTimer = 3.6;
        for (let b = 0; b < 3; b++) {
          const bAngle = (b * Math.PI * 2) / 3 + Math.random() * 0.5;
          const bx = this.x + Math.cos(bAngle) * (this.size + 15);
          const by = this.y + Math.sin(bAngle) * (this.size + 15);
          spawner.spawnSplitter?.('splitter_small', bx, by);
        }
        this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 90, 0x84cc16);
      }
    }

    // 9. Crimson Blood Reaper: Shield Life Siphon
    if (this.type === 'boss_vampire') {
      this.siphonTimer -= dt;
      if (this.siphonTimer <= 0) {
        this.siphonTimer = 2.8;
        if (shield.isActive) {
          shield.takeDamage(35);
          this.hp = Math.min(this.maxHp, this.hp + 50);
          this.render();
          this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 140, 0xe11d48);
          this.engine.sceneManager.currentScene?.damageNumbers?.spawn(this.x, this.y, '+50', false, '#10b981');
        }
      }
    }

    // 10. Hyperion Juggernaut: Hyper-Speed Ramming Charge
    let effectiveSpeed = this.speed * (this.speedModifier || 1.0) * (this.isEnraged ? 1.25 : 1.0);
    if (this.type === 'boss_juggernaut') {
      this.chargeTimer -= dt;
      if (this.chargeWindup > 0) {
        this.chargeWindup -= dt;
        effectiveSpeed = 0; // Windup pause before blastoff
        if (this.chargeWindup <= 0) {
          this.isCharging = 0.9;
          glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 110, 0xf59e0b);
        }
      } else if (this.isCharging > 0) {
        this.isCharging -= dt;
        effectiveSpeed *= 4.5; // Rocket charge speed!
      } else if (this.chargeTimer <= 0) {
        this.chargeTimer = 4.5;
        this.chargeWindup = 0.9;
        this.engine.sceneManager.currentScene?.particles?.emitShockwave(this.x, this.y, 130, 0xf59e0b);
      }
    }

    // 11. Mirage Holographic Overlord: Decoy Splitting
    if (this.type === 'boss_mirage' && !this.isClone && spawner) {
      const hpPct = this.hp / this.maxHp;
      if (this.clonesSpawned === 0 && hpPct <= 0.70) {
        this.clonesSpawned = 1;
        this.spawnMirageDecoys(spawner);
      } else if (this.clonesSpawned === 1 && hpPct <= 0.35) {
        this.clonesSpawned = 2;
        this.spawnMirageDecoys(spawner);
      }
    }

    // Direction toward center turret
    const dx = turret.x - this.x;
    const dy = turret.y - this.y;
    const distToTurret = Math.hypot(dx, dy);

    // 1. Stealth Stalker Cloaking Field
    if (this.type === 'stealth_stalker') {
      const isUncloaked = distToTurret <= 185 || this.burnDuration > 0 || this.hitFlash > 0;
      this.graphics.alpha = isUncloaked ? 1.0 : 0.20;
    }

    // 2. Gravity Anchor Anchoring & Bullet Bending
    if (this.type === 'gravity_anchor') {
      if (distToTurret <= 360) {
        effectiveSpeed = 0; // Anchors at long range
      }
      const scene = this.engine.sceneManager.currentScene;
      if (scene?.activeBullets) {
        for (const b of scene.activeBullets) {
          if (!b.isAlive) continue;
          const bDist = Math.hypot(b.x - this.x, b.y - this.y);
          if (bDist <= 150 && bDist > 10) {
            b.vx += ((this.x - b.x) / bDist) * 160 * dt;
            b.vy += ((this.y - b.y) / bDist) * 160 * dt;
          }
        }
      }
    }

    // 3. Parasitic Spore Latching on Shield
    if (this.type === 'parasite_spore' && shield && shield.isActive) {
      if (distToTurret <= shield.radius + this.size) {
        this.isLatched = true;
        effectiveSpeed = 0;
        shield.takeDamage(14 * dt);
        this.engine.sceneManager.currentScene?.particles?.emit({
          x: this.x,
          y: this.y,
          count: 1,
          color: 0xd946ef,
          speed: 20,
          life: 0.15
        });
      }
    }

    // 4. Bio Devourer Gem Consuming & Growth
    if (this.type === 'bio_devourer') {
      this.devourTimer -= dt;
      if (this.devourTimer <= 0) {
        this.devourTimer = 1.8;
        const scene = this.engine.sceneManager.currentScene;
        if (scene?.gems?.activeGems) {
          for (const g of scene.gems.activeGems) {
            if (g.isAlive && Math.hypot(g.x - this.x, g.y - this.y) <= 90) {
              g.isAlive = false;
              g.graphics.visible = false;
              this.hp = Math.min(this.maxHp * 1.5, this.hp + 40);
              this.size = Math.min(36, this.size * 1.08);
              this.render();
              scene.particles?.emit({ x: this.x, y: this.y, count: 6, color: 0xef4444, speed: 70, life: 0.2 });
              break;
            }
          }
        }
      }
    }

    // 5. Chrono Weaver Temporal Friction
    if (this.type === 'chrono_weaver' && turret) {
      for (const w of turret.equippedWeapons) {
        w.cooldown += dt * 0.20;
      }
    }

    // 6. Multi-Phase Boss Transitions & Enrage Cues
    if (this.isBoss) {
      const hpPct = this.hp / this.maxHp;
      const scene = this.engine.sceneManager.currentScene;
      if (this.bossPhase === 1 && hpPct <= 0.60) {
        this.bossPhase = 2;
        audio.playExplosion?.(1.5);
        scene?.particles?.emitShockwave(this.x, this.y, 180, 0xffd700);
      } else if (this.bossPhase === 2 && hpPct <= 0.25) {
        this.bossPhase = 3;
        this.isEnraged = true;
        this.speedModifier = (this.speedModifier || 1.0) * 1.25;
        audio.playExplosion?.(2.0);
        glowVFX.spawnExplosionFlare(this.engine.gameWorldLayer, this.x, this.y, 200, 0xff0044);
        scene?.particles?.emitShockwave(this.x, this.y, 260, 0xff0044);
      }
    }

    let moveAngle = Math.atan2(dy, dx);
    if (this.type === 'speeder') {
      moveAngle += Math.sin(this.pulseAnim * 2) * 0.35;
    }

    // Twin Magnetic lateral repulsion: Keep ~120px apart while flying towards turret
    if (this.type === 'twin' && this.partner && this.partner.isAlive) {
      const pDx = this.x - this.partner.x;
      const pDy = this.y - this.partner.y;
      const pDist = Math.hypot(pDx, pDy);
      if (pDist < 110 && pDist > 0) {
        this.x += (pDx / pDist) * 35 * dt;
        this.y += (pDy / pDist) * 35 * dt;
      }
    }

    // Haste & Slow speed modifiers
    if (this.slowDuration > 0) {
      this.slowDuration -= dt;
      effectiveSpeed *= (this.slowFactor || 0.55);
      if (this.slowDuration <= 0) {
        this.slowFactor = 1.0;
      }
    }
    if (this.hasteTimer > 0) {
      this.hasteTimer -= dt;
      effectiveSpeed *= 1.6;
    }
    this.speedModifier = 1.0; // Reset for next frame

    // Shield Collision (Smooth clamping without vibration oscillation)
    if (shield.isActive) {
      const contactDist = shield.radius + this.size;
      if (distToTurret <= contactDist) {
        shield.takeDamage(this.damage * dt * 2.5);
        if (distToTurret > 0.001) {
          const nx = -dx / distToTurret;
          const ny = -dy / distToTurret;
          this.x = turret.x + nx * contactDist;
          this.y = turret.y + ny * contactDist;
        }
        this.graphics.x = this.x;
        this.graphics.y = this.y;
        return;
      }
    }

    // Turret Hit
    if (distToTurret <= turret.radius + this.size) {
      turret.takeDamage(this.damage * dt * 2.0);
      return;
    }

    // Movement
    this.x += Math.cos(moveAngle) * effectiveSpeed * dt;
    this.y += Math.sin(moveAngle) * effectiveSpeed * dt;

    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.rotation = Math.atan2(dy, dx);
  }

  destroy() {
    this.graphics.destroy();
  }
}
