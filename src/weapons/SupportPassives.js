import { Graphics } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';

export class ChainLightningPassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0; // 0 = not unlocked
    this.timer = 0;
    this.cooldown = 2.4;
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
    this.displayTimer = 0;
    this.linesToDraw = [];
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
    this.cooldown = Math.max(0.9, 2.5 - this.tier * 0.32);
  }

  update(dt, enemies) {
    if (this.tier <= 0) return;

    if (this.displayTimer > 0) {
      this.displayTimer -= dt;
      this.renderLightning();
    } else {
      this.graphics.clear();
      this.linesToDraw = [];
    }

    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.cooldown;
      this.triggerShock(enemies);
    }
  }

  triggerShock(enemies) {
    if (!enemies || enemies.length === 0) return;
    const livingEnemies = enemies.filter(e => e.isAlive);
    if (livingEnemies.length === 0) return;

    const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
    const strikesCount = this.tier >= 5 ? 3 : 1;
    const maxChain = this.tier >= 4 ? 6 : this.tier >= 2 ? 4 : 2;
    const baseDamage = 45 + this.tier * 20;

    audio.playShock();
    this.displayTimer = 0.16;
    this.linesToDraw = [];

    for (let s = 0; s < strikesCount; s++) {
      let currentTarget = target;
      let chained = [currentTarget];

      this.linesToDraw.push({ x1: currentTarget.x, y1: -60, x2: currentTarget.x, y2: currentTarget.y });
      currentTarget.takeDamage(baseDamage, 'crit');

      for (let c = 1; c < maxChain; c++) {
        let nextTarget = null;
        let minDist = 240;

        for (const candidate of livingEnemies) {
          if (chained.includes(candidate) || !candidate.isAlive) continue;
          const d = Math.hypot(candidate.x - currentTarget.x, candidate.y - currentTarget.y);
          if (d < minDist) {
            minDist = d;
            nextTarget = candidate;
          }
        }

        if (nextTarget) {
          this.linesToDraw.push({
            x1: currentTarget.x,
            y1: currentTarget.y,
            x2: nextTarget.x,
            y2: nextTarget.y
          });
          nextTarget.takeDamage(baseDamage * 0.85, 'crit');
          chained.push(nextTarget);
          currentTarget = nextTarget;
        } else {
          break;
        }
      }
    }
  }

  renderLightning() {
    this.graphics.clear();
    const alpha = Math.min(1, this.displayTimer / 0.1);

    for (const line of this.linesToDraw) {
      const segments = 4;
      const dx = (line.x2 - line.x1) / segments;
      const dy = (line.y2 - line.y1) / segments;

      this.graphics.moveTo(line.x1, line.y1);
      let curX = line.x1;
      let curY = line.y1;

      for (let i = 1; i < segments; i++) {
        const jitterX = (Math.random() - 0.5) * 22;
        const jitterY = (Math.random() - 0.5) * 22;
        curX = line.x1 + dx * i + jitterX;
        curY = line.y1 + dy * i + jitterY;
        this.graphics.lineTo(curX, curY);
      }
      this.graphics.lineTo(line.x2, line.y2);

      this.graphics.stroke({ width: 5, color: 0xffea00, alpha: 0.85 * alpha });
      this.graphics.stroke({ width: 2, color: 0xffffff, alpha: alpha });
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}

// COSMIC BLACK HOLE PASSIVE (Replaced Poison)
export class BlackHolePassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.timer = 0;
    this.cooldown = 4.5;
    this.holes = [];
    this.graphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.graphics);
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
    this.cooldown = Math.max(2.2, 4.5 - this.tier * 0.45);
  }

  update(dt, enemies) {
    if (this.tier <= 0 && this.holes.length === 0) return;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.cooldown;
      this.spawnHoles(enemies);
    }

    // Update active black holes
    for (let i = this.holes.length - 1; i >= 0; i--) {
      const h = this.holes[i];
      h.duration -= dt;
      h.rot += dt * 6; // rapid spinning accretion disk

      if (h.duration <= 0) {
        this.holes.splice(i, 1);
        continue;
      }

      // Gravitational Pull & Crushing Damage
      if (enemies) {
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          const dx = h.x - enemy.x;
          const dy = h.y - enemy.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= h.radius) {
            const isMegaBoss = enemy.type === 'mega_boss';

            if (isMegaBoss) {
              // Mega Boss is NOT sucked into black hole: only slowed down by 35% and slightly deflected
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              enemy.x += nx * 12 * dt;
              enemy.y += ny * 12 * dt;
              enemy.speedModifier = 0.65;
            } else {
              // Softened suction force for regular enemies (smooth, controllable inward drift)
              const pullPower = (1 - dist / h.radius) * (h.pullForce * 0.42) * dt;
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              enemy.x += nx * pullPower;
              enemy.y += ny * pullPower;
            }

            enemy.graphics.x = enemy.x;
            enemy.graphics.y = enemy.y;

            // Singularity damage tick
            enemy.takeDamage(h.dps * dt, 'black_hole');
          }
        }
      }
    }

    this.render();
  }

  spawnHoles(enemies) {
    const living = enemies ? enemies.filter(e => e.isAlive) : [];
    const count = this.tier >= 4 ? 2 : 1;

    for (let c = 0; c < count; c++) {
      let px = Math.random() * (this.engine.width - 240) + 120;
      let py = Math.random() * (this.engine.height - 240) + 120;

      if (living.length > 0) {
        const target = living[Math.floor(Math.random() * living.length)];
        px = target.x;
        py = target.y;
      }

      const radius = this.tier === 5 ? 320 : (160 + this.tier * 25);
      const dps = 35 + this.tier * 18;
      const duration = 4.5 + this.tier * 0.8;
      const pullForce = 350 + this.tier * 70;

      this.holes.push({
        x: px,
        y: py,
        radius,
        coreRadius: 18 + this.tier * 3,
        dps,
        duration,
        maxDuration: duration,
        pullForce,
        rot: 0
      });

      audio.playShock(); // Singularity warp pulse sound
    }
  }

  spawnCustomHole(x, y, radius = 220, duration = 3.5, dps = 160, pullForce = 450) {
    this.holes.push({
      x,
      y,
      radius,
      coreRadius: 24,
      dps,
      duration,
      maxDuration: duration,
      pullForce,
      rot: 0
    });
    audio.playShock?.();
  }

  render() {
    this.graphics.clear();
    for (const h of this.holes) {
      const alpha = Math.min(1, (h.duration / h.maxDuration) * 1.5);

      // Outer Gravitational Lensing Aura
      this.graphics.circle(h.x, h.y, h.radius);
      this.graphics.stroke({ width: 1.5, color: 0x9d4edd, alpha: 0.25 * alpha });

      // Accretion Disk (Neon Spiral Rings)
      const rings = 4;
      for (let r = 1; r <= rings; r++) {
        const ringRad = h.coreRadius + (r * (h.radius * 0.35) / rings);
        this.graphics.circle(h.x, h.y, ringRad);
        this.graphics.stroke({
          width: 3 - r * 0.5,
          color: r % 2 === 0 ? 0xd946ef : 0x00f0ff,
          alpha: 0.45 * alpha
        });
      }

      // Event Horizon Accretion Glow
      this.graphics.circle(h.x, h.y, h.coreRadius + 4);
      this.graphics.fill({ color: 0xd946ef, alpha: 0.7 * alpha });

      // Pitch Black Singularity Center
      this.graphics.circle(h.x, h.y, h.coreRadius);
      this.graphics.fill({ color: 0x030308 });
      this.graphics.stroke({ width: 2, color: 0xffffff, alpha: 0.9 * alpha });
    }
  }

  destroy() {
    this.holes = [];
    this.graphics.destroy();
  }
}

