import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class PlasmaBomb extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.BOMB);
    this.baseCooldown = 1.5;
    this.damage = 80;
    this.aoeRadius = 90;
    this.bombsCount = 1;
    this.bounces = 0;
    this.splitClusters = 0;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.aoeRadius = 130;
        this.damage = 125;
        break;
      case 3:
        this.bounces = 1; // Bounces and detonates twice
        this.damage = 150;
        break;
      case 4:
        this.bombsCount = 2; // Twin Mortar
        this.baseCooldown = 1.35;
        this.damage = 190;
        break;
      case 5:
        // TIER 5 EVOLUTION: SUPERNOVA HYPER BOMB
        this.bombsCount = 2;
        this.splitClusters = 6; // Splits into 6 cluster mini-bombs
        this.damage = 300;
        this.aoeRadius = 190;
        this.baseCooldown = 1.15;
        break;
    }
  }

  fire(enemies, target) {
    const scene = this.engine.sceneManager.currentScene;
    if (!scene || !scene.bulletPool) return;

    this.cooldown = this.baseCooldown * this.cooldownMultiplier;
    const isTier5 = this.tier === 5;
    const isInferno = this.turret.hasSynergy('bomb+flame');
    const effDamage = Math.round(this.damage * this.damageMultiplier);
    const effAoe = Math.round(this.aoeRadius * this.aoeMultiplier * (isInferno ? 1.3 : 1.0));
    audio.playExplosion(isTier5 ? 1.2 : 0.6);

    const mountX = this.turret.x + this.mountOffsetX;
    const mountY = this.turret.y + this.mountOffsetY;
    const baseAngle = this.barrelAngle;

    for (let i = 0; i < this.bombsCount; i++) {
      const spread = (i - (this.bombsCount - 1) / 2) * 0.45;
      const angle = baseAngle + spread;
      const muzzleX = mountX + Math.cos(angle) * 24;
      const muzzleY = mountY + Math.sin(angle) * 24;

      scene.bulletPool.get({
        type: 'bomb',
        x: muzzleX,
        y: muzzleY,
        angle: angle,
        speed: 310,
        damage: effDamage,
        aoeRadius: effAoe,
        life: 0.85,
        color: isInferno ? 0xff3300 : (isTier5 ? 0xff7700 : 0xaa00ff),
        bouncesLeft: this.bounces,
        splitCount: this.splitClusters,
        isTier5,
        isInfernoCore: isInferno
      });
    }
  }
}
