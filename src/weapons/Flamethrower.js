import { Graphics } from 'pixi.js';
import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class Flamethrower extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.FLAME);
    this.baseCooldown = 0.05; // Rapid continuous stream
    this.directDamage = 6;
    this.burnDps = 36;
    this.burnDuration = 2.5;
    this.range = 210;
    this.coneAngle = 0.55;
    this.soundTimer = 0;

    // Dedicated Flame VFX Graphics
    this.flameGraphics = new Graphics();
    this.engine.vfxLayer.addChild(this.flameGraphics);

    this.flamePuffs = []; // Billowing expanding fire clouds
    this.vortexAngle = 0;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.range = 270;
        this.coneAngle = 0.75;
        this.directDamage = 8;
        this.burnDps = 55;
        break;
      case 3:
        this.burnDps = 95; // Blue napalm
        this.directDamage = 13;
        this.burnDuration = 3.5;
        break;
      case 4:
        this.directDamage = 20;
        this.range = 310;
        this.coneAngle = 0.95;
        this.burnDps = 120;
        break;
      case 5:
        // TIER 5 EVOLUTION: 360° INFERNO VORTEX
        this.range = 350;
        this.coneAngle = Math.PI * 2;
        this.directDamage = 32;
        this.burnDps = 180;
        break;
    }
  }

  update(dt, enemies, target) {
    super.update(dt, enemies, target);
    this.soundTimer -= dt;
    this.vortexAngle += dt * 5;

    // Update active billowing flame puffs
    for (let i = this.flamePuffs.length - 1; i >= 0; i--) {
      const p = this.flamePuffs[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.flamePuffs.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.radius += p.growth * dt;
    }

    // Tier 5: Dragon Hellfire Superstorm spawns Magma Pools along 4 spinning vortex arms
    if (this.tier === 5) {
      this.magmaDropTimer = (this.magmaDropTimer || 0) + dt;
      if (this.magmaDropTimer >= 0.75) {
        this.magmaDropTimer = 0;
        const scene = this.engine.sceneManager?.currentScene;
        if (scene?.addMagmaPool) {
          for (let v = 0; v < 4; v++) {
            const vAngle = this.vortexAngle + (v * Math.PI * 2) / 4;
            const dist = 140 + Math.random() * 120;
            const mx = this.turret.x + Math.cos(vAngle) * dist;
            const my = this.turret.y + Math.sin(vAngle) * dist;
            scene.addMagmaPool(mx, my, 85, 4.0, 95);
          }
        }
      }
    }

    this.renderFlames();
  }

  fire(enemies, target) {
    this.cooldown = this.baseCooldown * this.cooldownMultiplier;

    if (this.soundTimer <= 0) {
      this.soundTimer = 0.22;
      audio.playFlame();
    }

    const isTier5 = this.tier === 5;
    const isBlue = this.tier >= 3 && !isTier5;
    const effDirectDmg = Math.round(this.directDamage * this.damageMultiplier);
    const effBurnDps = Math.round(this.burnDps * this.damageMultiplier);
    const effRange = Math.round(this.range * this.rangeMultiplier);
    const mountX = this.turret.x + (isTier5 ? 0 : this.mountOffsetX);
    const mountY = this.turret.y + (isTier5 ? 0 : this.mountOffsetY);
    const baseAngle = this.barrelAngle;

    // Spawn billowing expanding fire puffs reaching full effRange
    const puffCount = isTier5 ? 8 : 4;
    const maxLife = isTier5 ? 0.60 : 0.48;

    for (let i = 0; i < puffCount; i++) {
      const angle = isTier5
        ? (this.vortexAngle + (i * Math.PI * 2) / puffCount + (Math.random() - 0.5) * 0.35)
        : (baseAngle + (Math.random() - 0.5) * this.coneAngle);

      const speed = (effRange / maxLife) * (0.90 + Math.random() * 0.22);
      const startDist = isTier5 ? 28 : 18;
      const startX = mountX + Math.cos(angle) * startDist;
      const startY = mountY + Math.sin(angle) * startDist;

      this.flamePuffs.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 12 + Math.random() * 6,
        growth: 65 + Math.random() * 35,
        life: maxLife,
        maxLife: maxLife,
        isBlue
      });
    }

    // Damage enemies
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        const dx = enemy.x - mountX;
        const dy = enemy.y - mountY;
        const dist = Math.hypot(dx, dy);

        if (dist <= effRange + enemy.size) {
          if (isTier5) {
            enemy.takeDamage(effDirectDmg, 'burn');
            enemy.applyBurn(effBurnDps, this.burnDuration);
          } else {
            const angleToEnemy = Math.atan2(dy, dx);
            let diff = Math.abs(angleToEnemy - baseAngle);
            while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

            if (diff <= this.coneAngle / 2 + 0.15) {
              enemy.takeDamage(effDirectDmg, 'burn');
              enemy.applyBurn(effBurnDps, this.burnDuration);
            }
          }
        }
      }
    }
  }

  renderFlames() {
    this.flameGraphics.clear();

    const isTier5 = this.tier === 5;
    const isBlue = this.tier >= 3 && !isTier5;
    const effRange = Math.round(this.range * this.rangeMultiplier);
    const mountX = this.turret.x + (isTier5 ? 0 : this.mountOffsetX);
    const mountY = this.turret.y + (isTier5 ? 0 : this.mountOffsetY);
    const baseAngle = this.barrelAngle;

    // 1. Draw base flame cone jet from nozzle to full range for seamless stream
    if (!isTier5 && this.flamePuffs.length > 0) {
      const halfCone = this.coneAngle / 2;
      const steps = 6;
      const arcPts = [];
      arcPts.push({ x: mountX, y: mountY });
      for (let s = 0; s <= steps; s++) {
        const a = baseAngle - halfCone + (this.coneAngle * s) / steps;
        arcPts.push({
          x: mountX + Math.cos(a) * effRange * 0.95,
          y: mountY + Math.sin(a) * effRange * 0.95
        });
      }
      this.flameGraphics.poly(arcPts);
      this.flameGraphics.fill({ color: isBlue ? 0x0055ff : 0xff3300, alpha: 0.18 });

      // Core inner jet
      const corePts = [];
      corePts.push({ x: mountX, y: mountY });
      for (let s = 0; s <= steps; s++) {
        const a = baseAngle - halfCone * 0.6 + (this.coneAngle * 0.6 * s) / steps;
        corePts.push({
          x: mountX + Math.cos(a) * effRange * 0.55,
          y: mountY + Math.sin(a) * effRange * 0.55
        });
      }
      this.flameGraphics.poly(corePts);
      this.flameGraphics.fill({ color: isBlue ? 0x00ffff : 0xffea00, alpha: 0.35 });
    }

    // 2. Render expanding flame puffs filling the cone out to effRange
    for (const p of this.flamePuffs) {
      const progress = p.life / p.maxLife; // 1 -> 0
      const alpha = Math.min(1, progress * 1.5);

      if (p.isBlue) {
        // Blue Napalm
        this.flameGraphics.circle(p.x, p.y, p.radius * 1.35);
        this.flameGraphics.fill({ color: 0x0044ff, alpha: 0.28 * alpha });
        this.flameGraphics.circle(p.x, p.y, p.radius);
        this.flameGraphics.fill({ color: 0x00d4ff, alpha: 0.62 * alpha });
        this.flameGraphics.circle(p.x, p.y, p.radius * 0.45);
        this.flameGraphics.fill({ color: 0xffffff, alpha: 0.88 * alpha });
      } else {
        // Blazing Orange/Gold Fire
        this.flameGraphics.circle(p.x, p.y, p.radius * 1.4);
        this.flameGraphics.fill({ color: 0xd91a00, alpha: 0.32 * alpha });
        this.flameGraphics.circle(p.x, p.y, p.radius);
        this.flameGraphics.fill({ color: 0xff5500, alpha: 0.65 * alpha });
        this.flameGraphics.circle(p.x, p.y, p.radius * 0.45);
        this.flameGraphics.fill({ color: 0xffea00, alpha: 0.90 * alpha });
      }
    }

    // 3. At Tier 5: Complete 360° INFERNO VORTEX WHEEL covering FULL effRange
    if (isTier5) {
      const pulse = 0.88 + Math.sin(this.vortexAngle * 4) * 0.12;

      // Fiery background disc matching full 360° burn field
      this.flameGraphics.circle(this.turret.x, this.turret.y, effRange);
      this.flameGraphics.fill({ color: 0xff2200, alpha: 0.15 * pulse });

      // Outer burning perimeter rim (shows exact 350px boundary)
      this.flameGraphics.circle(this.turret.x, this.turret.y, effRange);
      this.flameGraphics.stroke({ width: 4.5, color: 0xff5500, alpha: 0.85 * pulse });

      this.flameGraphics.circle(this.turret.x, this.turret.y, effRange * 0.98);
      this.flameGraphics.stroke({ width: 2, color: 0xffea00, alpha: 0.75 * pulse });

      // 8 Rotating Spiral Fire Arms stretching from center to effRange
      const arms = 8;
      for (let a = 0; a < arms; a++) {
        const armAngle = this.vortexAngle + (a * Math.PI * 2) / arms;
        const outerX = this.turret.x + Math.cos(armAngle) * effRange * 0.95;
        const outerY = this.turret.y + Math.sin(armAngle) * effRange * 0.95;
        const midAngle = armAngle - 0.35;
        const midX = this.turret.x + Math.cos(midAngle) * effRange * 0.55;
        const midY = this.turret.y + Math.sin(midAngle) * effRange * 0.55;

        this.flameGraphics.moveTo(this.turret.x, this.turret.y);
        this.flameGraphics.quadraticCurveTo(midX, midY, outerX, outerY);
        this.flameGraphics.stroke({ width: 3.5, color: 0xffaa00, alpha: 0.65 * pulse });
      }

      // Inner Searing Core Ring
      this.flameGraphics.circle(this.turret.x, this.turret.y, effRange * 0.45);
      this.flameGraphics.stroke({ width: 5, color: 0xffdd00, alpha: 0.7 * pulse });
    }
  }

  destroy() {
    this.flamePuffs = [];
    this.flameGraphics.destroy();
  }
}