// 1. CHRONO MATRIX PASSIVE (Temporal Bullet-Time Distortion)
export class ChronoMatrixPassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.timer = 0;
    this.cooldown = 7.0;
    this.dilationDuration = 0;
    this.maxDilationDuration = 2.8;
    this.radius = 280;
    this.pulseAnim = 0;
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
    this.cooldown = Math.max(4.2, 7.2 - this.tier * 0.6);
    this.maxDilationDuration = 2.4 + this.tier * 0.5;
    this.radius = 240 + this.tier * 35;
  }

  update(dt, enemies, turret) {
    if (this.tier <= 0) return;

    this.pulseAnim += dt * 3;

    if (this.dilationDuration > 0) {
      this.dilationDuration -= dt;
      // Apply 70% slow to all active enemies
      if (enemies) {
        for (const e of enemies) {
          if (e.isAlive) {
            e.applySlow(0.3, 0.25);
          }
        }
      }
      this.renderDilation(turret);
    } else {
      this.graphics.clear();
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = this.cooldown;
        this.dilationDuration = this.maxDilationDuration;
        audio.playShock();
      }
    }
  }

  renderDilation(turret) {
    this.graphics.clear();
    const cx = turret ? turret.x : this.engine.width / 2;
    const cy = turret ? turret.y : this.engine.height / 2;
    const progress = 1 - (this.dilationDuration / this.maxDilationDuration);
    const alpha = Math.sin((this.dilationDuration / this.maxDilationDuration) * Math.PI) * 0.6;

    // Chrono Field Rings
    this.graphics.circle(cx, cy, this.radius);
    this.graphics.stroke({ width: 3, color: 0x00f0ff, alpha: alpha * 0.6 });
    this.graphics.circle(cx, cy, this.radius * 0.65);
    this.graphics.stroke({ width: 1.5, color: 0x38bdf8, alpha: alpha * 0.4 });

    // Rotating Clock Dial Marks
    const ticks = 12;
    const rot = this.pulseAnim;
    for (let i = 0; i < ticks; i++) {
      const a = rot + (i * Math.PI * 2) / ticks;
      const x1 = cx + Math.cos(a) * (this.radius - 12);
      const y1 = cy + Math.sin(a) * (this.radius - 12);
      const x2 = cx + Math.cos(a) * this.radius;
      const y2 = cy + Math.sin(a) * this.radius;
      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
      this.graphics.stroke({ width: 2, color: 0xffffff, alpha: alpha * 0.8 });
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}

// 2. NANITE SWARM PASSIVE (Armor-Stripping & Leeching Nanobots)
export class NaniteSwarmPassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.nanites = [];
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
    this.attackTimer = 0;
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
    const count = 3 + this.tier * 2;
    this.nanites = [];
    for (let i = 0; i < count; i++) {
      this.nanites.push({
        angle: (i * Math.PI * 2) / count,
        dist: 55 + (i % 2) * 20,
        speed: 2.2 + (i % 3) * 0.4,
        target: null,
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        state: 'orbit' // 'orbit' or 'strike'
      });
    }
  }

  update(dt, enemies, turret, shield) {
    if (this.tier <= 0 || !turret) return;

    this.attackTimer -= dt;
    const living = enemies ? enemies.filter(e => e.isAlive) : [];

    for (const bot of this.nanites) {
      bot.angle += bot.speed * dt;
      const homeX = turret.x + Math.cos(bot.angle) * bot.dist;
      const homeY = turret.y + Math.sin(bot.angle) * bot.dist;

      if (bot.state === 'orbit') {
        bot.currentX += (homeX - bot.currentX) * 10 * dt;
        bot.currentY += (homeY - bot.currentY) * 10 * dt;

        // Chance to strike nearby enemy
        if (this.attackTimer <= 0 && living.length > 0 && Math.random() < 0.25) {
          const target = living[Math.floor(Math.random() * living.length)];
          const d = Math.hypot(target.x - turret.x, target.y - turret.y);
          if (d < 300) {
            bot.state = 'strike';
            bot.target = target;
            this.attackTimer = 0.35;
          }
        }
      } else if (bot.state === 'strike') {
        if (!bot.target || !bot.target.isAlive) {
          bot.state = 'orbit';
        } else {
          const dx = bot.target.x - bot.currentX;
          const dy = bot.target.y - bot.currentY;
          const dist = Math.hypot(dx, dy);

          if (dist < 20) {
            // Apply armor strip and nanite poison damage
            const dmg = 25 + this.tier * 12;
            bot.target.takeDamage(dmg, 'acid');
            bot.target.armorDebuff = Math.min(0.6, (bot.target.armorDebuff || 0) + 0.08);

            // Leech shield / health
            if (shield && shield.isActive) {
              shield.currentHp = Math.min(shield.maxHp, shield.currentHp + 1.5 * this.tier);
            }
            bot.state = 'orbit';
          } else {
            bot.currentX += (dx / dist) * 450 * dt;
            bot.currentY += (dy / dist) * 450 * dt;
          }
        }
      }
    }

    this.render(turret);
  }

  render(turret) {
    this.graphics.clear();
    for (const bot of this.nanites) {
      // Glow Aura
      this.graphics.circle(bot.currentX, bot.currentY, 5);
      this.graphics.fill({ color: 0x10b981, alpha: 0.35 });

      // Nanite Crystal Core
      this.graphics.circle(bot.currentX, bot.currentY, 2.5);
      this.graphics.fill({ color: 0x34d399 });
      this.graphics.stroke({ width: 1, color: 0xffffff });

      // Subtle tether to turret in orbit
      if (bot.state === 'orbit' && turret) {
        this.graphics.moveTo(turret.x, turret.y);
        this.graphics.lineTo(bot.currentX, bot.currentY);
        this.graphics.stroke({ width: 0.5, color: 0x10b981, alpha: 0.15 });
      }
    }
  }

  destroy() {
    this.nanites = [];
    this.graphics.destroy();
  }
}

