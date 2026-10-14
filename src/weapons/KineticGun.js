import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class KineticGun extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.KINETIC);
    this.baseCooldown = 0.30;
    this.damage = 22;
    this.pierce = 1;
    this.projectiles = 1;
    this.speed = 650;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.projectiles = 2;
        this.damage = 30;
        this.baseCooldown = 0.26;
        break;
      case 3:
        this.pierce = 2;
        this.damage = 44;
        break;
      case 4:
        this.baseCooldown = 0.15; // Gatling Overdrive
        this.damage = 58;
        break;
      case 5:
        // TIER 5 EVOLUTION: CRIMSON OMEGA RAILGUN
        this.projectiles = 3;
        this.pierce = 99; // Pierces all enemies
        this.damage = 140;
        this.speed = 900;
        this.baseCooldown = 0.12;
        break;
    }
  }

  fire(enemies, target) {
    const scene = this.engine.sceneManager.currentScene;
    if (!scene || !scene.bulletPool) return;

    const mountX = this.turret.x + (this.mountOffsetX || 0);
    const mountY = this.turret.y + (this.mountOffsetY || 0);

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
      } else {
        return; // No living enemies on screen
      }
    } else {
      if (this.turret && this.turret.mainGunAngle !== undefined && !this.barrelAngle) {
        aimAngle = this.turret.mainGunAngle;
      }
    }

    this.cooldown = this.baseCooldown * this.cooldownMultiplier;
    const isTier5 = this.tier === 5;
    const effDamage = Math.round(this.damage * this.damageMultiplier);
    const effSpeed = Math.round(this.speed * this.speedMultiplier);
    audio.playShoot();

    // Muzzle flash particle
    const muzzleDist = (this.mountOffsetX === 0 && this.mountOffsetY === 0) ? 36 : 24;
    const muzzleX = mountX + Math.cos(aimAngle) * muzzleDist;
    const muzzleY = mountY + Math.sin(aimAngle) * muzzleDist;
    const flashColor = isTier5 ? 0xff0044 : 0x00f0ff;
    scene.particles?.emit({
      x: muzzleX,
      y: muzzleY,
      count: isTier5 ? 12 : 6,
      color: flashColor,
      speed: isTier5 ? 140 : 80,
      life: 0.18
    });

    if (this.projectiles === 1) {
      scene.bulletPool.get({
        type: 'normal',
        x: muzzleX,
        y: muzzleY,
        angle: aimAngle,
        speed: effSpeed,
        damage: effDamage,
        pierce: this.pierce,
        color: flashColor,
        isTier5
      });
    } else {
      const spread = isTier5 ? 0.18 : 0.14;
      for (let i = 0; i < this.projectiles; i++) {
        const offsetAngle = aimAngle + (i - (this.projectiles - 1) / 2) * spread;
        scene.bulletPool.get({
          type: 'normal',
          x: muzzleX,
          y: muzzleY,
          angle: offsetAngle,
          speed: effSpeed,
          damage: effDamage,
          pierce: this.pierce,
          color: flashColor,
          isTier5
        });
      }
    }
  }
}
