import { Graphics } from 'pixi.js';
import { CONFIG } from '../config.js';
import { WEAPON_TYPES, PASSIVE_TYPES, getSynergy, getPassiveSynergy } from '../weapons/WeaponRegistry.js';
import { KineticGun } from '../weapons/KineticGun.js';
import { HomingMissile } from '../weapons/HomingMissile.js';
import { PlasmaBomb } from '../weapons/PlasmaBomb.js';
import { PiercingLaser } from '../weapons/PiercingLaser.js';
import { Flamethrower } from '../weapons/Flamethrower.js';
import { PlasmaSawblade } from '../weapons/PlasmaSawblade.js';
import { CryoSpikes } from '../weapons/CryoSpikes.js';
import { NeedlerSwarm } from '../weapons/NeedlerSwarm.js';
import { TeslaPylon } from '../weapons/TeslaPylon.js';
import { VoidRailgun } from '../weapons/VoidRailgun.js';

export class Turret {
  constructor(engine, x, y) {
    this.engine = engine;
    this.x = x;
    this.y = y;

    // Angles
    this.mainGunAngle = 0; // Player manual aim angle (Kinetic Cannon)
    this.rotation = 0;     // Legacy fallback

    this.maxHp = CONFIG.TURRET.MAX_HP;
    this.currentHp = this.maxHp;
    this.radius = CONFIG.TURRET.RADIUS;

    this.equippedWeapons = []; // Max 3 weapons: 1 main kinetic + up to 2 secondary
    this.activeSynergies = [];
    this.lockedTarget = null; // Sticky target for secondary weapons
    this.freezeTimer = 0; // Frozen by Cryo Boss EMP attack

    this.graphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.graphics);
  }

  hasSynergy(synergyId) {
    if (!synergyId) return false;
    return this.activeSynergies.some(s => {
      if (s.id === synergyId) return true;
      const parts = synergyId.split('+');
      if (parts.length === 2 && s.id.split('+').length === 2) {
        const sParts = s.id.split('+');
        return (parts[0] === sParts[0] && parts[1] === sParts[1]) ||
               (parts[0] === sParts[1] && parts[1] === sParts[0]);
      }
      return false;
    });
  }

  hasWeaponSynergy(weaponId) {
    if (!weaponId) return false;
    return this.activeSynergies.some(s => {
      if (s.type !== 'weapon_fusion' && s.id.includes('passive_')) return false;
      const parts = s.id.split('+');
      return parts.includes(weaponId) && !parts.some(p => p.startsWith('passive_'));
    });
  }

  hasPassiveSynergy(weaponId) {
    if (!weaponId) return false;
    return this.activeSynergies.some(s => {
      if (s.type !== 'passive_fusion' && !s.id.includes('passive_')) return false;
      const parts = s.id.split('+');
      return parts[0] === weaponId;
    });
  }

  getWeaponSynergyFor(weaponId) {
    if (!weaponId) return null;
    return this.activeSynergies.find(s => {
      if (s.type !== 'weapon_fusion' && s.id.includes('passive_')) return false;
      const parts = s.id.split('+');
      return parts.includes(weaponId) && !parts.some(p => p.startsWith('passive_'));
    }) || null;
  }

  getPassiveSynergyFor(weaponId) {
    if (!weaponId) return null;
    return this.activeSynergies.find(s => {
      if (s.type !== 'passive_fusion' && !s.id.includes('passive_')) return false;
      const parts = s.id.split('+');
      return parts[0] === weaponId;
    }) || null;
  }

  getWeaponSynergyCount(weaponId) {
    let count = 0;
    if (this.hasWeaponSynergy(weaponId)) count++;
    if (this.hasPassiveSynergy(weaponId)) count++;
    return count;
  }

  equipWeapon(weaponType, forceSlot = false) {
    // Check if already equipped -> upgrade
    const existing = this.equippedWeapons.find(w => w.id === weaponType);
    if (existing) {
      existing.upgrade();
      this.checkSynergies();
      return existing;
    }

    if (!forceSlot && this.equippedWeapons.length >= CONFIG.TURRET.MAX_WEAPONS) {
      console.warn('Max weapon slots reached (3)');
      return null;
    }

    let weaponInstance = null;
    switch (weaponType) {
      case WEAPON_TYPES.KINETIC:
        weaponInstance = new KineticGun(this.engine, this);
        break;
      case WEAPON_TYPES.MISSILE:
        weaponInstance = new HomingMissile(this.engine, this);
        break;
      case WEAPON_TYPES.BOMB:
        weaponInstance = new PlasmaBomb(this.engine, this);
        break;
      case WEAPON_TYPES.LASER:
        weaponInstance = new PiercingLaser(this.engine, this);
        break;
      case WEAPON_TYPES.FLAME:
        weaponInstance = new Flamethrower(this.engine, this);
        break;
      case WEAPON_TYPES.SAWBLADE:
        weaponInstance = new PlasmaSawblade(this.engine, this);
        break;
      case WEAPON_TYPES.CRYO:
        weaponInstance = new CryoSpikes(this.engine, this);
        break;
      case WEAPON_TYPES.SWARM:
        weaponInstance = new NeedlerSwarm(this.engine, this);
        break;
      case WEAPON_TYPES.TESLA:
        weaponInstance = new TeslaPylon(this.engine, this);
        break;
      case WEAPON_TYPES.VOID_RAILGUN:
        weaponInstance = new VoidRailgun(this.engine, this);
        break;
    }

    if (weaponInstance) {
      this.equippedWeapons.push(weaponInstance);
      this.assignMountOffsets();
      this.checkSynergies();
    }
    return weaponInstance;
  }

  assignMountOffsets() {
    for (let i = 0; i < this.equippedWeapons.length; i++) {
      const w = this.equippedWeapons[i];
      if (i === 0) {
        w.mountOffsetX = 0;
        w.mountOffsetY = 0;
      } else if (i === 1) {
        w.mountOffsetX = -18;
        w.mountOffsetY = -18;
      } else if (i === 2) {
        w.mountOffsetX = -18;
        w.mountOffsetY = 18;
      } else {
        const extraCount = Math.max(1, this.equippedWeapons.length - 3);
        const a = ((i - 3) * Math.PI * 2) / extraCount;
        w.mountOffsetX = Math.round(Math.cos(a) * 26);
        w.mountOffsetY = Math.round(Math.sin(a) * 26);
      }
    }
  }

  checkSynergies() {
    // Synergies are now chosen by player via UpgradeModal!
  }

  takeDamage(amount) {
    if (this.engine.sceneManager.currentScene?.godMode) return;
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.currentHp <= 0) {
      this.engine.sceneManager.currentScene?.onGameOver();
    }
  }

  heal(amount) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  update(dt, enemies, manualTarget) {
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      this.render();
      return;
    }

    // Auto-aim and auto-fire for all equipped weapons (including basic Kinetic Gun)
    for (const weapon of this.equippedWeapons) {
      const mountX = this.x + (weapon.mountOffsetX || 0);
      const mountY = this.y + (weapon.mountOffsetY || 0);

      // Find closest living enemy to this specific weapon mount
      let closestEnemy = null;
      let minDist = Infinity;
      if (enemies) {
        for (const e of enemies) {
          if (!e.isAlive) continue;
          const d = Math.hypot(e.x - mountX, e.y - mountY);
          if (d < minDist) {
            minDist = d;
            closestEnemy = e;
          }
        }
      }

      // Prioritize manual target (clicked/tapped by player) if alive, else closest enemy
      const targetToAim = (manualTarget && manualTarget.isAlive) ? manualTarget : closestEnemy;

      // Rotate weapon independently towards target
      if (weapon.id === WEAPON_TYPES.LASER) {
        if (weapon.tier === 5) {
          // Handled by PiercingLaser internal accelerating spin state machine
        } else {
          // Sweeping continuous laser orbit
          weapon.barrelAngle += dt * 1.8;
          weapon.rotationAngle = weapon.barrelAngle;
        }
      } else if (weapon.id === WEAPON_TYPES.FLAME) {
        if (weapon.tier === 5) {
          weapon.barrelAngle += dt * 4.0;
        } else if (targetToAim && minDist <= weapon.range + 90) {
          const enemyAngle = Math.atan2(targetToAim.y - mountY, targetToAim.x - mountX);
          let sDiff = enemyAngle - weapon.barrelAngle;
          while (sDiff < -Math.PI) sDiff += Math.PI * 2;
          while (sDiff > Math.PI) sDiff -= Math.PI * 2;
          weapon.barrelAngle += sDiff * Math.min(1, dt * 18);
        } else {
          // Sweeping flame cone
          weapon.barrelAngle += dt * 2.2;
        }
      } else {
        // Projectile weapons (Kinetic, Cryo, Missile, Bomb, Swarm, Void Railgun, Tesla, Sawblade)
        if (targetToAim) {
          const enemyAngle = Math.atan2(targetToAim.y - mountY, targetToAim.x - mountX);
          let sDiff = enemyAngle - weapon.barrelAngle;
          while (sDiff < -Math.PI) sDiff += Math.PI * 2;
          while (sDiff > Math.PI) sDiff -= Math.PI * 2;
          weapon.barrelAngle += sDiff * Math.min(1, dt * 22);
        } else {
          weapon.barrelAngle += dt * 1.4;
        }
      }

      // Sync central weapon angle with mainGunAngle for compatibility
      if (weapon.mountOffsetX === 0 && weapon.mountOffsetY === 0) {
        this.mainGunAngle = weapon.barrelAngle;
        this.rotation = weapon.barrelAngle;
      }

      // Auto-fire on weapon cooldown
      weapon.update(dt, enemies, targetToAim);
    }

    this.render();
  }

  render() {
    this.graphics.clear();

    // 1. Turret Base Platform (Hexagonal fortress)
    const sides = 6;
    const basePts = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      basePts.push({ x: this.x + Math.cos(a) * this.radius, y: this.y + Math.sin(a) * this.radius });
    }
    this.graphics.poly(basePts);
    this.graphics.fill({ color: 0x0b132b });
    this.graphics.stroke({ width: 3, color: 0x00f0ff });

    // Inner Armor Plate
    const innerPts = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      innerPts.push({ x: this.x + Math.cos(a) * (this.radius * 0.65), y: this.y + Math.sin(a) * (this.radius * 0.65) });
    }
    this.graphics.poly(innerPts);
    this.graphics.fill({ color: 0x1c2541 });
    this.graphics.stroke({ width: 1.5, color: 0x3a506b });

    // 2. Render Wing Weapon Mounts & Barrels (Rotated independently)
    const wingWeapons = this.equippedWeapons.filter(w => w.mountOffsetX !== 0 || w.mountOffsetY !== 0);
    for (const sec of wingWeapons) {
      const mx = this.x + sec.mountOffsetX;
      const my = this.y + sec.mountOffsetY;

      // Swivel mount socket
      this.graphics.circle(mx, my, 11);
      this.graphics.fill({ color: 0x0f172a });
      this.graphics.stroke({ width: 2, color: 0x475569 });

      // Render distinct barrel based on weapon type
      this.renderSecondaryBarrel(sec, mx, my, sec.barrelAngle);
    }

    // 3. Render Center Weapon (Mount offset (0, 0))
    const centerWeapon = this.equippedWeapons.find(w => w.mountOffsetX === 0 && w.mountOffsetY === 0);
    if (centerWeapon) {
      this.renderSecondaryBarrel(centerWeapon, this.x, this.y, centerWeapon.barrelAngle);
    }

    // 4. Central Glowing Power Core
    this.graphics.circle(this.x, this.y, 13);
    this.graphics.fill({ color: 0x00f0ff });
    this.graphics.stroke({ width: 2.5, color: 0xffffff });
    this.graphics.circle(this.x, this.y, 6);
    this.graphics.fill({ color: 0xffffff });

    // 5. Frost Overlay when frozen by Cryo Boss
    if (this.freezeTimer > 0) {
      const spikes = 8;
      for (let i = 0; i < spikes; i++) {
        const a = (i / spikes) * Math.PI * 2;
        const r1 = this.radius + 4;
        const r2 = this.radius + 16 + (i % 2 === 0 ? 8 : 2);
        this.graphics.moveTo(this.x + Math.cos(a - 0.22) * r1, this.y + Math.sin(a - 0.22) * r1);
        this.graphics.lineTo(this.x + Math.cos(a) * r2, this.y + Math.sin(a) * r2);
        this.graphics.lineTo(this.x + Math.cos(a + 0.22) * r1, this.y + Math.sin(a + 0.22) * r1);
        this.graphics.closePath();
        this.graphics.fill({ color: 0x00f0ff, alpha: 0.65 });
        this.graphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.95 });
      }
      this.graphics.circle(this.x, this.y, this.radius + 6);
      this.graphics.stroke({ width: 3.5, color: 0x38bdf8, alpha: 0.85 });
    }
  }

  renderMainGun(tier) {
    this.renderKineticBarrel({ tier: tier || 1 }, this.x, this.y, this.mainGunAngle);
  }

  renderKineticBarrel(weapon, mx, my, angle) {
    const tier = weapon?.tier || 1;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perpX = -sinA;
    const perpY = cosA;

    if (tier === 5) {
      // ★ TIER 5: CRIMSON OMEGA RAILGUN
      const barrelLength = 40;
      const halfW = 7;
      const p1 = { x: mx + perpX * halfW + cosA * 8, y: my + perpY * halfW + sinA * 8 };
      const p2 = { x: mx - perpX * halfW + cosA * 8, y: my - perpY * halfW + sinA * 8 };
      const p3 = { x: mx - perpX * (halfW - 1) + cosA * (barrelLength + 8), y: my - perpY * (halfW - 1) + sinA * (barrelLength + 8) };
      const p4 = { x: mx + perpX * (halfW - 1) + cosA * (barrelLength + 8), y: my + perpY * (halfW - 1) + sinA * (barrelLength + 8) };
      this.graphics.poly([p1, p2, p3, p4]);
      this.graphics.fill({ color: 0x22050e });
      this.graphics.stroke({ width: 2.5, color: 0xff0044 });

      for (let c = 1; c <= 3; c++) {
        const cDist = 12 + c * 8;
        const cx = mx + cosA * cDist;
        const cy = my + sinA * cDist;
        this.graphics.moveTo(cx + perpX * (halfW + 2), cy + perpY * (halfW + 2));
        this.graphics.lineTo(cx - perpX * (halfW + 2), cy - perpY * (halfW + 2));
        this.graphics.stroke({ width: 4, color: 0xff0055 });
      }

      this.graphics.moveTo(mx + cosA * 10, my + sinA * 10);
      this.graphics.lineTo(mx + cosA * (barrelLength + 10), my + sinA * (barrelLength + 10));
      this.graphics.stroke({ width: 3, color: 0xffffff });
    } else if (tier >= 4) {
      // Tier 4: Gatling Overdrive (Quad-barrel assembly)
      for (let b = -1.5; b <= 1.5; b += 1.0) {
        const offX = perpX * (b * 3.5);
        const offY = perpY * (b * 3.5);
        this.graphics.moveTo(mx + offX + cosA * 8, my + offY + sinA * 8);
        this.graphics.lineTo(mx + offX + cosA * 32, my + offY + sinA * 32);
        this.graphics.stroke({ width: 2.5, color: 0x00f0ff });
      }
    } else if (tier >= 2) {
      // Tier 2 & 3: Twin Parallel Barrels
      const spacing = 5;
      [-spacing, spacing].forEach(offset => {
        const offX = perpX * offset;
        const offY = perpY * offset;
        this.graphics.moveTo(mx + offX + cosA * 8, my + offY + sinA * 8);
        this.graphics.lineTo(mx + offX + cosA * 30, my + offY + sinA * 30);
        this.graphics.stroke({ width: 4, color: 0x00d4ff });
        this.graphics.stroke({ width: 1.5, color: 0xffffff });
      });
    } else {
      // Tier 1: Single Kinetic Cannon
      this.graphics.moveTo(mx + cosA * 8, my + sinA * 8);
      this.graphics.lineTo(mx + cosA * 30, my + sinA * 30);
      this.graphics.stroke({ width: 6, color: 0x00d4ff });
      this.graphics.stroke({ width: 2, color: 0xffffff });
    }
  }

  renderSecondaryBarrel(weapon, mx, my, angle) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perpX = -sinA;
    const perpY = cosA;

    switch (weapon.id) {
      case WEAPON_TYPES.KINETIC: {
        this.renderKineticBarrel(weapon, mx, my, angle);
        break;
      }
      case WEAPON_TYPES.MISSILE: {
        // Rocket Pod Launcher (Angular honeycomb box)
        const isT5 = weapon.tier === 5;
        const boxLength = 20;
        const boxWidth = 14;
        const podColor = isT5 ? 0xd946ef : 0xff6600;

        // Pod Body
        const p1 = { x: mx + perpX * (boxWidth / 2) + cosA * 2, y: my + perpY * (boxWidth / 2) + sinA * 2 };
        const p2 = { x: mx - perpX * (boxWidth / 2) + cosA * 2, y: my - perpY * (boxWidth / 2) + sinA * 2 };
        const p3 = { x: mx - perpX * (boxWidth / 2) + cosA * (boxLength + 2), y: my - perpY * (boxWidth / 2) + sinA * (boxLength + 2) };
        const p4 = { x: mx + perpX * (boxWidth / 2) + cosA * (boxLength + 2), y: my + perpY * (boxWidth / 2) + sinA * (boxLength + 2) };
        this.graphics.poly([p1, p2, p3, p4]);
        this.graphics.fill({ color: 0x1e293b });
        this.graphics.stroke({ width: 2, color: podColor });

        // Rocket tube openings
        const tubeCount = isT5 ? 4 : 2;
        for (let t = 0; t < tubeCount; t++) {
          const tOff = (t - (tubeCount - 1) / 2) * (boxWidth / (tubeCount + 0.8));
          const tx = mx + perpX * tOff + cosA * (boxLength + 1);
          const ty = my + perpY * tOff + sinA * (boxLength + 1);
          this.graphics.circle(tx, ty, 2.5);
          this.graphics.fill({ color: isT5 ? 0xff00dd : 0xffaa00 });
        }
        break;
      }

      case WEAPON_TYPES.BOMB: {
        // Heavy Bell-mouthed Plasma Mortar
        const isT5 = weapon.tier === 5;
        const mColor = isT5 ? 0xff7700 : 0xaa00ff;

        // Flared Mortar Barrel
        const p1 = { x: mx + perpX * 5 + cosA * 4, y: my + perpY * 5 + sinA * 4 };
        const p2 = { x: mx - perpX * 5 + cosA * 4, y: my - perpY * 5 + sinA * 4 };
        const p3 = { x: mx - perpX * 9 + cosA * 24, y: my - perpY * 9 + sinA * 24 };
        const p4 = { x: mx + perpX * 9 + cosA * 24, y: my + perpY * 9 + sinA * 24 };
        this.graphics.poly([p1, p2, p3, p4]);
        this.graphics.fill({ color: 0x2e1065 });
        this.graphics.stroke({ width: 2.5, color: mColor });

        // Glowing Plasma Charge Chamber
        this.graphics.circle(mx + cosA * 12, my + sinA * 12, 4);
        this.graphics.fill({ color: isT5 ? 0xffbb00 : 0xd946ef });
        break;
      }

      case WEAPON_TYPES.LASER: {
        // Optical Lens Collimator: Dynamically shows 1, 2, 3, or 4 distinct directional emitters!
        const isT5 = weapon.tier === 5;
        const lColor = isT5 ? 0xff0044 : 0x00ffcc;
        const bCount = isT5 ? 4 : (weapon.tier >= 3 ? 3 : (weapon.tier === 2 ? 2 : 1));

        // Angles matching the multi-directional firing directions
        const emitterOffsets = bCount === 4 ? [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
          : (bCount === 3 ? [-0.65, 0, 0.65]
          : (bCount === 2 ? [-0.50, 0.50]
          : [0]));

        for (const eOff of emitterOffsets) {
          const eAngle = angle + eOff;
          const eCos = Math.cos(eAngle);
          const eSin = Math.sin(eAngle);
          const ePerpX = -eSin;
          const ePerpY = eCos;

          // Twin focusing prongs
          [-3.5, 3.5].forEach(offset => {
            const px = mx + ePerpX * offset;
            const py = my + ePerpY * offset;
            this.graphics.moveTo(px + eCos * 2, py + eSin * 2);
            this.graphics.lineTo(px + eCos * 20, py + eSin * 20);
            this.graphics.stroke({ width: 1.8, color: 0x475569 });
          });

          // Energy Lens Core
          this.graphics.circle(mx + eCos * 13, my + eSin * 13, 3.5);
          this.graphics.fill({ color: lColor });
          this.graphics.stroke({ width: 1, color: 0xffffff });
        }
        break;
      }

      case WEAPON_TYPES.FLAME: {
        // Industrial Twin-Nozzle Flamethrower
        const isT5 = weapon.tier === 5;
        const isBlue = weapon.tier >= 3 && !isT5;
        const flameColor = isT5 ? 0xff2200 : isBlue ? 0x00f0ff : 0xff6600;

        // Dual nozzle tubes
        [-3.5, 3.5].forEach(offset => {
          const px = mx + perpX * offset;
          const py = my + perpY * offset;
          this.graphics.moveTo(px + cosA * 2, py + sinA * 2);
          this.graphics.lineTo(px + cosA * 20, py + sinA * 20);
          this.graphics.stroke({ width: 3, color: 0x334155 });
          this.graphics.stroke({ width: 1, color: flameColor });
        });

        // Pilot Torch Flame Tip
        const tipX = mx + cosA * 23;
        const tipY = my + sinA * 23;
        this.graphics.circle(tipX, tipY, 2.5);
        this.graphics.fill({ color: isBlue ? 0x00e5ff : 0xffea00 });
        break;
      }

      case WEAPON_TYPES.SAWBLADE: {
        // Mini Spinning Sawblade Mount
        this.graphics.circle(mx, my, 8);
        this.graphics.fill({ color: 0x0f172a });
        this.graphics.stroke({ width: 2, color: 0x00f0ff });
        this.graphics.circle(mx + cosA * 10, my + sinA * 10, 4);
        this.graphics.fill({ color: 0x00f0ff });
        break;
      }

      case WEAPON_TYPES.CRYO: {
        // Crystalline Ice Prongs
        [-4, 4].forEach(offset => {
          const px = mx + perpX * offset;
          const py = my + perpY * offset;
          this.graphics.moveTo(px, py);
          this.graphics.lineTo(px + cosA * 18, py + sinA * 18);
          this.graphics.stroke({ width: 2, color: 0xa5f3fc });
        });
        this.graphics.circle(mx + cosA * 12, my + sinA * 12, 3);
        this.graphics.fill({ color: 0x06b6d4 });
        break;
      }

      case WEAPON_TYPES.SWARM: {
        // Needler Crystal Pod
        this.graphics.roundRect(mx - 5, my - 5, 10, 10, 2);
        this.graphics.fill({ color: 0x831843 });
        this.graphics.stroke({ width: 1.5, color: 0xec4899 });
        this.graphics.circle(mx + cosA * 8, my + sinA * 8, 3);
        this.graphics.fill({ color: 0xf472b6 });
        break;
      }

      case WEAPON_TYPES.TESLA: {
        // High-Voltage Tesla Rod
        this.graphics.moveTo(mx, my);
        this.graphics.lineTo(mx + cosA * 20, my + sinA * 20);
        this.graphics.stroke({ width: 3, color: 0x475569 });
        this.graphics.circle(mx + cosA * 20, my + sinA * 20, 5);
        this.graphics.fill({ color: 0xffea00 });
        this.graphics.stroke({ width: 1.5, color: 0xffffff });
        break;
      }

      case WEAPON_TYPES.VOID_RAILGUN: {
        // Singularity Void Rail
        this.graphics.moveTo(mx + cosA * 2, my + sinA * 2);
        this.graphics.lineTo(mx + cosA * 26, my + sinA * 26);
        this.graphics.stroke({ width: 5, color: 0x3b0764 });
        this.graphics.stroke({ width: 2, color: 0x9333ea });
        this.graphics.circle(mx + cosA * 24, my + sinA * 24, 3.5);
        this.graphics.fill({ color: 0xffffff });
        break;
      }
    }
  }

  destroy() {
    this.equippedWeapons.forEach(w => {
      if (typeof w.destroy === 'function') w.destroy();
    });
    this.equippedWeapons = [];
    this.graphics.destroy();
  }
}