// 3. OVERCHARGE PASSIVE (Critical Strike Core)
export class OverchargePassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.critChance = 0;
    this.critMultiplier = 2.0;
    this.sparks = [];
    this.sparkTimer = 0;
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
    this.critChance = 0.10 + this.tier * 0.06; // 16% up to 40%
    this.critMultiplier = 2.0 + this.tier * 0.25; // 2.25x up to 3.25x
  }

  checkCrit(baseDamage) {
    if (this.tier <= 0) return { isCrit: false, damage: baseDamage };
    if (Math.random() < this.critChance) {
      return {
        isCrit: true,
        damage: baseDamage * this.critMultiplier,
        splash: 45 + this.tier * 12
      };
    }
    return { isCrit: false, damage: baseDamage };
  }

  update(dt, turret) {
    if (this.tier <= 0 || !turret) return;

    this.sparkTimer -= dt;
    if (this.sparkTimer <= 0) {
      this.sparkTimer = 0.08;
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 14;
      this.sparks.push({
        x: turret.x + Math.cos(angle) * dist,
        y: turret.y + Math.sin(angle) * dist,
        life: 0.15,
        maxLife: 0.15
      });
    }

    this.graphics.clear();
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      const alpha = s.life / s.maxLife;
      this.graphics.circle(s.x, s.y, 2.5);
      this.graphics.fill({ color: 0xffea00, alpha });
      this.graphics.circle(s.x, s.y, 5);
      this.graphics.stroke({ width: 1, color: 0xf59e0b, alpha: alpha * 0.6 });
    }
  }

  destroy() {
    this.sparks = [];
    this.graphics.destroy();
  }
}

