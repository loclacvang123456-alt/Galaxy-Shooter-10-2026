import { Graphics } from 'pixi.js';
import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class TeslaPylon extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.TESLA);
    this.baseCooldown = 0.15; // Damage tick rate
    this.damage = 42;
    this.pylonCount = 2;
    this.gridRadius = 180;
    this.pulseTimer = 0;
    this.orbitAngle = 0;
    this.orbitSpeed = 0.8;
    this.thorTimer = 0;

    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);
    this.hitCooldowns = new WeakMap();
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.pylonCount = 3;
        this.damage = 65;
        this.gridRadius = 210;
        break;
      case 3:
        this.pylonCount = 3;
        this.damage = 105;
        this.gridRadius = 240;
        this.orbitSpeed = 1.1;
        break;
      case 4:
        this.pylonCount = 4;
        this.damage = 160;
        this.gridRadius = 270;
        this.orbitSpeed = 1.3;
        break;
      case 5:
        // TIER 5 EVOLUTION: STORM-GOD CONDUCTOR MATRIX
        this.pylonCount = 5;
        this.damage = 280;
        this.gridRadius = 300;
        this.orbitSpeed = 1.8;
        break;
    }
  }

  update(dt, enemies) {
    this.pulseTimer += dt * 4;
    const speedMult = this.speedMultiplier || 1.0;
    this.orbitAngle += this.orbitSpeed * speedMult * dt;

    const isTier5 = this.tier === 5;
    const hasLightningSyn = this.turret.hasSynergy('tesla+passive_lightning');
    const effDmg = this.damage * this.damageMultiplier * dt * 3.5;

    // Calculate pylon world positions
    const pylons = [];
    const rad = this.gridRadius * (this.rangeMultiplier || 1.0);
    for (let i = 0; i < this.pylonCount; i++) {
      const angle = this.orbitAngle + (i * Math.PI * 2) / this.pylonCount;
      const px = this.turret.x + Math.cos(angle) * rad;
      const py = this.turret.y + Math.sin(angle) * rad;
      pylons.push({ x: px, y: py, angle });
    }

    // Connect pylons into line segments:
    // 1. Each pylon connected to turret
    // 2. Each pylon connected to next pylon in loop
    // 3. Tier 5: Pentagram Star Lattice (every pylon connected across to i+2)
    const links = [];
    for (let i = 0; i < pylons.length; i++) {
      links.push({ x1: this.turret.x, y1: this.turret.y, x2: pylons[i].x, y2: pylons[i].y });
      const next = (i + 1) % pylons.length;
      links.push({ x1: pylons[i].x, y1: pylons[i].y, x2: pylons[next].x, y2: pylons[next].y });

      if (isTier5 && pylons.length === 5) {
        const nextStar = (i + 2) % 5;
        links.push({ x1: pylons[i].x, y1: pylons[i].y, x2: pylons[nextStar].x, y2: pylons[nextStar].y, isStar: true });
      }
    }

    // Damage enemies crossing any electric laser line
    if (enemies) {
      for (const link of links) {
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          const dist = this.pointLineDist(enemy.x, enemy.y, link.x1, link.y1, link.x2, link.y2);
          if (dist <= enemy.size + 14) {
            enemy.takeDamage(effDmg, 'lightning');

            if (Math.random() < 0.2) {
              this.engine.sceneManager.currentScene?.particles?.emit({
                x: enemy.x,
                y: enemy.y,
                count: 3,
                color: isTier5 ? 0xffea00 : 0x00f0ff,
                speed: 90,
                life: 0.15
              });
            }

            // Synergy: Tesla + Lightning (Thor's Supercharged Grid)
            if (hasLightningSyn && Math.random() < 0.15) {
              for (const other of enemies) {
                if (other === enemy || !other.isAlive) continue;
                if (Math.hypot(other.x - enemy.x, other.y - enemy.y) <= 140) {
                  other.takeDamage(effDmg * 1.5, 'lightning');
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Tier 5: Thor's Heavenly Lightning Strike onto strongest enemy
    if (isTier5 && enemies && enemies.length > 0) {
      this.thorTimer += dt;
      if (this.thorTimer >= 1.1) {
        this.thorTimer = 0;
        let strongest = null;
        let maxHp = 0;
        for (const e of enemies) {
          if (e.isAlive && e.hp > maxHp) {
            maxHp = e.hp;
            strongest = e;
          }
        }
        if (strongest) {
          audio.playLaser();
          const thorDmg = 650 * (this.damageMultiplier || 1.0);
          strongest.takeDamage(thorDmg, 'lightning');
          const scene = this.engine.sceneManager.currentScene;
          scene?.particles?.emitExplosion(strongest.x, strongest.y, 160, 0xffea00);
          scene?.particles?.emitShockwave(strongest.x, strongest.y, 200, 0xffffff);

          for (const o of enemies) {
            if (!o.isAlive || o === strongest) continue;
            if (Math.hypot(o.x - strongest.x, o.y - strongest.y) <= 180) {
              o.takeDamage(thorDmg * 0.45, 'lightning');
            }
          }
        }
      }
    }

    this.render(pylons, links, isTier5, hasLightningSyn);
  }

  pointLineDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  }

  render(pylons, links, isTier5, hasLightningSyn) {
    this.graphics.clear();
    const beamColor = isTier5 ? 0xffea00 : 0x00f0ff;
    const coreColor = 0xffffff;

    // Render Electric Laser Links between pylons
    for (const link of links) {
      // Glow beam
      this.graphics.moveTo(link.x1, link.y1);
      this.graphics.lineTo(link.x2, link.y2);
      this.graphics.stroke({ width: isTier5 ? 7 : 4, color: beamColor, alpha: 0.4 });

      // Core electric beam
      this.graphics.moveTo(link.x1, link.y1);
      this.graphics.lineTo(link.x2, link.y2);
      this.graphics.stroke({ width: isTier5 ? 3 : 1.8, color: coreColor, alpha: 0.9 });

      // Jittering electric arc
      const segments = 6;
      const dx = (link.x2 - link.x1) / segments;
      const dy = (link.y2 - link.y1) / segments;
      const normX = -dy / Math.hypot(dx, dy);
      const normY = dx / Math.hypot(dx, dy);

      this.graphics.moveTo(link.x1, link.y1);
      for (let s = 1; s < segments; s++) {
        const jitter = (Math.random() - 0.5) * 12;
        this.graphics.lineTo(link.x1 + dx * s + normX * jitter, link.y1 + dy * s + normY * jitter);
      }
      this.graphics.lineTo(link.x2, link.y2);
      this.graphics.stroke({ width: 1.5, color: isTier5 ? 0xffffff : 0xffea00, alpha: 0.85 });
    }

    // Render Pylons (Floating nodes)
    for (const p of pylons) {
      const pR = isTier5 ? 14 : 10;
      const pulse = 0.8 + Math.sin(this.pulseTimer * 3 + p.angle) * 0.2;

      // Glow halo
      this.graphics.circle(p.x, p.y, (pR + 6) * pulse);
      this.graphics.stroke({ width: 3, color: beamColor, alpha: 0.5 });

      // Pylon body
      this.graphics.poly([
        { x: p.x, y: p.y - pR },
        { x: p.x + pR, y: p.y },
        { x: p.x, y: p.y + pR },
        { x: p.x - pR, y: p.y }
      ]);
      this.graphics.fill({ color: 0x0f172a });
      this.graphics.stroke({ width: 2, color: beamColor });

      // Glowing Core
      this.graphics.circle(p.x, p.y, pR * 0.45);
      this.graphics.fill({ color: coreColor });
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
