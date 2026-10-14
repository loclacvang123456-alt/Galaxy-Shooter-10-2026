import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class CryoSpikes extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.CRYO);
    this.baseCooldown = 0.65;
    this.damage = 48;
    this.shardCount = 3; // Starts with 3 shards (1 dead-center, 2 side flanks)
    this.spreadAngle = 0.38;
    this.projectileSpeed = 540;
    this.pierce = 1;
    this.slowAmount = 0.5;
    this.slowDuration = 2.4;
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        this.shardCount = 5;
        this.damage = 78;
        this.spreadAngle = 0.55;
        this.pierce = 2;
        break;
      case 3:
        this.shardCount = 7;
        this.damage = 120;
        this.spreadAngle = 0.70;
        this.pierce = 3;
        this.slowAmount = 0.4; // 60% slow
        break;
      case 4:
        this.shardCount = 9;
        this.damage = 180;
        this.baseCooldown = 0.52;
        this.spreadAngle = 0.90;
        this.pierce = 5;
        break;
      case 5:
        // TIER 5 EVOLUTION: GLACIAL ZERO ABSOLUTE
        this.shardCount = 11;
        this.damage = 290;
        this.baseCooldown = 0.42;
        this.spreadAngle = 1.15;
        this.pierce = 8;
        this.slowAmount = 0.25; // 75% slow (near freeze!)
        this.slowDuration = 3.5;
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
    const count = this.shardCount;
    const startAngle = aimAngle - (this.spreadAngle / 2);
    const angleStep = count > 1 ? this.spreadAngle / (count - 1) : 0;

    audio.playShoot();

    const centerIndex = Math.floor(count / 2);

    for (let i = 0; i < count; i++) {
      const angle = count === 1 ? aimAngle : startAngle + i * angleStep;
      const muzzleX = mountX + Math.cos(angle) * 18;
      const muzzleY = mountY + Math.sin(angle) * 18;
      const isCenterTitan = isTier5 && i === centerIndex;

      scene.bulletPool.get({
        type: 'frost_shard',
        x: muzzleX,
        y: muzzleY,
        angle: angle,
        speed: (this.projectileSpeed * this.speedMultiplier) * (isCenterTitan ? 1.2 : 1.0),
        damage: effDmg * (isCenterTitan ? 2.5 : 1.0),
        pierce: isCenterTitan ? (this.pierce + 5) : this.pierce,
        life: 2.0,
        color: isCenterTitan ? 0x00f0ff : 0xa5f3fc,
        isTier5: isTier5,
        isTitanComet: isCenterTitan
      });
    }

    // Sparkle VFX around barrel
    scene.particles?.emit({
      x: mountX + Math.cos(aimAngle) * 18,
      y: mountY + Math.sin(aimAngle) * 18,
      count: 5,
      color: 0x00f0ff,
      speed: 80,
      life: 0.15
    });

    this.cooldown = this.baseCooldown * this.cooldownMultiplier;
  }
}