// 4. KINETIC REPULSOR PASSIVE (Zero-Point Repelling Concussion Wave)
export class RepulsorPassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.timer = 0;
    this.cooldown = 4.2;
    this.radius = 180;
    this.rings = [];
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
    this.cooldown = Math.max(2.0, 4.2 - this.tier * 0.45);
    this.radius = 180 + this.tier * 25;
  }

  update(dt, enemies, turret) {
    if (this.tier <= 0 || !turret) return;

    this.timer -= dt;

    // Trigger if cooldown is ready, OR emergency blast if enemy is too close!
    let trigger = this.timer <= 0;
    if (!trigger && enemies) {
      for (const e of enemies) {
        if (e.isAlive && Math.hypot(e.x - turret.x, e.y - turret.y) < 70) {
          trigger = true;
          break;
        }
      }
    }

    if (trigger) {
      this.timer = this.cooldown;
      this.blast(enemies, turret);
    }

    // Render shockwave blast rings
    this.graphics.clear();
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.currentRadius += (r.maxRadius - r.currentRadius) * 12 * dt;
      r.life -= dt;
      if (r.life <= 0) {
        this.rings.splice(i, 1);
        continue;
      }
      const alpha = r.life / r.maxLife;
      this.graphics.circle(r.x, r.y, r.currentRadius);
      this.graphics.stroke({ width: 4, color: 0x38bdf8, alpha: alpha * 0.8 });
      this.graphics.circle(r.x, r.y, r.currentRadius * 0.85);
      this.graphics.stroke({ width: 1.5, color: 0xffffff, alpha: alpha * 0.5 });
    }
  }

  blast(enemies, turret) {
    audio.playExplosion();
    this.rings.push({
      x: turret.x,
      y: turret.y,
      currentRadius: 20,
      maxRadius: this.radius,
      life: 0.35,
      maxLife: 0.35
    });

    if (!enemies) return;
    const force = 320 + this.tier * 60;
    const dmg = 40 + this.tier * 22;

    for (const e of enemies) {
      if (!e.isAlive) continue;
      const dx = e.x - turret.x;
      const dy = e.y - turret.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= this.radius) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        e.x += nx * force * 0.12;
        e.y += ny * force * 0.12;
        e.graphics.x = e.x;
        e.graphics.y = e.y;
        e.takeDamage(dmg, 'kinetic');
        e.applySlow(0.2, 0.8); // 80% concussive slow
      }
    }
  }

  destroy() {
    this.rings = [];
    this.graphics.destroy();
  }
}

