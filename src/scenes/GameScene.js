import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ObjectPool } from '../core/ObjectPool.js';
import { BackgroundStarfield } from '../vfx/BackgroundStarfield.js';
import { ParticleSystem } from '../vfx/ParticleSystem.js';
import { DamageNumberManager } from '../entities/DamageNumber.js';
import { DropGemManager } from '../entities/DropGem.js';
import { Turret } from '../entities/Turret.js';
import { Shield } from '../entities/Shield.js';
import { EnemySpawner } from '../entities/EnemySpawner.js';
import { Bullet } from '../weapons/Bullet.js';
import {
  ChainLightningPassive,
  BlackHolePassive,
  ChronoMatrixPassive,
  NaniteSwarmPassive,
  OverchargePassive,
  RepulsorPassive,
  VampiricSiphonPassive,
  QuantumHarvesterPassive
} from '../weapons/SupportPassives.js';
import { HUD } from '../ui/HUD.js';
import { UpgradeModal } from '../ui/UpgradeModal.js';
import { GameOverModal } from '../ui/GameOverModal.js';
import { BossChestModal } from '../ui/BossChestModal.js';
import { PauseModal } from '../ui/PauseModal.js';
import { BalanceStatsTracker } from '../core/BalanceStatsTracker.js';
import { BalancePanel } from '../ui/BalancePanel.js';
import { CheatPanel } from '../ui/CheatPanel.js';
import { CONFIG } from '../config.js';
import {
  WEAPON_TYPES,
  PASSIVE_TYPES,
  getUpgradeDesc,
  getSynergy,
  getPassiveSynergy
} from '../weapons/WeaponRegistry.js';
import { sdk } from '../sdk/SDKManager.js';
import { audio } from '../audio/AudioManager.js';
import { t } from '../core/i18n.js';
import { glowVFX } from '../vfx/GlowVFX.js';

export class GameScene {
  constructor(starterWeapon = null) {
    this.starterWeapon = starterWeapon;
    this.engine = null;

    this.starfield = null;
    this.particles = null;
    this.damageNumbers = null;
    this.gems = null;
    this.turret = null;
    this.shield = null;
    this.spawner = null;
    this.bulletPool = null;
    this.activeBullets = [];

    this.lightningPassive = null;
    this.blackHolePassive = null;

    this.magmaPools = [];
    this.magmaGraphics = null;
    this.synergyBanner = null;
    this.synergyBannerTimer = 0;

    this.hud = null;
    this.upgradeModal = null;
    this.gameOverModal = null;
    this.tracker = null;
    this.balancePanel = null;
    this.cheatPanel = null;
    this.godMode = false;

    // Progression Stats
    this.level = 1;
    this.xp = 0;
    this.nextXp = 10;
    this.score = 0;
    this.kills = 0;
    this.gameTime = 0;
    this.isOver = false;
    this.expBonusTotal = 0;
  }

  addExpBonus(pct) {
    this.expBonusTotal = (this.expBonusTotal || 0) + pct;
  }

  getXpMultiplier() {
    const passiveBonus = this.quantumPassive?.expBonus || 0;
    return 1.0 + passiveBonus + (this.expBonusTotal || 0);
  }

  async init(engine) {
    this.engine = engine;

    const cx = this.engine.width / 2;
    const cy = this.engine.height / 2;

    // 1. Background
    this.starfield = new BackgroundStarfield(this.engine);

    // 2. VFX & Combat entities
    this.particles = new ParticleSystem(this.engine);
    this.damageNumbers = new DamageNumberManager(this.engine);
    this.gems = new DropGemManager(this.engine);

    this.magmaGraphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.magmaGraphics);

    // 3. Central Turret & Shield
    this.turret = new Turret(this.engine, cx, cy);
    if (this.starterWeapon) {
      this.turret.equipWeapon(this.starterWeapon);
    }

    this.shield = new Shield(this.engine, cx, cy);

    // 4. Enemy Spawner with Wave Callbacks
    this.spawner = new EnemySpawner(this.engine, (wave, isBoss) => this.onWaveChange(wave, isBoss));

    // 5. Bullet Object Pool
    this.bulletPool = new ObjectPool(
      () => new Bullet(this.engine),
      (bullet, config) => bullet.reset(config),
      80
    );

    const originalGet = this.bulletPool.get.bind(this.bulletPool);
    this.bulletPool.get = (config) => {
      const b = originalGet(config);
      this.activeBullets.push(b);
      return b;
    };

    // 6. Support Passives (Full Roster)
    this.passives = {
      [PASSIVE_TYPES.LIGHTNING]: new ChainLightningPassive(this.engine),
      [PASSIVE_TYPES.BLACK_HOLE]: new BlackHolePassive(this.engine),
      [PASSIVE_TYPES.CHRONO]: new ChronoMatrixPassive(this.engine),
      [PASSIVE_TYPES.NANITE]: new NaniteSwarmPassive(this.engine),
      [PASSIVE_TYPES.OVERCHARGE]: new OverchargePassive(this.engine),
      [PASSIVE_TYPES.REPULSOR]: new RepulsorPassive(this.engine),
      [PASSIVE_TYPES.VAMPIRIC]: new VampiricSiphonPassive(this.engine),
      [PASSIVE_TYPES.QUANTUM]: new QuantumHarvesterPassive(this.engine)
    };
    this.lightningPassive = this.passives[PASSIVE_TYPES.LIGHTNING];
    this.blackHolePassive = this.passives[PASSIVE_TYPES.BLACK_HOLE];
    this.chronoPassive = this.passives[PASSIVE_TYPES.CHRONO];
    this.nanitePassive = this.passives[PASSIVE_TYPES.NANITE];
    this.overchargePassive = this.passives[PASSIVE_TYPES.OVERCHARGE];
    this.repulsorPassive = this.passives[PASSIVE_TYPES.REPULSOR];
    this.vampiricPassive = this.passives[PASSIVE_TYPES.VAMPIRIC];
    this.quantumPassive = this.passives[PASSIVE_TYPES.QUANTUM];

