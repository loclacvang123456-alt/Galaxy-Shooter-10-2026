import { Graphics } from 'pixi.js';
import { CONFIG } from '../config.js';
import { Enemy } from './Enemy.js';
import { ObjectPool } from '../core/ObjectPool.js';
import { audio } from '../audio/AudioManager.js';
import { glowVFX } from '../vfx/GlowVFX.js';

export class EnemySpawner {
  constructor(engine, onWaveChange) {
    this.engine = engine;
    this.onWaveChange = onWaveChange;
    this.enemies = [];

    this.currentWave = 1;
    this.waveTimer = 0;
    this.totalTime = 0;
    this.waveDuration = CONFIG.WAVE.DURATION; // 25s
    this.spawnIntervalTimer = 0;
    this.swarmBurstTimer = 0;

    // Magnetic Flux Tether Graphics (between twin enemies)
    this.tetherGraphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.tetherGraphics);

    // Mega Boss Plasma Barrage Graphics & State
    this.bossProjectiles = [];
    this.bossAttackTimer = 0;
    this.projGraphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.projGraphics);

    this.pool = new ObjectPool(
      () => new Enemy(this.engine),
      (enemy, config, x, y) => enemy.reset(config, x, y),
      120
    );
  }

  start() {
    this.onWaveChange?.(this.currentWave, this.isBossWave(this.currentWave));
  }

  isBossWave(wave) {
    return wave > 0 && wave % CONFIG.WAVE.BOSS_INTERVAL === 0;
  }

  isBossAlive() {
    return this.enemies.some(e => e.isAlive && (e.isBoss || e.type === 'mega_boss' || e.type.startsWith('boss_')));
  }

  getActiveBoss() {
    return this.enemies.find(e => e.isAlive && (e.isBoss || e.type === 'mega_boss' || e.type.startsWith('boss_'))) || null;
  }

  getMaxActiveEnemies() {
    if (this.currentWave <= 2) return 15;
    if (this.currentWave <= 4) return 20;
    if (this.currentWave === 5) return 25; // Focus on Mega Boss duel
    if (this.currentWave <= 8) return 32;
    return Math.min(42, 28 + (this.currentWave - 5) * 2); // Cap at 42 maximum late game
  }

  // Tăng máu theo wave & thời gian: 5 wave đầu nhẹ nhàng, sau đó tăng tốc tương xứng với hỏa lực người chơi
  getHealthMultiplier() {
    if (this.currentWave <= 5) {
      // 5 round đầu: Máu tăng rất nhẹ (+6% mỗi wave, +10% mỗi 60 giây)
      const timeScale = 1 + (this.totalTime / 60) * 0.10;
      const waveScale = 1 + (this.currentWave - 1) * 0.06;
      return timeScale * waveScale;
    }
    if (this.currentWave <= 15) {
      // Wave 6-15: Tăng tiến đều đặn
      const waveScale = 1.3 + (this.currentWave - 5) * 0.22;
      const timeScale = 1 + Math.max(0, (this.totalTime - 125) / 60) * 0.18;
      return waveScale * timeScale;
    }
    if (this.currentWave <= 30) {
      // Wave 16-30: Quái trâu hơn để tương xứng với súng Tier 4-5
      const waveScale = 3.5 * Math.pow(1.075, this.currentWave - 15);
      const timeScale = 1 + Math.max(0, (this.totalTime - 125) / 60) * 0.20;
      return waveScale * timeScale;
    }
    // Wave 31+: Late-game scaling thực thụ cho người chơi có siêu kết hợp
    const baseWave30 = 3.5 * Math.pow(1.075, 15);
    const waveScale = baseWave30 * Math.pow(1.085, this.currentWave - 30);
    const timeScale = 1 + Math.max(0, (this.totalTime - 125) / 60) * 0.20;
    return waveScale * timeScale;
  }

  // Tăng tốc độ di chuyển của quái theo wave để tạo áp lực áp sát (tối đa +60%)
  getSpeedMultiplier() {
    if (this.currentWave <= 5) return 1.0;
    return Math.min(1.60, 1.0 + (this.currentWave - 5) * 0.012);
  }

  // Tăng kinh nghiệm rơi từ quái, đặc biệt tăng mạnh từ Wave 17 trở đi để tránh nghẽn cấp độ
  getXpMultiplier() {
    if (this.currentWave <= 10) return 1.0;
    if (this.currentWave <= 16) return 1.0 + (this.currentWave - 10) * 0.06;
    // Wave 17+ tăng mạnh XP (Wave 17: 1.85x, Wave 20: 2.6x, Wave 25: 3.85x)
    return 1.6 + (this.currentWave - 16) * 0.25;
  }

  update(dt, turret, shield) {
    this.waveTimer += dt;
    this.totalTime += dt;

    // Check Wave Advancement
    if (this.waveTimer >= this.waveDuration) {
      this.waveTimer = 0;
      this.currentWave++;
      const isBoss = this.isBossWave(this.currentWave);
      this.onWaveChange?.(this.currentWave, isBoss);

      if (isBoss) {
        this.spawnMegaBoss();
      }
    }

    const bossActive = this.isBossAlive();
    const maxEnemies = this.getMaxActiveEnemies();

    // Spawn Frequency & Batch Count
    let spawnInterval;
    let batchCount;

    if (bossActive) {
      // Khi Boss đang chiến đấu: Giảm mạnh quái thường để tập trung đánh Boss
      spawnInterval = 2.4;
      batchCount = 1;
    } else if (this.currentWave <= 2) {
      // Wave 1-2: Thong thả 1 quái/lần cho người chơi ngắm bắn thủ công
      spawnInterval = 1.6 - (this.currentWave * 0.2); // Wave 1: 1.4s, Wave 2: 1.2s
      batchCount = 1;
    } else if (this.currentWave <= 5) {
      // Wave 3-5: Nhịp độ vừa phải
      spawnInterval = 1.1 - ((this.currentWave - 2) * 0.15); // Wave 3: 0.95s, Wave 4: 0.8s
      batchCount = (Math.random() < 0.35 ? 2 : 1);
    } else {
      // Wave 6+: Thử thách vừa sức, nhịp độ mượt mà không dồn dập
      spawnInterval = Math.max(0.28, 0.90 - ((this.currentWave - 5) * 0.04));
      batchCount = Math.min(3, 1 + Math.floor((this.currentWave - 5) * 0.3));
    }

    this.spawnIntervalTimer += dt;
    if (this.spawnIntervalTimer >= spawnInterval) {
      this.spawnIntervalTimer = 0;
      if (this.enemies.length < maxEnemies) {
        for (let b = 0; b < batchCount; b++) {
          if (this.enemies.length >= maxEnemies) break;
          this.spawnRandomEnemy();
        }
      }
    }

    // Periodic Swarm Rushes (Tắt khi có Boss hoặc khi đạt giới hạn quái)
    this.swarmBurstTimer += dt;
    if (this.currentWave <= 2 || bossActive) {
      this.swarmBurstTimer = 0;
    } else {
      const swarmCooldown = this.currentWave <= 5
        ? (14.0 - this.currentWave * 1.0)
        : Math.max(4.5, 9.0 - this.currentWave * 0.4);

      if (this.swarmBurstTimer >= swarmCooldown) {
        this.swarmBurstTimer = 0;
        if (this.enemies.length < maxEnemies - 5) {
          this.triggerSwarmRush();
        }
      }
    }

    // Update active enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.isAlive) {
        this.pool.release(e);
        this.enemies.splice(i, 1);
        continue;
      }
      e.update(dt, turret, shield, this);
    }

    // Mega Boss Plasma Barrage Attack (Bắn đạn năng lượng tấn công Shield & Trụ người chơi)
    if (bossActive) {
      const boss = this.getActiveBoss();
      if (boss) {
        this.bossAttackTimer += dt;
        if (this.bossAttackTimer >= 3.2) {
          this.bossAttackTimer = 0;
          const angleToTurret = Math.atan2(turret.y - boss.y, turret.x - boss.x);
          const orbCount = 3;
          for (let o = 0; o < orbCount; o++) {
            const spread = (o - 1) * 0.24;
            const shootAngle = angleToTurret + spread;
            const orbSpeed = 340;
            this.bossProjectiles.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(shootAngle) * orbSpeed,
              vy: Math.sin(shootAngle) * orbSpeed,
              damage: 25 + Math.min(65, this.currentWave * 0.9),
              life: 3.5,
              size: 8
            });
          }
          audio.playShoot();
          this.engine.sceneManager.currentScene?.particles?.emitShockwave(boss.x, boss.y, 70, 0xff0055);
        }
      }
    }

    // Update Boss Projectiles
    if (this.projGraphics) {
      this.projGraphics.clear();
      for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
        const p = this.bossProjectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        this.projGraphics.circle(p.x, p.y, p.size);
        this.projGraphics.fill({ color: 0xff0055 });
        this.projGraphics.circle(p.x, p.y, p.size * 0.5);
        this.projGraphics.fill({ color: 0xffffff });

        const distToTurret = Math.hypot(turret.x - p.x, turret.y - p.y);
        let hit = false;
        if (shield.isActive && distToTurret <= shield.radius + p.size) {
          shield.takeDamage(p.damage);
          hit = true;
        } else if (distToTurret <= turret.radius + p.size) {
          turret.takeDamage(p.damage * 0.8);
          hit = true;
        }

        if (hit) {
          audio.playShieldHit();
          this.engine.sceneManager.currentScene?.particles?.emit({
            x: p.x,
            y: p.y,
            count: 7,
            color: 0xff0055,
            speed: 80,
            life: 0.16
          });
          this.bossProjectiles.splice(i, 1);
          continue;
        }

        if (p.life <= 0) {
          this.bossProjectiles.splice(i, 1);
        }
      }
    }

    // Update & Render Magnetic Flux Tethers (between Twin enemies)
    this.updateTethers(dt);
  }

  updateTethers(dt) {
    if (!this.tetherGraphics) return;
    this.tetherGraphics.clear();

    const livingTwins = this.enemies.filter(e => e.isAlive && e.type === 'twin' && e.partner && e.partner.isAlive);
    const drawnPairs = new Set();

    for (const twin of livingTwins) {
      const partner = twin.partner;
      const pairKey = twin.x < partner.x ? `${twin.x},${partner.x}` : `${partner.x},${twin.x}`;
      if (drawnPairs.has(pairKey)) continue;
      drawnPairs.add(pairKey);

      // Draw vibrating magnetic field beam
      const segments = 4;
      const dx = (partner.x - twin.x) / segments;
      const dy = (partner.y - twin.y) / segments;

      this.tetherGraphics.moveTo(twin.x, twin.y);
      let curX = twin.x;
      let curY = twin.y;
      for (let s = 1; s < segments; s++) {
        const jitterX = (Math.random() - 0.5) * 8;
        const jitterY = (Math.random() - 0.5) * 8;
        curX = twin.x + dx * s + jitterX;
        curY = twin.y + dy * s + jitterY;
        this.tetherGraphics.lineTo(curX, curY);
      }
      this.tetherGraphics.lineTo(partner.x, partner.y);
      this.tetherGraphics.stroke({ width: 3.5, color: 0x06b6d4, alpha: 0.75 });
      this.tetherGraphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.9 });

      // Haste Boost: Any other enemy entering or crossing between the twins gets +60% speed!
      for (const other of this.enemies) {
        if (!other.isAlive || other === twin || other === partner) continue;
        const distToTether = this.pointLineDist(other.x, other.y, twin.x, twin.y, partner.x, partner.y);
        if (distToTether <= 45) {
          other.hasteTimer = 0.5; // Gain Haste speed boost
        }
      }
    }
  }

  pointLineDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  getSpawnPosition() {
    const edge = Math.floor(Math.random() * 4);
    const pad = 40;
    let x, y;

    switch (edge) {
      case 0: // Top
        x = Math.random() * this.engine.width;
        y = -pad;
        break;
      case 1: // Right
        x = this.engine.width + pad;
        y = Math.random() * this.engine.height;
        break;
      case 2: // Bottom
        x = Math.random() * this.engine.width;
        y = this.engine.height + pad;
        break;
      case 3: // Left
        x = -pad;
        y = Math.random() * this.engine.height;
        break;
    }
    return { x, y };
  }

  spawnRandomEnemy() {
    const maxEnemies = this.getMaxActiveEnemies();
    const w = this.currentWave;
    const r = Math.random();
    const hpScale = this.getHealthMultiplier();

    // DÀN ĐỀU CÁC LOẠI QUÁI & ABILITY TỪ WAVE 1 ĐẾN 200
    if (w <= 2) {
      // Wave 1-2: Swarm nhẹ nhàng
      this.spawnSingleEnemy(CONFIG.ENEMIES.SWARM, hpScale, true);
    } else if (w <= 4) {
      // Wave 3-4: Bắt đầu có Speeder
      const cfg = r < 0.28 ? CONFIG.ENEMIES.SPEEDER : CONFIG.ENEMIES.SWARM;
      this.spawnSingleEnemy(cfg, hpScale, true);
    } else if (w >= 6 && w <= 9) {
      // Wave 6-9: Goliath Tank & Quái Tách (Splitter) cỡ đại
      if (r < 0.22) this.spawnSingleEnemy(CONFIG.ENEMIES.SPEEDER, hpScale);
      else if (r < 0.44) this.spawnSingleEnemy(CONFIG.ENEMIES.SPLITTER_LARGE, hpScale);
      else if (r < 0.62) this.spawnSingleEnemy(CONFIG.ENEMIES.TANK, hpScale);
      else this.spawnSingleEnemy(CONFIG.ENEMIES.SWARM, hpScale);
    } else if (w >= 11 && w <= 14) {
      // Wave 11-14: Magnetic Twin (Quái Đôi Từ Trường)
      if (r < 0.22 && this.enemies.length < maxEnemies - 1) {
        this.spawnTwinPair(hpScale);
      } else if (r < 0.44) this.spawnSingleEnemy(CONFIG.ENEMIES.SPLITTER_LARGE, hpScale);
      else if (r < 0.62) this.spawnSingleEnemy(CONFIG.ENEMIES.SPEEDER, hpScale);
      else if (r < 0.78) this.spawnSingleEnemy(CONFIG.ENEMIES.TANK, hpScale);
      else this.spawnSingleEnemy(CONFIG.ENEMIES.SWARM, hpScale);
    } else if (w >= 16 && w <= 19) {
      // Wave 16-19: Vanguard, Stealth Stalkers & Mirror Reflectors
      if (r < 0.18 && this.enemies.length < maxEnemies - 1) {
        this.spawnTwinPair(hpScale);
      } else if (r < 0.34) this.spawnSingleEnemy(CONFIG.ENEMIES.VANGUARD, hpScale);
      else if (r < 0.48) this.spawnSingleEnemy(CONFIG.ENEMIES.STEALTH_STALKER, hpScale);
      else if (r < 0.62) this.spawnSingleEnemy(CONFIG.ENEMIES.MIRROR_REFLECTOR, hpScale);
      else if (r < 0.74) this.spawnSingleEnemy(CONFIG.ENEMIES.SPLITTER_LARGE, hpScale);
      else if (r < 0.86) this.spawnSingleEnemy(CONFIG.ENEMIES.TANK, hpScale);
      else this.spawnSingleEnemy(CONFIG.ENEMIES.SWARM, hpScale);
    } else if (w >= 21) {
      // Wave 21+: Roster hoàn chỉnh bao gồm toàn bộ quái tinh anh & đột biến
      if (r < 0.12 && this.enemies.length < maxEnemies - 1) {
        this.spawnTwinPair(hpScale);
      } else if (r < 0.22) this.spawnSingleEnemy(CONFIG.ENEMIES.VANGUARD, hpScale);
      else if (r < 0.32) this.spawnSingleEnemy(CONFIG.ENEMIES.HEALER, hpScale);
      else if (r < 0.42) this.spawnSingleEnemy(CONFIG.ENEMIES.STEALTH_STALKER, hpScale);
      else if (r < 0.52) this.spawnSingleEnemy(CONFIG.ENEMIES.GRAVITY_ANCHOR, hpScale);
      else if (r < 0.62) this.spawnSingleEnemy(CONFIG.ENEMIES.PARASITIC_SPORE, hpScale);
      else if (r < 0.72) this.spawnSingleEnemy(CONFIG.ENEMIES.MIRROR_REFLECTOR, hpScale);
      else if (r < 0.80) this.spawnSingleEnemy(CONFIG.ENEMIES.CHRONO_WEAVER, hpScale);
      else if (r < 0.88) this.spawnSingleEnemy(CONFIG.ENEMIES.BIO_DEVOURER, hpScale);
      else if (r < 0.94) this.spawnSingleEnemy(CONFIG.ENEMIES.SPLITTER_LARGE, hpScale);
      else this.spawnSingleEnemy(CONFIG.ENEMIES.SWARM, hpScale);
    } else {
      this.spawnSingleEnemy(CONFIG.ENEMIES.SWARM, hpScale);
    }
  }

  spawnSingleEnemy(baseCfg, hpScale, slow = false) {
    const { x, y } = this.getSpawnPosition();
    const xpScale = this.getXpMultiplier();
    const speedScale = this.getSpeedMultiplier();
    const cfg = {
      ...baseCfg,
      speed: Math.round((slow ? baseCfg.speed * 0.88 : baseCfg.speed) * speedScale),
      hp: Math.round(baseCfg.hp * hpScale),
      xp: Math.round(baseCfg.xp * xpScale)
    };
    const enemy = this.pool.get(cfg, x, y);
    this.enemies.push(enemy);
    this.engine.sceneManager.currentScene?.tracker?.recordSpawn(cfg.type);
  }

  // Quái Đôi (Magnetic Twin Block)
  spawnTwinPair(hpScale) {
    const { x, y } = this.getSpawnPosition();
    const xpScale = this.getXpMultiplier();
    const speedScale = this.getSpeedMultiplier();
    const cfgA = {
      ...CONFIG.ENEMIES.TWIN,
      speed: Math.round(CONFIG.ENEMIES.TWIN.speed * speedScale),
      hp: Math.round(CONFIG.ENEMIES.TWIN.hp * hpScale),
      xp: Math.round(CONFIG.ENEMIES.TWIN.xp * xpScale)
    };
    const cfgB = {
      ...CONFIG.ENEMIES.TWIN,
      speed: Math.round(CONFIG.ENEMIES.TWIN.speed * speedScale),
      hp: Math.round(CONFIG.ENEMIES.TWIN.hp * hpScale),
      xp: Math.round(CONFIG.ENEMIES.TWIN.xp * xpScale)
    };

    const angleToCenter = Math.atan2(this.engine.height / 2 - y, this.engine.width / 2 - x);
    const perpAngle = angleToCenter + Math.PI / 2;
    const offset = 130;
    const x2 = x + Math.cos(perpAngle) * offset;
    const y2 = y + Math.sin(perpAngle) * offset;

    const twinA = this.pool.get(cfgA, x, y);
    const twinB = this.pool.get(cfgB, x2, y2);
    twinA.partner = twinB;
    twinB.partner = twinA;

    this.enemies.push(twinA, twinB);
    this.engine.sceneManager.currentScene?.tracker?.recordSpawn('twin');
  }

  // Quái Tách (Splitter)
  spawnSplitter(type, x, y) {
    if (this.enemies.length >= this.getMaxActiveEnemies()) return;
    const hpScale = this.getHealthMultiplier();
    const xpScale = this.getXpMultiplier();
    const baseCfg = type === 'splitter_med' ? CONFIG.ENEMIES.SPLITTER_MED : CONFIG.ENEMIES.SPLITTER_SMALL;
    const cfg = {
      ...baseCfg,
      hp: Math.round(baseCfg.hp * hpScale),
      xp: Math.round(baseCfg.xp * xpScale)
    };
    const child = this.pool.get(cfg, x, y);
    this.enemies.push(child);
  }

  triggerSwarmRush() {
    const count = this.currentWave <= 5
      ? (3 + (this.currentWave - 3) * 2)
      : (12 + Math.min(24, this.currentWave * 2));

    const hpScale = this.getHealthMultiplier();
    const xpScale = this.getXpMultiplier();
    const speedScale = this.getSpeedMultiplier();

    for (let i = 0; i < count; i++) {
      const { x, y } = this.getSpawnPosition();
      const cfg = {
        ...CONFIG.ENEMIES.SWARM,
        speed: Math.round((this.currentWave <= 3 ? CONFIG.ENEMIES.SWARM.speed * 0.88 : CONFIG.ENEMIES.SWARM.speed) * speedScale),
        hp: Math.round(CONFIG.ENEMIES.SWARM.hp * hpScale),
        xp: Math.round(CONFIG.ENEMIES.SWARM.xp * xpScale)
      };
      const enemy = this.pool.get(cfg, x, y);
      this.enemies.push(enemy);
      this.engine.sceneManager.currentScene?.tracker?.recordSpawn('swarm');
    }
  }

  spawnMinion(x, y) {
    if (this.enemies.length >= this.getMaxActiveEnemies()) return;
    const hpScale = this.getHealthMultiplier();
    const xpScale = this.getXpMultiplier();
    const cfg = {
      ...CONFIG.ENEMIES.MINION,
      hp: Math.round(CONFIG.ENEMIES.MINION.hp * hpScale),
      xp: Math.round(CONFIG.ENEMIES.MINION.xp * xpScale)
    };
    const enemy = this.pool.get(cfg, x, y);
    this.enemies.push(enemy);
    this.engine.sceneManager.currentScene?.tracker?.recordSpawn('minion');
  }

  spawnMegaBoss() {
    const { x, y } = this.getSpawnPosition();
    // Đếm thứ tự đợt Boss: Boss 1 (Wave 5) = 1, Boss 2 (Wave 10) = 2, Boss 3 (Wave 15) = 3...
    const bossOrder = Math.max(1, Math.floor(this.currentWave / CONFIG.WAVE.BOSS_INTERVAL));

    const bossPool = [
      CONFIG.ENEMIES.BOSS_TITAN || CONFIG.ENEMIES.MEGA_BOSS,
      CONFIG.ENEMIES.BOSS_PHANTOM,
      CONFIG.ENEMIES.BOSS_CRYO,
      CONFIG.ENEMIES.BOSS_SINGULARITY,
      CONFIG.ENEMIES.BOSS_SOLAR,
      CONFIG.ENEMIES.BOSS_AEGIS,
      CONFIG.ENEMIES.BOSS_CHRONO,
      CONFIG.ENEMIES.BOSS_BROODMOTHER,
      CONFIG.ENEMIES.BOSS_VAMPIRE,
      CONFIG.ENEMIES.BOSS_JUGGERNAUT,
      CONFIG.ENEMIES.BOSS_MIRAGE
    ].filter(Boolean);

    const chosenBoss = bossPool[(bossOrder - 1) % bossPool.length] || CONFIG.ENEMIES.MEGA_BOSS;
    const bossConfig = { ...chosenBoss };

    // Máu Boss: Wave 5 là 1400-1800 HP, các đợt sau tăng lũy tiến để tương xứng với DPS người chơi
    const bossHpScale = Math.min(250, Math.pow(1.58, bossOrder - 1));
    bossConfig.hp = Math.round(chosenBoss.hp * bossHpScale);

    // Kinh nghiệm Boss: Tăng vọt theo wave để bù đắp EXP người chơi ở late game (rơi Ngọc Xanh Lá!)
    bossConfig.xp = Math.round(chosenBoss.xp * (1 + (bossOrder - 1) * 1.8));

    const boss = this.pool.get(bossConfig, x, y);
    this.enemies.push(boss);
    this.engine.sceneManager.currentScene?.tracker?.recordSpawn(bossConfig.type);

    // Blinding alert shockwave & additive lens flare flash
    this.engine.sceneManager.currentScene?.particles?.emitShockwave(
      this.engine.width / 2,
      this.engine.height / 2,
      350,
      bossConfig.color || 0xff0033
    );
    glowVFX.spawnExplosionFlare(
      this.engine.gameWorldLayer,
      x,
      y,
      180,
      bossConfig.color || 0xff0033
    );
  }

  destroy() {
    if (this.tetherGraphics) this.tetherGraphics.destroy();
    if (this.projGraphics) this.projGraphics.destroy();
    this.bossProjectiles = [];
    this.enemies.forEach(e => {
      e.isAlive = false;
      this.pool.release(e);
    });
    this.enemies = [];
    this.pool.clear();
  }
}
