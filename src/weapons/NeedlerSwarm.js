import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class NeedlerSwarm extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.SWARM);
    this.baseCooldown = 0.55;
    this.damage = 22;
    this.needleCount = 3;
    this.salvoDelay = 0.05;
    this.speed = 580;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.needleCount = 5;
        this.damage = 38;
        break;
      case 3:
        this.needleCount = 7;
        this.damage = 56;
        this.baseCooldown = 0.48;
        break;
      case 4:
        this.needleCount = 9;
        this.damage = 85;
        this.baseCooldown = 0.42;
        break;
      case 5:
        // TIER 5 EVOLUTION: NEO-HYDRA NEEDLE PHALANX (Double-Helix Barrage)
        this.needleCount = 18;
        this.damage = 190;
        this.baseCooldown = 0.28;
        this.speed = 780;
        break;
    }
  }

  fire(enemies, target) {
    const scene = this.engine.sceneManager.currentScene;
    if (!scene || !scene.bulletPool) return;

    const mountX = this.turret.x + this.mountOffsetX;
    const mountY = this.turret.y + this.mountOffsetY;

    let aimAngle = this.barrelAngle;
    if (target && target.isAlive) {
      aimAngle = Math.atan2(target.y - mountY, target.x - mountX);
      this.barrelAngle = aimAngle;
    } else if (enemies && enemies.length > 0) {
      let closest = null;
      let minDist = Infinity;
      for (const e of enemies) {
        if (!e.isAlive) continue;
        const d = Math.hypot(e.x - mountX, e.y - mountY);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }
      if (closest) {
        aimAngle = Math.atan2(closest.y - mountY, closest.x - mountX);
        this.barrelAngle = aimAngle;
      }
    }

    const effDmg = this.damage * this.damageMultiplier;
    const isTier5 = this.tier === 5;
    const count = this.needleCount;

    audio.playShoot();

    // Staggered double-helix needle launch
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!scene.bulletPool) return;
        const spread = isTier5 ? Math.sin(i * 0.9) * 0.38 : (Math.random() - 0.5) * 0.45;
        const nAngle = aimAngle + spread;
        const color = isTier5 ? (i % 2 === 0 ? 0xec4899 : 0x06b6d4) : 0xec4899;
        const muzzleX = mountX + Math.cos(nAngle) * 12;
        const muzzleY = mountY + Math.sin(nAngle) * 12;

        scene.bulletPool.get({
          type: 'needle',
          x: muzzleX,
          y: muzzleY,
          angle: nAngle,
          speed: this.speed * this.speedMultiplier,
          damage: effDmg,
          pierce: 1,
          life: 2.2,
          color: color,
          target: target,
          isTier5: isTier5
        });
      }, i * (isTier5 ? 26 : 40));
    }

    this.cooldown = this.baseCooldown * this.cooldownMultiplier;
  }
}
