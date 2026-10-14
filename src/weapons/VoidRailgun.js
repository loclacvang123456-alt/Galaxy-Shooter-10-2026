import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class VoidRailgun extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.VOID_RAILGUN);
    this.baseCooldown = 1.75;
    this.damage = 180;
    this.projectileSpeed = 1100;
    this.slugCount = 1;
    this.wakeWidth = 60;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.damage = 290;
        this.baseCooldown = 1.55;
        this.projectileSpeed = 1250;
        this.wakeWidth = 75;
        break;
      case 3:
        this.damage = 420;
        this.baseCooldown = 1.4;
        this.slugCount = 2; // Twin parallel railgun slugs
        this.wakeWidth = 90;
        break;
      case 4:
        this.damage = 620;
        this.baseCooldown = 1.25;
        this.projectileSpeed = 1400;
        this.wakeWidth = 110;
        break;
      case 5:
        // TIER 5 EVOLUTION: SINGULARITY OBLITERATOR
        this.damage = 1050;
        this.baseCooldown = 1.05;
        this.slugCount = 3;
        this.projectileSpeed = 1600;
        this.wakeWidth = 140;
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
      // Find highest HP enemy to blast
      let highestHpEnemy = null;
      let maxHp = 0;
      for (const e of enemies) {
        if (e.isAlive && e.hp > maxHp) {
          maxHp = e.hp;
          highestHpEnemy = e;
        }
      }
      if (highestHpEnemy) {
        aimAngle = Math.atan2(highestHpEnemy.y - mountY, highestHpEnemy.x - mountX);
        this.barrelAngle = aimAngle;
      }
    }

    const effDmg = this.damage * this.damageMultiplier;
    const isTier5 = this.tier === 5;
    const count = this.slugCount;
    const spreadOffset = 18; // Perpendicular offset for parallel railgun slugs

    audio.playLaser(); // Deep energy railgun report

    const perpAngle = aimAngle + Math.PI / 2;
    const perpX = Math.cos(perpAngle);
    const perpY = Math.sin(perpAngle);

    for (let i = 0; i < count; i++) {
      const offsetMultiplier = count === 1 ? 0 : (i - (count - 1) / 2);
      const spawnX = mountX + Math.cos(aimAngle) * 26 + perpX * (offsetMultiplier * spreadOffset);
      const spawnY = mountY + Math.sin(aimAngle) * 26 + perpY * (offsetMultiplier * spreadOffset);

      scene.bulletPool.get({
        type: 'void_slug',
        x: spawnX,
        y: spawnY,
        angle: aimAngle,
        speed: this.projectileSpeed * this.speedMultiplier,
        damage: effDmg,
        pierce: 999, // Infinite penetration across whole screen
        life: 1.6,
        color: 0x9333ea,
        isTier5: isTier5
      });
    }

    // Heavy muzzle blast recoil vfx
    scene.particles?.emit({
      x: mountX + Math.cos(aimAngle) * 26,
      y: mountY + Math.sin(aimAngle) * 26,
      count: 12,
      color: 0xc084fc,
      speed: 160,
      life: 0.25,
      size: 5
    });

    this.cooldown = this.baseCooldown * this.cooldownMultiplier;
  }
}
