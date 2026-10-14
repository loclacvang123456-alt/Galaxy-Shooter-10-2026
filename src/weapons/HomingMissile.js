import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class HomingMissile extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.MISSILE);
    this.baseCooldown = 1.1;
    this.damage = 55;
    this.speed = 390;
    this.aoeRadius = 55;
    this.count = 1;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.speed = 520;
        this.baseCooldown = 0.95;
        this.damage = 80;
        break;
      case 3:
        this.count = 2;
        this.damage = 95;
        break;
      case 4:
        this.aoeRadius = 90;
        this.damage = 135;
        this.count = 3;
        break;
      case 5:
        // TIER 5 EVOLUTION: VOID HELLFIRE RECURSIVE SWARM
        this.count = 8; // 8 Guided missiles with recursive cluster splits
        this.damage = 220;
        this.aoeRadius = 140;
        this.speed = 650;
        this.baseCooldown = 0.70;
        break;
    }
  }

  fire(enemies, target) {
    const scene = this.engine.sceneManager.currentScene;
    if (!scene || !scene.bulletPool) return;

    this.cooldown = this.baseCooldown * this.cooldownMultiplier;
    const isTier5 = this.tier === 5;
    const effDamage = Math.round(this.damage * this.damageMultiplier);
    const effSpeed = Math.round(this.speed * this.speedMultiplier);
    const effAoe = Math.round(this.aoeRadius * this.aoeMultiplier);
    audio.playMissileLaunch();

    const mountX = this.turret.x + this.mountOffsetX;
    const mountY = this.turret.y + this.mountOffsetY;
    const baseAngle = this.barrelAngle;

    for (let i = 0; i < this.count; i++) {
      const spread = isTier5 ? 0.35 : 0.25;
      const launchAngle = baseAngle + (i - (this.count - 1) / 2) * spread;
      const muzzleX = mountX + Math.cos(launchAngle) * 22;
      const muzzleY = mountY + Math.sin(launchAngle) * 22;

      scene.bulletPool.get({
        type: 'missile',
        x: muzzleX,
        y: muzzleY,
        angle: launchAngle,
        speed: effSpeed,
        damage: effDamage,
        aoeRadius: effAoe,
        life: 3.5,
        target: target,
        color: isTier5 ? 0xd946ef : 0xff6600,
        isTier5
      });
    }
  }
}
