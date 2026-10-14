export class WeaponBase {
  constructor(engine, turret, id) {
    this.engine = engine;
    this.turret = turret;
    this.id = id;
    this.tier = 1;

    // Sub-Upgrades System: 3 minor upgrades needed before unlocking next Major Tier
    this.subLevel = 0;       // 0, 1, 2, 3
    this.maxSubLevel = 3;

    this.cooldown = 0;
    this.baseCooldown = 0.5;
    this.barrelAngle = 0;
    this.mountOffsetX = 0;
    this.mountOffsetY = 0;

    // Stat multipliers accumulated from minor sub-upgrades
    this.damageMultiplier = 1.0;
    this.cooldownMultiplier = 1.0;
    this.speedMultiplier = 1.0;
    this.aoeMultiplier = 1.0;
    this.rangeMultiplier = 1.0;
    this.specialMultiplier = 1.0;
    this.durationMultiplier = 1.0;
    this.extraSubBeams = 0;
  }

  applySubUpgrade(statKey) {
    if (this.subLevel < this.maxSubLevel) {
      this.subLevel++;
      switch (statKey) {
        case 'damage':
          this.damageMultiplier += 0.35;
          break;
        case 'cooldown':
          this.cooldownMultiplier = Math.max(0.35, this.cooldownMultiplier * 0.80);
          break;
        case 'speed':
          this.speedMultiplier += 0.30;
          break;
        case 'aoe':
          this.aoeMultiplier += 0.30;
          break;
        case 'range':
          this.rangeMultiplier += 0.25;
          break;
        case 'special':
          this.specialMultiplier += 0.25;
          break;
        case 'duration':
          this.durationMultiplier += 0.35;
          break;
        case 'sub_beam':
          this.extraSubBeams += 1;
          break;
        case 'exp':
          const scene = this.engine.sceneManager?.currentScene;
          if (scene) {
            scene.addExpBonus?.(0.25);
          }
          break;
      }
      return true;
    }
    return false;
  }

  upgrade() {
    if (this.tier < 5) {
      this.tier++;
      this.subLevel = 0; // Reset minor upgrades for the new tier
      this.applyTierStats();
      return true;
    }
    return false;
  }

  applyTierStats() {
    // Override in derived classes
  }

  update(dt, enemies, target) {
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      this.fire(enemies, target);
      this.engine.sceneManager.currentScene?.tracker?.recordShot(this.id);
    }
  }

  fire(enemies, target) {
    // Override in derived classes
  }
}