// 5. VAMPIRIC SIPHON PASSIVE (Soul Harvesting & Damage Stacking)
export class VampiricSiphonPassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.motes = [];
    this.stacks = 0;
    this.stackTimer = 0;
    this.damageMultiplier = 1.0;
    this.absorbPulse = 0;
    this.orbitAngle = 0;
    this.animTime = 0;
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
  }

  get maxStacks() {
    return 10 + this.tier * 5;
  }

  get fillRatio() {
    return Math.min(1, Math.max(0, this.stacks / this.maxStacks));
  }

  get isFull() {
    return this.tier > 0 && this.stacks >= this.maxStacks;
  }

  get damageBonusPercent() {
    return Math.round(this.stacks * 2.5 * 10) / 10;
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
  }

  onEnemyKilled(x, y) {
    if (this.tier <= 0) return;
    const count = 1 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        life: 4.5,
        maxLife: 4.5,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt, turret, shield) {
    if (this.tier <= 0 || !turret) return;

    this.animTime += dt;
    this.orbitAngle += dt * 3.2;
    this.absorbPulse = Math.max(0, this.absorbPulse - dt * 3.5);

    // Decay damage stacks
    if (this.stacks > 0) {
      this.stackTimer -= dt;
      if (this.stackTimer <= 0) {
        this.stacks = Math.max(0, this.stacks - 1);
        this.stackTimer = 0.55;
      }
    }
    const max = this.maxStacks;
    this.damageMultiplier = 1.0 + (this.stacks * 0.025);

    const baseRefreshTimer = this.tier >= 3 ? 7.0 : 5.0;
    const homingSpeed = this.tier >= 3 ? 620 : 380;

    // Mote homing physics
    for (let i = this.motes.length - 1; i >= 0; i--) {
      const m = this.motes[i];
      m.life -= dt;
      if (m.life <= 0) {
        this.motes.splice(i, 1);
        continue;
      }

      const dx = turret.x - m.x;
      const dy = turret.y - m.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 28) {
        // Absorbed by turret!
        this.stacks = Math.min(max, this.stacks + 1);
        this.stackTimer = baseRefreshTimer; // Refresh stack timer
        this.absorbPulse = 1.0;

        audio.playPowerUp?.(1.4);

        const scene = this.engine.sceneManager.currentScene;
        scene?.particles?.emit({
          x: turret.x,
          y: turret.y,
          count: 6,
          color: 0xef4444,
          speed: 110,
          life: 0.22
        });

        if (shield && shield.isActive) {
          shield.currentHp = Math.min(shield.maxHp, shield.currentHp + 2.5 * this.tier);
        }
        this.motes.splice(i, 1);
        continue;
      }

      // Homing acceleration with ethereal ghostly wobble
      const wobble = Math.sin(this.animTime * 8 + m.wobblePhase) * 60;
      const perpX = -(dy / dist) * wobble;
      const perpY = (dx / dist) * wobble;

      m.vx += (((dx / dist) * homingSpeed + perpX) - m.vx) * 9 * dt;
      m.vy += (((dy / dist) * homingSpeed + perpY) - m.vy) * 9 * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
    }

    this.render(turret);
  }

  render(turret) {
    this.graphics.clear();
    const max = this.maxStacks;
    const isFull = this.isFull;

    // 1. Render flying ethereal crimson soul motes
    for (const m of this.motes) {
      const vLen = Math.hypot(m.vx, m.vy);
      if (vLen > 20) {
        // Tapered ghost tail behind soul mote
        const tailX = m.x - (m.vx / vLen) * 14;
        const tailY = m.y - (m.vy / vLen) * 14;
        this.graphics.moveTo(tailX, tailY);
        this.graphics.lineTo(m.x, m.y);
        this.graphics.stroke({ width: 3, color: 0xff0055, alpha: 0.55 });
      }

      // Outer ethereal halo
      this.graphics.circle(m.x, m.y, 8);
      this.graphics.fill({ color: 0xff0044, alpha: 0.25 });

      // Crimson spirit orb
      this.graphics.circle(m.x, m.y, 4.5);
      this.graphics.fill({ color: 0xef4444, alpha: 0.95 });
      this.graphics.stroke({ width: 1.2, color: 0xfca5a5 });

      // Core spirit pearl
      this.graphics.circle(m.x, m.y, 2);
      this.graphics.fill({ color: 0xffffff });
    }

    // 2. Render Blood Aura & Orbiting Wisps around Turret when stacks > 0
    if (this.stacks > 0 && turret) {
      const auraRatio = this.stacks / max;
      const auraR = turret.radius + 10 + this.absorbPulse * 8;
      const auraAlpha = 0.25 + auraRatio * 0.45;
      const auraColor = isFull ? 0xff0055 : 0xdc2626;

      // Base aura ring
      this.graphics.circle(turret.x, turret.y, auraR);
      this.graphics.stroke({ width: isFull ? 3.5 : 2, color: auraColor, alpha: auraAlpha });

      // If full stacks: radiant corona ring & golden highlights
      if (isFull) {
        const pulse = 0.5 + Math.sin(this.animTime * 8) * 0.5;
        this.graphics.circle(turret.x, turret.y, auraR + 4);
        this.graphics.stroke({ width: 1.5, color: 0xffd700, alpha: 0.8 * pulse });

        // 4 Golden runic cardinal flares
        for (let r = 0; r < 4; r++) {
          const rAngle = this.orbitAngle * 0.5 + (r * Math.PI) / 2;
          const fx1 = turret.x + Math.cos(rAngle) * (auraR - 2);
          const fy1 = turret.y + Math.sin(rAngle) * (auraR - 2);
          const fx2 = turret.x + Math.cos(rAngle) * (auraR + 10);
          const fy2 = turret.y + Math.sin(rAngle) * (auraR + 10);
          this.graphics.moveTo(fx1, fy1);
          this.graphics.lineTo(fx2, fy2);
          this.graphics.stroke({ width: 2.5, color: 0xffd700, alpha: 0.9 * pulse });
        }
      }

      // Orbiting spirit motes around turret (1 up to 6 orbiting motes based on stack level)
      const wispCount = Math.min(6, Math.max(1, Math.floor(this.stacks / (max / 6))));
      for (let w = 0; w < wispCount; w++) {
        const wAngle = this.orbitAngle + (w * Math.PI * 2) / wispCount;
        const wx = turret.x + Math.cos(wAngle) * auraR;
        const wy = turret.y + Math.sin(wAngle) * auraR;

        this.graphics.circle(wx, wy, isFull ? 4 : 3);
        this.graphics.fill({ color: isFull ? 0xff0055 : 0xef4444 });
        this.graphics.circle(wx, wy, 1.5);
        this.graphics.fill({ color: 0xffffff });
      }
    }
  }

  destroy() {
    this.motes = [];
    this.graphics.destroy();
  }
}