    // 7. UI Components & Balance Inspector
    this.tracker = new BalanceStatsTracker(this.engine);
    this.balancePanel = new BalancePanel(this.engine, this.tracker);
    this.cheatPanel = new CheatPanel(this.engine, this);
    this.pauseModal = new PauseModal(this.engine, {
      onContinue: () => this.resumeFromPause(),
      onRestart: () => this.restart()
    });
    this.hud = new HUD(this.engine, {
      onPauseClick: () => this.openPauseMenu()
    });
    this.upgradeModal = new UpgradeModal(this.engine, (choice) => this.applyUpgrade(choice));
    this.gameOverModal = new GameOverModal(this.engine, {
      onRevive: () => this.revive(),
      onRestart: () => this.restart()
    });
    this.bossChestModal = new BossChestModal(this.engine, {
      onClaimFree: () => {
        this.addXp(800);
        this.engine.resume();
      },
      onClaimAd: () => {
        this.shield.currentHp = this.shield.maxHp;
        this.shield.isActive = true;
        this.turret.currentHp = this.turret.maxHp;
        this.addXp(2500);
        this.particles?.emitShockwave(this.turret.x, this.turret.y, 350, 0xffd700);
        audio.playLevelUp();
        this.engine.resume();
      }
    });

    if (this.starterWeapon) {
      this.spawner.start();
      sdk.gameplayStart();
      sdk.analytics.trackProgressionStage('stage_1', this.level, this.score);
    } else {
      this.engine.pause();
      this.upgradeModal.showStarterSelection((choice) => {
        this.starterWeapon = choice.id;
        this.turret.equipWeapon(choice.id);
        this.engine.resume();
        this.spawner.start();
        sdk.gameplayStart();
        sdk.analytics.trackProgressionStage('stage_1', this.level, this.score);
      });
    }
  }

  openPauseMenu() {
    if (this.isOver || this.upgradeModal?.container?.visible || this.bossChestModal?.container?.visible) {
      return;
    }
    if (this.pauseModal?.container?.visible) {
      this.resumeFromPause();
      return;
    }
    sdk.gameplayStop();
    this.engine.pause();
    this.pauseModal.show(this.spawner?.currentWave || 1, this.score);
  }

  resumeFromPause() {
    this.pauseModal.hide();
    this.engine.resume();
    sdk.gameplayStart();
  }

  showBossRewardChest(bossOrder) {
    if (this.isOver) return;
    sdk.happyTime();
    this.engine.pause();
    this.bossChestModal.show(bossOrder);
  }

  onWaveChange(wave, isBoss) {
    this.hud?.showWaveTransition(wave, isBoss);
    if (isBoss) {
      this.hud?.showBossWarning();
      audio.playExplosion(2.0);
    }
  }

  update(dt) {
    if (this.isOver) return;

    this.gameTime += dt;

    // 1. Visuals
    this.starfield.update(dt);
    this.particles.update(dt);
    glowVFX.update(dt);
    this.damageNumbers.update(dt);

    // 2. Shield & Turret
    this.shield.update(dt);
    this.turret.update(dt, this.spawner.enemies, this.engine.input.selectedTarget);

    // 3. Enemies
    this.spawner.update(dt, this.turret, this.shield);

    // 4. Gems Magnet & Collection (Homing into central turret)
    this.gems.update(dt, this.turret.x, this.turret.y, (xpVal) => {
      this.addXp(xpVal);
    });

    // 5. Bullets & Magma Pools
    this.updateBullets(dt);
    this.updateMagmaPools(dt);
    this.updateSynergyBanner(dt);

    // Synergy Check: Flame + Shield (Blazing Aegis Barrier)
    if (this.turret.hasSynergy('flame+passive_shield') && this.shield.isActive) {
      for (const enemy of this.spawner.enemies) {
        if (!enemy.isAlive) continue;
        if (Math.hypot(enemy.x - this.turret.x, enemy.y - this.turret.y) <= this.shield.radius + enemy.size) {
          enemy.takeDamage(55 * dt, 'burn');
          enemy.applyBurn(50, 1.5);
        }
      }
    }

    // 6. Passives (Full Roster)
    this.lightningPassive.update(dt, this.spawner.enemies);
    this.blackHolePassive.update(dt, this.spawner.enemies);
    this.chronoPassive.update(dt, this.spawner.enemies, this.turret);
    this.nanitePassive.update(dt, this.spawner.enemies, this.turret, this.shield);
    this.overchargePassive.update(dt, this.turret);
    this.repulsorPassive.update(dt, this.spawner.enemies, this.turret);
    this.vampiricPassive.update(dt, this.turret, this.shield);
    this.quantumPassive.update(dt, this.turret, this.spawner, this.gems);

    // 7. HUD & Balance Telemetry
    const activeBoss = this.spawner.getActiveBoss();
    this.hud.update(
      this.turret,
      this.shield,
      this.xp,
      this.nextXp,
      this.level,
      this.score,
      this.kills,
      this.spawner.currentWave,
      this.spawner.isBossWave(this.spawner.currentWave),
      dt,
      this.passives,
      this.blackHolePassive,
      activeBoss
    );

    if (this.godMode) {
      if (this.turret) this.turret.currentHp = this.turret.maxHp;
      if (this.shield) {
        this.shield.currentHp = this.shield.maxHp;
        this.shield.isActive = true;
      }
    }

    this.tracker.update(dt);
    this.balancePanel.update(dt);
    this.cheatPanel?.update(dt);
  }

  updateBullets(dt) {
    for (let i = this.activeBullets.length - 1; i >= 0; i--) {
      const bullet = this.activeBullets[i];
      if (!bullet.isAlive) {
        this.bulletPool.release(bullet);
        this.activeBullets.splice(i, 1);
        continue;
      }

      bullet.update(dt, this.spawner.enemies, this.particles);

      // Collision checks with living enemies
      if (bullet.isAlive) {
        for (const enemy of this.spawner.enemies) {
          if (!enemy.isAlive) continue;

          const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
          if (dist <= enemy.size + 10) {
            if (bullet.type === 'missile') {
              bullet.detonate(this.spawner.enemies, this.particles);
              bullet.isAlive = false;
              bullet.graphics.visible = false;
              break;
            } else if (bullet.type === 'bomb') {
              bullet.detonate(this.spawner.enemies, this.particles);
              if (bullet.bouncesLeft > 0) {
                bullet.bouncesLeft--;
                bullet.life = 0.5;
                bullet.vx = -bullet.vx * 0.7;
                bullet.vy = -bullet.vy * 0.7;
              } else if (bullet.splitCount > 0) {
                // Split into cluster mini-bombs
                const count = bullet.splitCount;
                for (let s = 0; s < count; s++) {
                  const sAngle = (s * Math.PI * 2) / count;
                  this.bulletPool.get({
                    type: 'bomb',
                    x: bullet.x,
                    y: bullet.y,
                    angle: sAngle,
                    speed: 240,
                    damage: bullet.damage * 0.6,
                    aoeRadius: bullet.isTier5 ? 120 : 65,
                    life: 0.45,
                    color: bullet.color,
                    isTier5: bullet.isTier5
                  });
                }
                bullet.isAlive = false;
                bullet.graphics.visible = false;
                break;
              } else {
                bullet.isAlive = false;
                bullet.graphics.visible = false;
                break;
              }
            } else if (bullet.type === 'frost_shard') {
              // FROST SHARD HIT
              enemy.takeDamage(bullet.damage, 'frost');
              enemy.applySlow(bullet.isTier5 ? 0.20 : 0.50, bullet.isTier5 ? 3.5 : 2.2);
              this.triggerSynergyProc('cryo', enemy, bullet.x, bullet.y);

              if (bullet.isTitanComet || (bullet.isTier5 && Math.random() < 0.45)) {
                // TITAN GLACIAL SHATTER NOVA EXPLOSION!
                audio.playExplosion?.();
                this.particles.emitExplosion(bullet.x, bullet.y, 140, 0xa5f3fc);
                this.particles.emitShockwave(bullet.x, bullet.y, 150, 0x00f0ff);
                for (const o of this.spawner.enemies) {
                  if (!o.isAlive) continue;
                  if (Math.hypot(o.x - bullet.x, o.y - bullet.y) <= 140) {
                    o.takeDamage(bullet.damage * 0.85, 'frost');
                    o.applySlow(0.01, 2.5); // 99% complete freeze stun!
                  }
                }
                // Burst into 8 secondary diamond ice crystals shooting outward
                for (let s = 0; s < 8; s++) {
                  const sAngle = (s * Math.PI * 2) / 8;
                  this.bulletPool.get({
                    type: 'frost_shard',
                    x: bullet.x,
                    y: bullet.y,
                    angle: sAngle,
                    speed: 460,
                    damage: bullet.damage * 0.4,
                    pierce: 2,
                    life: 0.9,
                    color: 0xa5f3fc
                  });
                }
              } else {
                this.particles.emit({
                  x: bullet.x,
                  y: bullet.y,
                  count: 4,
                  color: 0xa5f3fc,
                  speed: 70,
                  life: 0.16
                });
              }

              bullet.hitCount++;
              if (bullet.hitCount >= bullet.pierce) {
                bullet.isAlive = false;
                bullet.graphics.visible = false;
                break;
              }
            } else if (bullet.type === 'needle') {
              // NEEDLER HOMING CRYSTAL HIT
              enemy.takeDamage(bullet.damage, 'needle');
              enemy.needleHits = (enemy.needleHits || 0) + 1;
              this.triggerSynergyProc('swarm', enemy, bullet.x, bullet.y);

              if (enemy.needleHits >= 3) {
                // PRISMATIC SUPERCOMBINE CRYSTAL DETONATION!
                enemy.needleHits = 0;
                audio.playExplosion?.();
                this.particles.emitExplosion(enemy.x, enemy.y, 140, 0xec4899);
                this.particles.emitShockwave(enemy.x, enemy.y, 150, 0x06b6d4);

                const burstDmg = bullet.damage * (bullet.isTier5 ? 3.5 : 2.5);
                for (const o of this.spawner.enemies) {
                  if (!o.isAlive) continue;
                  if (Math.hypot(o.x - enemy.x, o.y - enemy.y) <= 140) {
                    o.takeDamage(burstDmg, 'explosion');
                  }
                }

                // Tier 5 Supercombine ricochet needles
                if (bullet.isTier5) {
                  for (let s = 0; s < 4; s++) {
                    const sAngle = (s * Math.PI * 2) / 4;
                    this.bulletPool.get({
                      type: 'needle',
                      x: enemy.x,
                      y: enemy.y,
                      angle: sAngle,
                      speed: 680,
                      damage: bullet.damage * 0.6,
                      pierce: 1,
                      life: 1.5,
                      color: 0x06b6d4,
                      isTier5: false
                    });
                  }
                }
              } else {
                this.particles.emit({
                  x: bullet.x,
                  y: bullet.y,
                  count: 3,
                  color: bullet.color || 0xec4899,
                  speed: 65,
                  life: 0.15
                });
              }

              bullet.hitCount++;
              if (bullet.hitCount >= bullet.pierce) {
                bullet.isAlive = false;
                bullet.graphics.visible = false;
                break;
              }
            } else if (bullet.type === 'void_slug') {
              // VOID ANTIMATTER SLUG HIT
              enemy.takeDamage(bullet.damage, 'void');
              this.triggerSynergyProc('void_railgun', enemy, bullet.x, bullet.y);
              this.particles.emit({
                x: bullet.x,
                y: bullet.y,
                count: bullet.isTier5 ? 8 : 4,
                color: 0x9333ea,
                speed: 120,
                life: 0.22,
                size: 4
              });

              // Spacetime Singularity Suction & Crushing Wake
              const pullRadius = bullet.isTier5 ? 200 : 120;
              for (const o of this.spawner.enemies) {
                if (!o.isAlive) continue;
                const d = Math.hypot(o.x - bullet.x, o.y - bullet.y);
                if (d <= pullRadius && d > 12) {
                  const pullForce = bullet.isTier5 ? 180 : 80;
                  o.x += ((bullet.x - o.x) / d) * pullForce * dt;
                  o.y += ((bullet.y - o.y) / d) * pullForce * dt;
                  o.graphics.x = o.x;
                  o.graphics.y = o.y;
                  if (bullet.isTier5) {
                    o.takeDamage(120 * dt, 'void');
                  }
                }
              }

              bullet.hitCount++;
              if (bullet.hitCount >= bullet.pierce) {
                bullet.isAlive = false;
                bullet.graphics.visible = false;
                break;
              }
            } else {
              // Kinetic bullet hit
              enemy.takeDamage(bullet.damage, 'normal');
              this.particles.emit({
                x: bullet.x,
                y: bullet.y,
                count: bullet.isTier5 ? 8 : 4,
                color: bullet.color,
                speed: bullet.isTier5 ? 120 : 60,
                life: 0.16
              });

              // Universal synergy procs for kinetic weapon
              this.triggerSynergyProc('kinetic', enemy, bullet.x, bullet.y);

              bullet.hitCount++;
              if (bullet.hitCount >= bullet.pierce) {
                bullet.isAlive = false;
                bullet.graphics.visible = false;
                break;
              }
            }
          }
        }
      }
    }
  }

  addMagmaPool(x, y, radius = 130, duration = 3.5, dps = 90) {
    if (this.magmaPools.length >= 8) {
      this.magmaPools.shift(); // keep max 8 active pools
    }
    this.magmaPools.push({
      x,
      y,
      radius,
      life: duration,
      maxLife: duration,
      dps,
      tickTimer: 0
    });
  }

  updateMagmaPools(dt) {
    if (!this.magmaGraphics) return;
    this.magmaGraphics.clear();
    if (this.magmaPools.length === 0) return;

    for (let i = this.magmaPools.length - 1; i >= 0; i--) {
      const pool = this.magmaPools[i];
      pool.life -= dt;
      pool.tickTimer += dt;

      if (pool.life <= 0) {
        this.magmaPools.splice(i, 1);
        continue;
      }

      const progress = pool.life / pool.maxLife; // 1 -> 0
      const alpha = Math.min(1, progress * 1.5);

      // Render molten magma lake
      // Outer scorching zone
      this.magmaGraphics.circle(pool.x, pool.y, pool.radius);
      this.magmaGraphics.fill({ color: 0x991b1b, alpha: 0.35 * alpha });
      // Inner molten lava
      this.magmaGraphics.circle(pool.x, pool.y, pool.radius * 0.75);
      this.magmaGraphics.fill({ color: 0xea580c, alpha: 0.55 * alpha });
      this.magmaGraphics.circle(pool.x, pool.y, pool.radius * 0.4);
      this.magmaGraphics.fill({ color: 0xfacc15, alpha: 0.7 * alpha });
      this.magmaGraphics.circle(pool.x, pool.y, pool.radius);
      this.magmaGraphics.stroke({ width: 2, color: 0xf97316, alpha: 0.8 * alpha });

      // Damage enemies standing in magma pool (throttled 0.2s)
      if (pool.tickTimer >= 0.2) {
        pool.tickTimer = 0;
        const tickDmg = pool.dps * 0.2;
        for (const enemy of this.spawner.enemies) {
          if (!enemy.isAlive) continue;
          if (Math.hypot(enemy.x - pool.x, enemy.y - pool.y) <= pool.radius + enemy.size) {
            enemy.takeDamage(tickDmg, 'burn');
            enemy.applyBurn(pool.dps, 1.5);
          }
        }
      }
    }
  }

  triggerSynergyProc(weaponId, enemy, hitX, hitY) {
    if (!enemy || !enemy.isAlive) return;

    // 1. Weapon + Weapon Fusion Proc
    const wSyn = this.turret.getWeaponSynergyFor(weaponId);
    if (wSyn) {
      const parts = wSyn.id.split('+');
      const partnerId = parts[0] === weaponId ? parts[1] : parts[0];

      switch (partnerId) {
        case 'missile':
          if (Math.random() < 0.35 && this.bulletPool) {
            this.bulletPool.get({
              type: 'missile',
              x: hitX,
              y: hitY,
              angle: Math.random() * Math.PI * 2,
              speed: 480,
              damage: 55,
              aoeRadius: 50,
              life: 2.0,
              color: 0xff0044
            });
          }
          break;
        case 'bomb':
          if (Math.random() < 0.30) {
            audio.playExplosion?.();
            this.particles.emitExplosion(hitX, hitY, 110, 0xaa00ff);
            for (const o of this.spawner.enemies) {
              if (o.isAlive && Math.hypot(o.x - hitX, o.y - hitY) <= 110) {
                o.takeDamage(60, 'explosion');
              }
            }
          }
          break;
        case 'laser':
          if (Math.random() < 0.35) {
            for (const o of this.spawner.enemies) {
              if (o !== enemy && o.isAlive && Math.hypot(o.x - hitX, o.y - hitY) <= 160) {
                o.takeDamage(65, 'laser');
                this.particles.emit({ x: o.x, y: o.y, count: 4, color: 0x00ffcc, speed: 80, life: 0.15 });
              }
            }
          }
          break;
        case 'flame':
          enemy.applyBurn(55, 2.5);
          this.particles.emit({ x: hitX, y: hitY, count: 4, color: 0xff4500, speed: 75, life: 0.18 });
          break;
        case 'sawblade':
          if (Math.random() < 0.35 && this.bulletPool) {
            this.bulletPool.get({
              type: 'sawblade',
              x: hitX,
              y: hitY,
              angle: Math.random() * Math.PI * 2,
              speed: 380,
              damage: 48,
              pierce: 4,
              life: 1.0,
              color: 0xd946ef
            });
          }
          break;
        case 'cryo':
          enemy.applySlow(0.25, 2.0);
          this.particles.emit({ x: hitX, y: hitY, count: 4, color: 0x38bdf8, speed: 70, life: 0.2 });
          break;
        case 'swarm':
          if (Math.random() < 0.35 && this.bulletPool) {
            for (let i = 0; i < 2; i++) {
              this.bulletPool.get({
                type: 'needle',
                x: hitX,
                y: hitY,
                angle: Math.random() * Math.PI * 2,
                speed: 620,
                damage: 35,
                pierce: 1,
                life: 1.5,
                color: 0xec4899
              });
            }
          }
          break;
        case 'tesla':
          if (Math.random() < 0.35) {
            let zCount = 0;
            for (const o of this.spawner.enemies) {
              if (o !== enemy && o.isAlive && zCount < 3 && Math.hypot(o.x - hitX, o.y - hitY) <= 160) {
                o.takeDamage(60, 'lightning');
                this.particles.emit({ x: o.x, y: o.y, count: 4, color: 0xffea00, speed: 90, life: 0.16 });
                zCount++;
              }
            }
          }
          break;
        case 'void_railgun':
          if (Math.random() < 0.25) {
            for (const o of this.spawner.enemies) {
              if (o.isAlive && Math.hypot(o.x - hitX, o.y - hitY) <= 160) {
                o.x += (hitX - o.x) * 0.22;
                o.y += (hitY - o.y) * 0.22;
                o.takeDamage(45, 'void');
              }
            }
            this.particles.emitExplosion(hitX, hitY, 100, 0x9333ea);
          }
          break;
        case 'kinetic':
          if (Math.random() < 0.35 && this.bulletPool) {
            this.bulletPool.get({
              type: 'normal',
              x: hitX,
              y: hitY,
              angle: Math.random() * Math.PI * 2,
              speed: 680,
              damage: 45,
              pierce: 2,
              life: 0.6,
              color: 0x00f0ff
            });
          }
          break;
      }
    }

    // 2. Weapon + Passive Fusion Proc
    const pSyn = this.turret.getPassiveSynergyFor(weaponId);
    if (pSyn) {
      const passiveId = pSyn.id.split('+')[1];
      switch (passiveId) {
        case PASSIVE_TYPES.LIGHTNING:
          if (Math.random() < 0.35) {
            let zap = 0;
            for (const o of this.spawner.enemies) {
              if (o !== enemy && o.isAlive && zap < 3 && Math.hypot(o.x - hitX, o.y - hitY) <= 150) {
                o.takeDamage(55, 'lightning');
                this.particles.emit({ x: o.x, y: o.y, count: 4, color: 0xffea00, speed: 90, life: 0.15 });
                zap++;
              }
            }
          }
          break;
        case PASSIVE_TYPES.BLACK_HOLE:
          if (Math.random() < 0.25) {
            for (const o of this.spawner.enemies) {
              if (o.isAlive && Math.hypot(o.x - hitX, o.y - hitY) <= 140) {
                o.x += (hitX - o.x) * 0.2;
                o.y += (hitY - o.y) * 0.2;
                o.takeDamage(35, 'void');
              }
            }
            this.particles.emit({ x: hitX, y: hitY, count: 5, color: 0x9d4edd, speed: 60, life: 0.2 });
          }
          break;
        case PASSIVE_TYPES.SHIELD:
          if (this.shield && this.shield.isActive && this.shield.currentHp < this.shield.maxHp && Math.random() < 0.3) {
            this.shield.currentHp = Math.min(this.shield.maxHp, this.shield.currentHp + 2.5);
            this.particles.emit({ x: this.turret.x, y: this.turret.y, count: 3, color: 0x00e5ff, speed: 40, life: 0.2 });
          }
          break;
        case PASSIVE_TYPES.CHRONO:
          enemy.applySlow(0.25, 2.2);
          this.particles.emit({ x: hitX, y: hitY, count: 4, color: 0x38bdf8, speed: 50, life: 0.2 });
          break;
        case PASSIVE_TYPES.NANITE:
          enemy.takeDamage(30, 'acid');
          this.particles.emit({ x: hitX, y: hitY, count: 4, color: 0x10b981, speed: 60, life: 0.2 });
          break;
        case PASSIVE_TYPES.OVERCHARGE:
          if (Math.random() < 0.35) {
            enemy.takeDamage(75, 'crit');
            this.particles.emitShockwave(hitX, hitY, 100, 0xffea00);
          }
          break;
        case PASSIVE_TYPES.REPULSOR:
          if (Math.random() < 0.35) {
            const angleFromTurret = Math.atan2(enemy.y - this.turret.y, enemy.x - this.turret.x);
            enemy.x += Math.cos(angleFromTurret) * 60;
            enemy.y += Math.sin(angleFromTurret) * 60;
            this.particles.emitShockwave(hitX, hitY, 80, 0x0284c7);
          }
          break;
        case PASSIVE_TYPES.VAMPIRIC:
          if (this.vampiricPassive && Math.random() < 0.4) {
            this.vampiricPassive.onEnemyKilled(hitX, hitY);
          }
          break;
        case PASSIVE_TYPES.QUANTUM:
          if (Math.random() < 0.35 && this.gems) {
            this.gems.spawn(hitX + (Math.random() - 0.5) * 10, hitY + (Math.random() - 0.5) * 10, 15, true);
            this.particles.emit({ x: hitX, y: hitY, count: 5, color: 0x10b981, speed: 70, life: 0.2 });
          }
          break;
      }
    }
  }

  showSynergyBanner(syn) {
    if (!syn) return;
    audio.playLevelUp();
    audio.playExplosion(1.5);

    // Remove existing banner if any
    if (this.synergyBanner) {
      this.engine.uiLayer.removeChild(this.synergyBanner);
      this.synergyBanner.destroy({ children: true });
      this.synergyBanner = null;
    }

    const container = new Container();
    container.x = this.engine.width / 2;
    container.y = 120;
    container.alpha = 0;

    const bg = new Graphics();
    bg.roundRect(-260, -32, 520, 64, 12);
    bg.fill({ color: 0x030712, alpha: 0.92 });
    bg.roundRect(-260, -32, 520, 64, 12);
    bg.stroke({ width: 2.5, color: syn.color || 0xffd700 });
    container.addChild(bg);

    const title = new Text({
      text: t('synergy.banner_title', { name: syn.name }),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16,
        fontWeight: '900',
        fill: '#ffd700',
        dropShadow: { color: '#ffea00', blur: 8, distance: 0 }
      })
    });
    title.anchor.set(0.5);
    title.y = -10;
    container.addChild(title);

    const desc = new Text({
      text: getUpgradeDesc(syn),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 11,
        fill: '#e2e8f0',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 490
      })
    });
    desc.anchor.set(0.5);
    desc.y = 12;
    container.addChild(desc);

    this.engine.uiLayer.addChild(container);
    this.synergyBanner = container;
    this.synergyBannerTimer = 4.0;
  }

  updateSynergyBanner(dt) {
    if (!this.synergyBanner) return;
    this.synergyBannerTimer -= dt;
    if (this.synergyBannerTimer > 3.6) {
      this.synergyBanner.alpha = Math.min(1, (4.0 - this.synergyBannerTimer) * 2.5);
    } else if (this.synergyBannerTimer <= 0.6) {
      this.synergyBanner.alpha = Math.max(0, this.synergyBannerTimer / 0.6);
      if (this.synergyBannerTimer <= 0) {
        this.engine.uiLayer.removeChild(this.synergyBanner);
        this.synergyBanner.destroy({ children: true });
        this.synergyBanner = null;
      }
    } else {
      this.synergyBanner.alpha = 1;
    }
  }

  showLevelUpCelebration(level, onComplete) {
    if (this.levelUpAnimId) {
      cancelAnimationFrame(this.levelUpAnimId);
      this.levelUpAnimId = null;
    }
    if (this.levelUpBanner) {
      this.engine.uiLayer.removeChild(this.levelUpBanner);
      this.levelUpBanner.destroy({ children: true });
      this.levelUpBanner = null;
    }

    const banner = new Container();
    banner.x = this.engine.width / 2;
    banner.y = this.engine.height / 2 - 20;
    banner.alpha = 0;
    banner.scale.set(0.4);

    const bW = 420;
    const bH = 115;

    const bg = new Graphics();
    // Radiant gold outer aura
    bg.roundRect(-bW / 2 - 4, -bH / 2 - 4, bW + 8, bH + 8, 18);
    bg.stroke({ width: 4.5, color: 0xffd700, alpha: 0.65 });
    // Core badge
    bg.roundRect(-bW / 2, -bH / 2, bW, bH, 14);
    bg.fill({ color: 0x030712, alpha: 0.95 });
    bg.roundRect(-bW / 2, -bH / 2, bW, bH, 14);
    bg.stroke({ width: 2, color: 0x00f0ff, alpha: 0.95 });
    banner.addChild(bg);

    const titleText = new Text({
      text: t('levelup.title'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 30,
        fontWeight: '900',
        fill: '#ffd700',
        letterSpacing: 2,
        dropShadow: { color: '#ffaa00', blur: 14, distance: 0 }
      })
    });
    titleText.anchor.set(0.5);
    titleText.y = -22;
    banner.addChild(titleText);

    const subText = new Text({
      text: t('levelup.congrats', { level }),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#00f0ff',
        letterSpacing: 1.2,
        dropShadow: { color: '#00f0ff', blur: 8, distance: 0 }
      })
    });
    subText.anchor.set(0.5);
    subText.y = 18;
    banner.addChild(subText);

    this.engine.uiLayer.addChild(banner);
    this.levelUpBanner = banner;

    const startTime = performance.now();
    const duration = 540; // 540ms total duration

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 0.65) {
        // Pop in with smooth overshoot
        const p = progress / 0.65;
        const ease = 1 - Math.pow(1 - p, 3);
        banner.alpha = Math.min(1, p * 1.5);
        banner.scale.set(0.4 + 0.65 * ease);
      } else if (progress < 0.85) {
        // Hold proudly
        banner.alpha = 1;
        banner.scale.set(1.05 - (progress - 0.65) * 0.25);
      } else {
        // Exit fade
        const pExit = (progress - 0.85) / 0.15;
        banner.alpha = Math.max(0, 1 - pExit);
        banner.scale.set(1.0 + pExit * 0.08);
      }

      if (progress < 1) {
        this.levelUpAnimId = requestAnimationFrame(animate);
      } else {
        this.levelUpAnimId = null;
        if (this.levelUpBanner) {
          this.engine.uiLayer.removeChild(this.levelUpBanner);
          this.levelUpBanner.destroy({ children: true });
          this.levelUpBanner = null;
        }
        onComplete?.();
      }
    };

    this.levelUpAnimId = requestAnimationFrame(animate);
  }

  addXp(amount) {
    const mult = this.getXpMultiplier();
    const effectiveAmount = Math.max(1, Math.round(amount * mult));
    this.xp += effectiveAmount;
    this.score += effectiveAmount * 10;

    if (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level++;
      if (this.level >= 18) {
        this.nextXp = Math.floor(this.nextXp * 1.14 + 12);
      } else if (this.level >= 12) {
        this.nextXp = Math.floor(this.nextXp * 1.20 + 8);
      } else {
        this.nextXp = Math.floor(this.nextXp * 1.28 + 6);
      }
      this.particles?.emitShockwave(this.turret.x, this.turret.y, 280, 0x00f0ff);
      audio.playLevelUp();
      this.engine.pause();
      this.showLevelUpCelebration(this.level, () => {
        this.triggerLevelUp();
      });
    }
  }

  onEnemyKilled(enemy) {
    this.kills++;
    this.score += enemy.xp * 50;

    if (this.engine.input.selectedTarget === enemy) {
      this.engine.input.clearSelectedTarget();
    }

    // Vampiric Siphon essence harvesting
    this.vampiricPassive?.onEnemyKilled(enemy.x, enemy.y);

    // Quantum Harvester Tier 2+: 20% chance for extra Green Mega Gem drop
    if (this.quantumPassive?.tier >= 2 && Math.random() < 0.20) {
      this.gems?.spawn(enemy.x + (Math.random() - 0.5) * 16, enemy.y + (Math.random() - 0.5) * 16, Math.max(15, enemy.xp * 2), true);
    }
  }

  triggerLevelUp() {
    this.engine.pause();
    this.upgradeModal.show(
      this.turret,
      this.shield,
      this.passives
    );
  }

  applyUpgrade(choice) {
    if (choice.type === 'synergy') {
      if (!this.turret.activeSynergies.some(s => s.id === choice.id)) {
        this.turret.activeSynergies.push(choice.syn);
      }
      this.showSynergyBanner(choice.syn);
    } else if (choice.type === 'overdrive_bonus') {
      this.shield.currentHp = this.shield.maxHp;
      this.shield.isActive = true;
      for (const w of this.turret.equippedWeapons) {
        w.damageMultiplier += 0.20;
      }
      this.addExpBonus(0.35); // +35% permanent EXP bonus
      this.particles?.emitShockwave(this.turret.x, this.turret.y, 300, 0x00f0ff);
      audio.playLevelUp();
    } else if (choice.type === 'weapon_new') {
      this.turret.equipWeapon(choice.id);
    } else if (choice.type === 'weapon_sub_upgrade') {
      const weapon = this.turret.equippedWeapons.find(w => w.id === choice.id);
      if (weapon) {
        weapon.applySubUpgrade(choice.subKey);
      }
    } else if (choice.type === 'weapon_major_upgrade' || choice.type === 'weapon_upgrade') {
      const weapon = this.turret.equippedWeapons.find(w => w.id === choice.id);
      if (weapon) weapon.upgrade();
    } else if (choice.type === 'passive_shield') {
      this.shield.upgrade();
    } else if (this.passives && this.passives[choice.type]) {
      this.passives[choice.type].upgrade();
    }

    this.engine.resume();
  }

  onGameOver() {
    if (this.isOver) return;
    this.isOver = true;
    sdk.gameplayStop();
    this.engine.pause();
    this.tracker?.dumpStats(); // Output full balance breakdown to console
    this.gameOverModal.show(this.score, this.kills, this.gameTime);
    sdk.analytics.trackProgressionStage('game_over', this.level, this.score);
  }

  revive() {
    this.isOver = false;
    this.turret.currentHp = this.turret.maxHp * 0.5;
    this.shield.isActive = true;
    this.shield.currentHp = this.shield.maxHp * 0.5;

    // Clear enemies near turret
    for (const enemy of this.spawner.enemies) {
      if (!enemy.isAlive) continue;
      const d = Math.hypot(enemy.x - this.turret.x, enemy.y - this.turret.y);
      if (d < 350) {
        enemy.die();
      }
    }
    this.particles.emitShockwave(this.turret.x, this.turret.y, 300, 0x00f0ff);
    this.engine.resume();
    sdk.gameplayStart();
  }

  // ==========================================
  // DEVELOPER CHEAT CONTROLS (Live Cheat API)
  // ==========================================
  setLevel(targetLevel) {
    this.level = Math.max(1, targetLevel);
    let next = 20;
    for (let l = 1; l < this.level; l++) {
      if (l >= 18) next = Math.floor(next * 1.14 + 12);
      else if (l >= 12) next = Math.floor(next * 1.20 + 8);
      else next = Math.floor(next * 1.28 + 6);
    }
    this.nextXp = next;
    this.xp = 0;
    audio.playLevelUp?.();
    this.particles?.emitShockwave(this.turret.x, this.turret.y, 220, 0x00f0ff);
  }

  setWeaponTier(weaponId, targetTier, forceSlot = false) {
    targetTier = Math.max(1, Math.min(5, targetTier));
    let weapon = this.turret.equippedWeapons.find(w => w.id === weaponId);

    if (!weapon) {
      if (!forceSlot && this.turret.equippedWeapons.length >= CONFIG.TURRET.MAX_WEAPONS) {
        // Swap with the last secondary weapon slot
        this.turret.equippedWeapons.splice(this.turret.equippedWeapons.length - 1, 1);
      }
      weapon = this.turret.equipWeapon(weaponId, forceSlot);
      if (!weapon) return;
    }

    if (targetTier > weapon.tier) {
      while (weapon.tier < targetTier) {
        weapon.upgrade();
      }
    } else if (targetTier < weapon.tier) {
      // Re-create at tier 1 and upgrade to targetTier
      const idx = this.turret.equippedWeapons.indexOf(weapon);
      this.turret.equippedWeapons.splice(idx, 1);
      weapon = this.turret.equipWeapon(weaponId, true);
      while (weapon.tier < targetTier) {
        weapon.upgrade();
      }
    }
    this.turret.assignMountOffsets();
    audio.playPowerUp?.(1.3);
  }

  removeWeapon(weaponId) {
    const idx = this.turret.equippedWeapons.findIndex(w => w.id === weaponId);
    if (idx !== -1) {
      this.turret.equippedWeapons.splice(idx, 1);
      this.turret.assignMountOffsets();
      audio.playClick?.();
    }
  }

  removeAllWeapons() {
    this.turret.equippedWeapons = [];
    audio.playClick?.();
  }

  maxEquippedWeapons() {
    for (const w of this.turret.equippedWeapons) {
      while (w.tier < 5) {
        w.upgrade();
      }
    }
    audio.playLevelUp?.();
  }

  equipAllWeaponsMax() {
    for (const wType of Object.values(WEAPON_TYPES)) {
      this.setWeaponTier(wType, 5, true);
    }
    audio.playLevelUp?.();
  }

  setShieldTier(targetTier) {
    targetTier = Math.max(1, Math.min(5, targetTier));
    this.shield.tier = 1;
    this.shield.maxHp = CONFIG.SHIELD.BASE_HP;
    this.shield.currentHp = this.shield.maxHp;
    this.shield.radius = CONFIG.SHIELD.BASE_RADIUS;
    while (this.shield.tier < targetTier) {
      this.shield.upgrade();
    }
    this.shield.currentHp = this.shield.maxHp;
    this.shield.isActive = true;
  }

  setPassiveTier(passiveKey, targetTier) {
    if (passiveKey === PASSIVE_TYPES.SHIELD) {
      this.setShieldTier(targetTier);
      audio.playPowerUp?.(1.4);
      return;
    }

    const passive = this.passives ? this.passives[passiveKey] : null;
    if (!passive) return;

    targetTier = Math.max(0, Math.min(5, targetTier));
    if (targetTier === 0) {
      passive.tier = 0;
      passive.graphics?.clear();
      if (passive.holes) passive.holes = [];
      if (passive.linesToDraw) passive.linesToDraw = [];
      if (passive.sparks) passive.sparks = [];
      if (passive.rings) passive.rings = [];
      if (passive.motes) passive.motes = [];
      if (passive.stacks !== undefined) passive.stacks = 0;
      audio.playClick?.();
      return;
    }

    // Reset to tier 0 then upgrade targetTier times
    passive.tier = 0;
    for (let i = 0; i < targetTier; i++) {
      passive.upgrade();
    }
    audio.playPowerUp?.(1.4);
  }

  maxAllPassives() {
    this.setShieldTier(5);
    for (const pKey of Object.keys(this.passives)) {
      this.setPassiveTier(pKey, 5);
    }
    audio.playLevelUp?.();
  }

  resetAllPassives() {
    this.setShieldTier(1);
    for (const pKey of Object.keys(this.passives)) {
      this.setPassiveTier(pKey, 0);
    }
    audio.playClick?.();
  }

  killAllEnemies() {
    let killed = 0;
    for (const e of this.spawner.enemies) {
      if (e.isAlive) {
        e.takeDamage(999999, 'cheat');
        killed++;
      }
    }
    audio.playExplosion?.();
    return killed;
  }

  setWave(targetWave) {
    this.spawner.currentWave = Math.max(1, targetWave);
    this.spawner.waveTimer = 0;
    const isBoss = this.spawner.isBossWave(this.spawner.currentWave);
    this.onWaveChange(this.spawner.currentWave, isBoss);
    if (isBoss) {
      this.spawner.spawnMegaBoss();
    }
    audio.playLevelUp?.();
  }

  nextWave() {
    this.setWave(this.spawner.currentWave + 1);
  }

  spawnMegaBossNow() {
    this.spawner.spawnMegaBoss();
    this.hud?.showBossWarning();
    audio.playExplosion?.(2.0);
  }

  magnetAllGems() {
    if (this.gems && this.gems.activeGems) {
      for (const g of this.gems.activeGems) {
        if (g.isAlive) {
          g.isMagnetized = true;
          g.homingSpeed = 1600;
        }
      }
    }
    audio.playPowerUp?.(1.6);
  }

  fullHeal() {
    this.turret.currentHp = this.turret.maxHp;
    this.shield.currentHp = this.shield.maxHp;
    this.shield.isActive = true;
    audio.playPowerUp?.();
    this.particles?.emitShockwave(this.turret.x, this.turret.y, 160, 0x00ff66);
  }

  unlockAllEquippedSynergies() {
    const weapons = this.turret.equippedWeapons;
    // Weapon-Weapon
    for (let i = 0; i < weapons.length; i++) {
      for (let j = i + 1; j < weapons.length; j++) {
        const syn = getSynergy(weapons[i].id, weapons[j].id);
        if (syn && !this.turret.activeSynergies.some(s => s.id === syn.id)) {
          this.turret.activeSynergies.push(syn);
          this.showSynergyBanner(syn);
        }
      }
    }
    // Weapon-Passive
    for (const w of weapons) {
      for (const [pKey, pInstance] of Object.entries(this.passives)) {
        if (pInstance && pInstance.tier > 0) {
          const syn = getPassiveSynergy(w.id, pKey);
          if (syn && !this.turret.activeSynergies.some(s => s.id === syn.id)) {
            this.turret.activeSynergies.push(syn);
            this.showSynergyBanner(syn);
          }
        }
      }
      if (this.shield && this.shield.tier >= 1) {
        const syn = getPassiveSynergy(w.id, PASSIVE_TYPES.SHIELD);
        if (syn && !this.turret.activeSynergies.some(s => s.id === syn.id)) {
          this.turret.activeSynergies.push(syn);
          this.showSynergyBanner(syn);
        }
      }
    }
  }

  activateCuratedSynergy(item) {
    if (item.w) this.setWeaponTier(item.w, 5);
    if (item.w2) this.setWeaponTier(item.w2, 5);
    if (item.p) this.setPassiveTier(item.p, 5);

    let syn = null;
    if (item.w2) {
      syn = getSynergy(item.w, item.w2);
    } else if (item.p) {
      syn = getPassiveSynergy(item.w, item.p);
    }
    if (syn && !this.turret.activeSynergies.some(s => s.id === syn.id)) {
      this.turret.activeSynergies.push(syn);
      this.showSynergyBanner(syn);
    }
  }

  clearAllSynergies() {
    this.turret.activeSynergies = [];
    audio.playClick?.();
  }

  restart() {
    this.engine.resume();
    this.engine.sceneManager.loadScene('menu');
  }

  destroy() {
    sdk.gameplayStop();
    if (this.starfield) this.starfield.destroy();
    if (this.particles) this.particles.destroy();
    if (this.damageNumbers) this.damageNumbers.destroy();
    if (this.gems) this.gems.destroy();
    if (this.turret) this.turret.destroy();
    if (this.shield) this.shield.destroy();
    if (this.spawner) this.spawner.destroy();
    if (this.passives) {
      Object.values(this.passives).forEach(p => {
        if (typeof p.destroy === 'function') p.destroy();
      });
    }
    if (this.hud) this.hud.destroy();
    if (this.balancePanel) this.balancePanel.destroy();
    if (this.cheatPanel) this.cheatPanel.destroy?.();
    if (this.upgradeModal) this.upgradeModal.destroy();
    if (this.pauseModal) this.pauseModal.destroy();
    if (this.gameOverModal) this.gameOverModal.destroy();
    if (this.magmaGraphics) this.magmaGraphics.destroy();
    if (this.synergyBanner) this.synergyBanner.destroy({ children: true });
    if (this.levelUpAnimId) cancelAnimationFrame(this.levelUpAnimId);
    if (this.levelUpBanner) this.levelUpBanner.destroy({ children: true });

    this.activeBullets.forEach(b => {
      b.isAlive = false;
      this.bulletPool.release(b);
    });
    this.activeBullets = [];
    if (this.bulletPool) this.bulletPool.clear();
  }
}
