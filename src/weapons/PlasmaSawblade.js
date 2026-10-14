import { Graphics } from 'pixi.js';
import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class PlasmaSawblade extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.SAWBLADE);
    this.baseCooldown = 0.2; // Ticks damage
    this.damage = 38;
    this.bladeCount = 1;
    this.orbitRadius = 135;
    this.baseRadius = 135;
    this.orbitSpeed = 2.6; // Radians per sec
    this.orbitAngle = 0;
    this.pulseTimer = 0;
    this.bladeSize = 16;
    this.shredderWaveTimer = 0;

    this.graphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.graphics);
    this.hitCooldowns = new WeakMap();
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.bladeCount = 2;
        this.damage = 60;
        this.orbitSpeed = 3.2;
        this.bladeSize = 18;
        break;
      case 3:
        this.bladeCount = 3;
        this.damage = 95;
        this.orbitSpeed = 3.8;
        this.bladeSize = 20;
        break;
      case 4:
        this.bladeCount = 4;
        this.damage = 145;
        this.orbitSpeed = 4.4;
        this.bladeSize = 22;
        break;
      case 5:
        // TIER 5 EVOLUTION: TITAN ECLIPSE GLADIUS (Dual Counter-Rotating Apocalypse Rings)
        this.bladeCount = 6;
        this.damage = 320;
        this.orbitSpeed = 5.2;
        this.bladeSize = 28;
        this.baseRadius = 160;
        break;
    }
  }

  update(dt, enemies) {
    this.pulseTimer += dt * 3.5;
    const speedMult = this.speedMultiplier || 1.0;
    this.orbitAngle += this.orbitSpeed * speedMult * dt;

    // Pulsing orbit distance
    if (this.tier >= 3 && this.tier < 5) {
      this.orbitRadius = this.baseRadius + Math.sin(this.pulseTimer * 1.5) * 35;
    } else {
      this.orbitRadius = this.baseRadius;
    }

    const hasLightning = this.turret.hasSynergy('sawblade+passive_lightning');
    const hasFlame = this.turret.hasSynergy('sawblade+flame');
    const isTier5 = this.tier === 5;
    const effDmg = this.damage * this.damageMultiplier;

    // Calculate blade positions
    const bladePositions = [];
    if (isTier5) {
      // DUAL COUNTER-ROTATING RINGS:
      // Inner ring: 3 blades orbiting clockwise at 95px radius
      for (let i = 0; i < 3; i++) {
        const angle = (this.orbitAngle * 1.25) + (i * Math.PI * 2) / 3;
        const bx = this.turret.x + Math.cos(angle) * 95;
        const by = this.turret.y + Math.sin(angle) * 95;
        bladePositions.push({ x: bx, y: by, angle, size: 22, isInner: true });
      }
      // Outer ring: 3 blades orbiting counter-clockwise at 195px radius
      for (let i = 0; i < 3; i++) {
        const angle = (-this.orbitAngle * 0.95) + (i * Math.PI * 2) / 3;
        const bx = this.turret.x + Math.cos(angle) * 195;
        const by = this.turret.y + Math.sin(angle) * 195;
        bladePositions.push({ x: bx, y: by, angle, size: 30, isInner: false });
      }

      // Periodic Radial Apocalypse Shredder Wave
      this.shredderWaveTimer += dt;
      if (this.shredderWaveTimer >= 1.8) {
        this.shredderWaveTimer = 0;
        audio.playExplosion?.();
        const scene = this.engine.sceneManager.currentScene;
        scene?.particles?.emitShockwave(this.turret.x, this.turret.y, 260, 0xff0055);
        if (enemies) {
          for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            const dist = Math.hypot(enemy.x - this.turret.x, enemy.y - this.turret.y);
            if (dist <= 260) {
              enemy.takeDamage(effDmg * 1.5, 'sawblade');
              const nx = (enemy.x - this.turret.x) / (dist || 1);
              const ny = (enemy.y - this.turret.y) / (dist || 1);
              enemy.x += nx * 40;
              enemy.y += ny * 40;
              enemy.graphics.x = enemy.x;
              enemy.graphics.y = enemy.y;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this.bladeCount; i++) {
        const angle = this.orbitAngle + (i * Math.PI * 2) / this.bladeCount;
        const bx = this.turret.x + Math.cos(angle) * this.orbitRadius;
        const by = this.turret.y + Math.sin(angle) * this.orbitRadius;
        bladePositions.push({ x: bx, y: by, angle, size: this.bladeSize });
      }
    }

    // Collision detection & slicing damage
    if (enemies) {
      const now = performance.now();
      for (const blade of bladePositions) {
        const bSize = blade.size || this.bladeSize;
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          const dist = Math.hypot(enemy.x - blade.x, enemy.y - blade.y);
          if (dist <= bSize + enemy.size) {
            // Check throttle per enemy (120ms tick cooldown)
            const lastHit = this.hitCooldowns.get(enemy) || 0;
            if (now - lastHit >= 110) {
              this.hitCooldowns.set(enemy, now);
              enemy.takeDamage(effDmg, 'sawblade');
              this.engine.sceneManager.currentScene?.triggerSynergyProc?.('sawblade', enemy, blade.x, blade.y);

              // Visual spark burst
              this.engine.sceneManager.currentScene?.particles?.emit({
                x: (blade.x + enemy.x) / 2,
                y: (blade.y + enemy.y) / 2,
                count: isTier5 ? 6 : 3,
                color: isTier5 ? 0xff0055 : (hasFlame ? 0xff6600 : 0x00f0ff),
                speed: 130,
                life: 0.16
              });

              // Synergy: Sawblade + Flame (Molten Buzzsaw Wheel)
              if (hasFlame) {
                enemy.applyBurn(effDmg * 0.8, 2.5);
              }

              // Synergy: Sawblade + Lightning (Electric Mutilator)
              if (hasLightning && Math.random() < 0.35) {
                for (const other of enemies) {
                  if (other === enemy || !other.isAlive) continue;
                  if (Math.hypot(other.x - enemy.x, other.y - enemy.y) <= 150) {
                    other.takeDamage(75, 'lightning');
                    this.engine.sceneManager.currentScene?.particles?.emit({
                      x: other.x,
                      y: other.y,
                      count: 4,
                      color: 0xffea00,
                      speed: 100,
                      life: 0.18
                    });
                    break;
                  }
                }
              }

              // Synergy: Sawblade + Missile (Whirlwind Micro-Rockets)
              if (this.turret.hasSynergy('missile+sawblade') && Math.random() < 0.40) {
                const scene = this.engine.sceneManager.currentScene;
                if (scene?.bulletPool) {
                  audio.playMissileLaunch?.();
                  for (let m = 0; m < 2; m++) {
                    const launchAngle = (blade.angle || 0) + (m === 0 ? 0.6 : -0.6);
                    scene.bulletPool.get({
                      type: 'missile',
                      x: blade.x,
                      y: blade.y,
                      angle: launchAngle,
                      speed: 480,
                      damage: Math.round(effDmg * 0.65),
                      aoeRadius: 50,
                      life: 2.0,
                      target: enemy,
                      color: 0x00f0ff,
                      isSawbladeChild: true
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    this.render(bladePositions, isTier5, hasFlame, hasLightning);
  }

  render(blades, isTier5, hasFlame, hasLightning) {
    this.graphics.clear();

    const mainColor = isTier5 ? 0xff0055 : (hasFlame ? 0xff4500 : 0x00f0ff);
    const auraColor = isTier5 ? 0xff0044 : (hasLightning ? 0xffea00 : 0x38bdf8);

    // Orbit trail circles
    if (isTier5) {
      this.graphics.circle(this.turret.x, this.turret.y, 95);
      this.graphics.stroke({ width: 2, color: 0xff0055, alpha: 0.35 });
      this.graphics.circle(this.turret.x, this.turret.y, 195);
      this.graphics.stroke({ width: 2.5, color: 0xff0044, alpha: 0.35 });
    } else {
      this.graphics.circle(this.turret.x, this.turret.y, this.orbitRadius);
      this.graphics.stroke({ width: 1.5, color: auraColor, alpha: 0.18 });
    }

    for (const b of blades) {
      const r = b.size || this.bladeSize;
      const teeth = isTier5 ? 12 : 8;
      const rot = this.pulseTimer * 12 + b.angle;

      // Outer glow rim
      this.graphics.circle(b.x, b.y, r + 5);
      this.graphics.stroke({ width: 3.5, color: mainColor, alpha: 0.45 });

      // Rotating Teeth
      const pts = [];
      for (let t = 0; t < teeth; t++) {
        const a1 = rot + (t * Math.PI * 2) / teeth;
        const a2 = a1 + (Math.PI / teeth);
        pts.push({ x: b.x + Math.cos(a1) * (r + 4), y: b.y + Math.sin(a1) * (r + 4) });
        pts.push({ x: b.x + Math.cos(a2) * (r * 0.72), y: b.y + Math.sin(a2) * (r * 0.72) });
      }
      this.graphics.poly(pts);
      this.graphics.fill({ color: mainColor });
      this.graphics.poly(pts);
      this.graphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.95 });

      // Inner Hub
      this.graphics.circle(b.x, b.y, r * 0.4);
      this.graphics.fill({ color: 0x0f172a });
      this.graphics.stroke({ width: 1.5, color: 0xffffff });
      this.graphics.circle(b.x, b.y, r * 0.18);
      this.graphics.fill({ color: 0xffffff });

      // Synergy: Lightning sparks jumping off the saw teeth
      if (hasLightning) {
        for (let s = 0; s < 3; s++) {
          const sAngle = Math.random() * Math.PI * 2;
          const sLen = r + 8 + Math.random() * 12;
          this.graphics.moveTo(b.x, b.y);
          this.graphics.lineTo(b.x + Math.cos(sAngle) * sLen, b.y + Math.sin(sAngle) * sLen);
          this.graphics.stroke({ width: 1.8, color: 0xffea00, alpha: 0.85 });
        }
      }
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