// 6. QUANTUM HARVESTER PASSIVE (EXP Amplification & Cosmic Gem Magnet)
export class QuantumHarvesterPassive {
  constructor(engine) {
    this.engine = engine;
    this.tier = 0;
    this.pulseTimer = 0;
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
  }

  get expBonus() {
    switch (this.tier) {
      case 1: return 0.30;
      case 2: return 0.55;
      case 3: return 0.80;
      case 4: return 1.10;
      case 5: return 1.60;
      default: return 0;
    }
  }

  upgrade() {
    this.tier = Math.min(5, this.tier + 1);
  }

  update(dt, turret, spawner, gems) {
    if (this.tier <= 0 || !turret) return;
    this.pulseTimer += dt * 3;

    // Supercharged gem magnet radius & homing speed
    if (gems) {
      gems.magnetRadiusMult = 1.0 + this.tier * 0.4;
      gems.gemSpeedMult = this.tier >= 3 ? 2.2 : 1.4;
    }

    this.render(turret);
  }

  render(turret) {
    this.graphics.clear();
    const isTier5 = this.tier === 5;
    const rad = turret.radius + 15 + Math.sin(this.pulseTimer) * 3;
    const alpha = 0.25 + (this.tier / 5) * 0.35;

    // Emerald quantum orbital ring
    this.graphics.circle(turret.x, turret.y, rad);
    this.graphics.stroke({ width: isTier5 ? 3 : 1.8, color: 0x10b981, alpha });

    if (isTier5) {
      // 4 Emerald quantum prisms rotating
      for (let i = 0; i < 4; i++) {
        const a = this.pulseTimer * 0.9 + (i * Math.PI) / 2;
        const qx = turret.x + Math.cos(a) * rad;
        const qy = turret.y + Math.sin(a) * rad;
        this.graphics.circle(qx, qy, 4);
        this.graphics.fill({ color: 0x34d399 });
        this.graphics.circle(qx, qy, 1.8);
        this.graphics.fill({ color: 0xffffff });
      }
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}

