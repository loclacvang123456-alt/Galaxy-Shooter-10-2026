import { Graphics } from 'pixi.js';
import { WeaponBase } from './WeaponBase.js';
import { WEAPON_TYPES } from './WeaponRegistry.js';
import { audio } from '../audio/AudioManager.js';

export class PiercingLaser extends WeaponBase {
  constructor(engine, turret) {
    super(engine, turret, WEAPON_TYPES.LASER);
    this.baseCooldown = 0.75;
    this.damage = 45;
    this.beamWidth = 5;
    this.beamRange = 750;
    this.beamCount = 1;

    this.laserGraphics = new Graphics();
    this.engine.vfxLayer.addChild(this.laserGraphics);

    // Dynamic rotation angle
    this.rotationAngle = 0;
    this.angularSpeed = 0;

    // Firing state machine
    // For Tier 1-4: Normal fire with active duration
    // For Tier 5: 'charging' -> 'firing' -> 'cooldown'
    this.isFiring = false;
    this.fireTimer = 0;
    this.fireDuration = 0.38;
    this.currentFireDuration = 0.38;
    this.sweepStartAngle = 0;
    this.sweepDir = 1;
    this.sweepArc = 0.75;
    this.beamStartAngles = [];
    this.currentBeamAngles = [];

    // Tier 5 Specific Cycle States: 'idle' | 'charging' | 'firing'
    this.tier5State = 'idle';
    this.stateTimer = 0;
    this.chargeDuration = 1.2; // Thời gian "rặn" tụ năng lượng
    this.firingDuration = 3.6; // Thời gian bắn xoay tăng tốc
    this.cooldownDuration = 0.8; // Thời gian tắt trước khi rặn lại
  }

  applyTierStats() {
    switch (this.tier) {
      case 2:
        // Tier 2: TWIN BEAMS - Bắn 2 tia laser về 2 hướng khác nhau hoặc tách rộng ra
        this.beamCount = 2;
        this.beamWidth = 8;
        this.damage = 80;
        this.fireDuration = 0.40;
        break;
      case 3:
        // Tier 3: TRI-BEAM ARRAY - Bắn 3 tia tỏa ra 3 hướng khác nhau
        this.beamCount = 3;
        this.beamWidth = 10;
        this.damage = 115;
        this.fireDuration = 0.42;
        break;
      case 4:
        this.beamCount = 3;
        this.beamWidth = 16;
        this.damage = 175;
        this.baseCooldown = 0.60;
        this.fireDuration = 0.45;
        break;
      case 5:
        // TIER 5 EVOLUTION: DOOMSDAY CROSS LASER (Gồng -> Xoay tăng tốc -> Tắt -> Lặp lại)
        this.beamCount = 4;
        this.beamWidth = 24;
        this.damage = 320;
        this.tier5State = 'charging';
        this.stateTimer = this.chargeDuration;
        this.angularSpeed = 1.5;
        break;
    }
  }

  getMainBeamOffsets() {
    if (this.tier === 5) {
      return [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    }
    if (this.beamCount === 1) return [0];
    if (this.beamCount === 2) return [-0.55, 0.55]; // Tách rộng 2 hướng (~63 độ)
    if (this.beamCount === 3) return [-0.72, 0, 0.72]; // Tỏa 3 hướng (~82 độ)
    if (this.beamCount >= 4) return [-1.0, -0.33, 0.33, 1.0];
    return [0];
  }

  getOrigin() {
    const isTier5 = this.tier === 5;
    return {
      x: this.turret.x + (isTier5 ? 0 : this.mountOffsetX),
      y: this.turret.y + (isTier5 ? 0 : this.mountOffsetY)
    };
  }

  getClosestEnemy(enemies) {
    if (!enemies) return null;
    let closest = null;
    let minDist = Infinity;
    const origin = this.getOrigin();
    for (const e of enemies) {
      if (!e.isAlive) continue;
      const d = Math.hypot(e.x - origin.x, e.y - origin.y);
      if (d < minDist) {
        minDist = d;
        closest = e;
      }
    }
    return closest;
  }

  // Tính toán góc bắn riêng biệt cho từng tia:
  // Nếu có địch ở các hướng khác nhau -> Khóa từng tia vào các hướng địch khác nhau!
  // Nếu địch cùng 1 chỗ / 1 con quái -> Tách các tia ra các góc rộng rõ rệt, không bắn trùng nhau!
  calculateInitialBeamAngles(enemies) {
    const origin = this.getOrigin();
    const closest = this.getClosestEnemy(enemies);
    const primaryAngle = closest
      ? Math.atan2(closest.y - origin.y, closest.x - origin.x)
      : this.barrelAngle;

    if (this.beamCount <= 1) {
      return [primaryAngle];
    }

    const livingEnemies = (enemies || []).filter(e => e.isAlive);
    const minSeparation = 0.75; // ~43 độ cách biệt tối thiểu giữa các hướng
    const targetAngles = [primaryAngle];

    if (livingEnemies.length > 1) {
      const sorted = livingEnemies.slice().sort((a, b) => {
        const da = Math.hypot(a.x - origin.x, a.y - origin.y);
        const db = Math.hypot(b.x - origin.x, b.y - origin.y);
        return da - db;
      });

      for (const e of sorted) {
        if (targetAngles.length >= this.beamCount) break;
        const eAngle = Math.atan2(e.y - origin.y, e.x - origin.x);

        let farEnough = true;
        for (const chosen of targetAngles) {
          let diff = Math.abs(eAngle - chosen);
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
          if (diff < minSeparation) {
            farEnough = false;
            break;
          }
        }

        if (farEnough) {
          targetAngles.push(eAngle);
        }
      }
    }

    // Nếu không có đủ địch ở các hướng khác nhau (hoặc chỉ có 1 đám quái/1 boss):
    // Tách các tia ra 2 hoặc 3 hướng hoàn toàn tách biệt rõ rệt (không bắn cùng chỗ!)
    if (targetAngles.length < this.beamCount) {
      if (this.beamCount === 2) {
        return [primaryAngle - 0.55, primaryAngle + 0.55]; // Tách 2 hướng chéo nhau 63 độ
      } else if (this.beamCount === 3) {
        return [primaryAngle - 0.72, primaryAngle, primaryAngle + 0.72]; // Tỏa 3 hướng 82 độ
      } else {
        return [primaryAngle - 1.0, primaryAngle - 0.33, primaryAngle + 0.33, primaryAngle + 1.0];
      }
    }

    return targetAngles;
  }

  update(dt, enemies, target) {
    if (this.tier === 5) {
      this.updateTier5Cycle(dt, enemies);
    } else {
      this.updateNormalTiers(dt, enemies, target);
    }

    this.render();
  }

  // TIER 1 - 4: Bắn các hướng khác nhau và lia quét
  updateNormalTiers(dt, enemies, target) {
    this.cooldown -= dt;
    if (this.cooldown <= 0 && !this.isFiring) {
      this.startNormalFire(enemies);
    }

    if (this.isFiring) {
      this.fireTimer -= dt;

      // Mỗi tia quét lia từ hướng xuất phát theo sweepDir
      const progress = 1 - Math.max(0, this.fireTimer / this.currentFireDuration);
      const sweepOffset = this.sweepDir * this.sweepArc * progress;

      this.currentBeamAngles = this.beamStartAngles.map(a => a + sweepOffset);
      this.rotationAngle = this.currentBeamAngles[0];
      this.barrelAngle = this.rotationAngle;

      this.dealDamage(dt, enemies);

      if (this.fireTimer <= 0) {
        this.isFiring = false;
        this.cooldown = this.baseCooldown * this.cooldownMultiplier;
      }
    }
  }

  startNormalFire(enemies) {
    this.isFiring = true;
    this.currentFireDuration = this.fireDuration;
    this.fireTimer = this.currentFireDuration;

    // Tính toán góc bắn riêng biệt cho từng tia (Mỗi tia 1 hướng khác nhau hoặc tách rộng ra)
    this.beamStartAngles = this.calculateInitialBeamAngles(enemies);
    this.sweepDir = Math.random() < 0.5 ? 1 : -1;
    this.sweepArc = 0.75; // ~43 độ lia

    this.currentBeamAngles = this.beamStartAngles.slice();
    this.rotationAngle = this.beamStartAngles[0] || this.barrelAngle;
    this.barrelAngle = this.rotationAngle;

    audio.playLaser();
    this.engine.sceneManager.currentScene?.tracker?.recordShot(this.id);
  }

  // TIER 5: Charging ("Rặn") -> Accelerating Spin Firing -> Cooldown Cycle
  updateTier5Cycle(dt, enemies) {
    this.stateTimer -= dt;

    if (this.tier5State === 'charging') {
      // 1. GỒNG / RẶN NĂNG LƯỢNG
      // Tụ các hạt năng lượng về tâm trụ
      const scene = this.engine.sceneManager.currentScene;
      if (scene?.particles && Math.random() < 0.6) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = 80 + Math.random() * 60;
        scene.particles.emit({
          x: this.turret.x + Math.cos(pAngle) * pDist,
          y: this.turret.y + Math.sin(pAngle) * pDist,
          count: 2,
          color: 0xff0055,
          speed: -140, // bay ngược về tâm
          life: 0.25,
          size: 4
        });
      }

      if (this.stateTimer <= 0) {
        // Chuyển sang BẮN & XOAY TĂNG TỐC
        this.tier5State = 'firing';
        this.stateTimer = this.firingDuration * this.durationMultiplier;
        this.angularSpeed = 1.5; // Tốc độ xoay khởi điểm (chậm)
        audio.playLaser();
        audio.playExplosion(1.0);
        this.engine.sceneManager.currentScene?.tracker?.recordShot(this.id);
      }
    } else if (this.tier5State === 'firing') {
      // 2. BẮN & XOAY CÀNG NGÀY CÀNG NHANH
      // Tăng tốc độ góc (Angular acceleration)
      this.angularSpeed += dt * 4.8; // Tăng dần từ 1.5 lên ~18 rad/s
      this.rotationAngle += this.angularSpeed * dt;

      // Quét sát thương liên tục
      this.dealDamage(dt, enemies);

      if (this.stateTimer <= 0) {
        // 3. TẮT TIA
        this.tier5State = 'cooldown';
        this.stateTimer = this.cooldownDuration;
      }
    } else if (this.tier5State === 'cooldown') {
      // Chờ tắt xong thì lặp lại chu kỳ Rặn năng lượng
      if (this.stateTimer <= 0) {
        this.tier5State = 'charging';
        this.stateTimer = this.chargeDuration;
      }
    }
  }

  dealDamage(dt, enemies) {
    if (!enemies) return;

    const baseAngle = this.rotationAngle;
    const isTier5 = this.tier === 5;
    const originX = this.turret.x + (isTier5 ? 0 : this.mountOffsetX);
    const originY = this.turret.y + (isTier5 ? 0 : this.mountOffsetY);
    const currentBeamWidth = this.beamWidth * this.specialMultiplier;
    const effDamage = this.damage * this.damageMultiplier;
    const tickDamage = isTier5 ? (effDamage * dt * 4.5) : (effDamage * dt * 3.0);

    const hasLightningSyn = this.turret.hasSynergy('laser+passive_lightning');
    const hasFlameSyn = this.turret.hasSynergy('laser+flame');
    const hasBombSyn = this.turret.hasSynergy('bomb+laser');
    const hasBlackHoleSyn = this.turret.hasSynergy('laser+passive_black_hole');

    const mainAngles = isTier5
      ? this.getMainBeamOffsets().map(off => baseAngle + off)
      : (this.currentBeamAngles && this.currentBeamAngles.length > 0 ? this.currentBeamAngles : [baseAngle]);

    const activeBeams = [];
    for (const angle of mainAngles) {
      activeBeams.push({ angle, isSub: false, wMult: 1.0, dMult: 1.0 });

      // Extra auxiliary sub-beams for EACH main beam
      for (let s = 1; s <= this.extraSubBeams; s++) {
        const side = (s % 2 === 1) ? 1 : -1;
        const subOffset = side * (0.16 * Math.ceil(s / 2));
        activeBeams.push({ angle: angle + subOffset, isSub: true, wMult: 0.65, dMult: 0.55 });
      }
    }

    for (const b of activeBeams) {
      const cosA = Math.cos(b.angle);
      const sinA = Math.sin(b.angle);
      const endX = originX + cosA * (b.isSub ? this.beamRange * 0.9 : this.beamRange);
      const endY = originY + sinA * (b.isSub ? this.beamRange * 0.9 : this.beamRange);
      const beamW = currentBeamWidth * b.wMult;
      const beamDmg = tickDamage * b.dMult;

      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        if (this.pointLineDistance(enemy.x, enemy.y, originX, originY, endX, endY) <= enemy.size + beamW) {
          enemy.takeDamage(beamDmg, 'laser');

          // Synergy: Flame -> Burn DoT
          if (hasFlameSyn) {
            enemy.applyBurn(effDamage * 0.7, 2.5);
          }

          // Synergy: Black Hole -> Gravity Drag towards beam axis
          if (hasBlackHoleSyn) {
            const dx = endX - originX;
            const dy = endY - originY;
            let t = Math.max(0, Math.min(1, ((enemy.x - originX) * dx + (enemy.y - originY) * dy) / (dx * dx + dy * dy)));
            const px = originX + t * dx;
            const py = originY + t * dy;
            enemy.x += (px - enemy.x) * dt * 3.0;
            enemy.y += (py - enemy.y) * dt * 3.0;
          }

          // Synergy: Laser + Lightning (Tesla Doomsday Storm)
          if (hasLightningSyn && Math.random() < 0.22) {
            let zappedCount = 0;
            for (const other of enemies) {
              if (other === enemy || !other.isAlive || zappedCount >= 2) continue;
              const oDist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
              if (oDist <= 165) {
                other.takeDamage(60, 'lightning');
                this.engine.sceneManager.currentScene?.particles?.emit({
                  x: other.x,
                  y: other.y,
                  count: 4,
                  color: 0xffea00,
                  speed: 110,
                  life: 0.18
                });
                zappedCount++;
              }
            }
          }

          // Synergy: Laser + Bomb (Orbital Death Ray Micro-Burst)
          if (hasBombSyn && Math.random() < 0.12) {
            this.engine.sceneManager.currentScene?.particles?.emitExplosion(enemy.x, enemy.y, 45, 0xaa00ff);
            for (const near of enemies) {
              if (near.isAlive && Math.hypot(near.x - enemy.x, near.y - enemy.y) <= 45) {
                near.takeDamage(75, 'explosion');
              }
            }
          }

          if (Math.random() < 0.25) {
            this.engine.sceneManager.currentScene?.particles?.emit({
              x: enemy.x,
              y: enemy.y,
              count: isTier5 ? 4 : 2,
              color: isTier5 ? 0xff0044 : (hasLightningSyn ? 0xffea00 : 0x00ffcc),
              speed: 90,
              life: 0.15
            });
          }
        }
      }
    }
  }

  pointLineDistance(px, py, x1, y1, x2, y2) {
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

  render() {
    this.laserGraphics.clear();

    if (this.tier === 5) {
      this.renderTier5();
    } else if (this.isFiring) {
      this.renderNormal();
    }
  }

  renderTier5() {
    if (this.tier5State === 'charging') {
      // Hiệu ứng "RẶN" NĂNG LƯỢNG: 4 tia dẫn hướng nhấp nháy mảnh + tụ điện
      const chargeProgress = 1 - (this.stateTimer / this.chargeDuration);
      const pulse = 0.5 + Math.sin(chargeProgress * Math.PI * 8) * 0.5;

      // Vòng tròn năng lượng tích tụ ở trụ
      this.laserGraphics.circle(this.turret.x, this.turret.y, 45 * chargeProgress);
      this.laserGraphics.stroke({ width: 3, color: 0xff0055, alpha: 0.8 * pulse });

      // 4 tia định vị mỏng nhấp nháy
      for (let i = 0; i < 4; i++) {
        const angle = this.rotationAngle + (i * Math.PI * 2) / 4;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const endX = this.turret.x + cosA * (this.beamRange * chargeProgress);
        const endY = this.turret.y + sinA * (this.beamRange * chargeProgress);

        this.laserGraphics.moveTo(this.turret.x + cosA * 25, this.turret.y + sinA * 25);
        this.laserGraphics.lineTo(endX, endY);
        this.laserGraphics.stroke({ width: 2, color: 0xff0044, alpha: 0.4 * pulse });
      }
    } else if (this.tier5State === 'firing') {
      // Hiệu ứng BẮN 4 TIA ĐỎ RỰC XOAY CÀNG NGÀY CÀNG NHANH
      const progress = this.stateTimer / this.firingDuration;
      const alpha = Math.min(1, progress * 4);

      for (let i = 0; i < 4; i++) {
        const mainAngle = this.rotationAngle + (i * Math.PI * 2) / 4;

        // Sub-beams in Tier 5
        for (let s = 1; s <= this.extraSubBeams; s++) {
          const side = (s % 2 === 1) ? 1 : -1;
          const offset = side * (0.15 * Math.ceil(s / 2));
          const subAngle = mainAngle + offset;
          const cosS = Math.cos(subAngle);
          const sinS = Math.sin(subAngle);
          const sStartX = this.turret.x + cosS * 28;
          const sStartY = this.turret.y + sinS * 28;
          const sEndX = this.turret.x + cosS * (this.beamRange * 0.9);
          const sEndY = this.turret.y + sinS * (this.beamRange * 0.9);

          this.laserGraphics.moveTo(sStartX, sStartY);
          this.laserGraphics.lineTo(sEndX, sEndY);
          this.laserGraphics.stroke({ width: this.beamWidth * 1.4, color: 0xff0066, alpha: 0.35 * alpha });

          this.laserGraphics.moveTo(sStartX, sStartY);
          this.laserGraphics.lineTo(sEndX, sEndY);
          this.laserGraphics.stroke({ width: this.beamWidth * 0.5, color: 0xffe4e6, alpha: 0.85 * alpha });
        }

        const cosA = Math.cos(mainAngle);
        const sinA = Math.sin(mainAngle);
        const startX = this.turret.x + cosA * 28;
        const startY = this.turret.y + sinA * 28;
        const endX = this.turret.x + cosA * this.beamRange;
        const endY = this.turret.y + sinA * this.beamRange;

        // Vệt hào quang đỏ rực khổng lồ
        this.laserGraphics.moveTo(startX, startY);
        this.laserGraphics.lineTo(endX, endY);
        this.laserGraphics.stroke({ width: this.beamWidth * 2.8, color: 0xff0033, alpha: 0.45 * alpha });

        // Tia laser đỏ tươi
        this.laserGraphics.moveTo(startX, startY);
        this.laserGraphics.lineTo(endX, endY);
        this.laserGraphics.stroke({ width: this.beamWidth, color: 0xff0055, alpha: 0.85 * alpha });

        // Lõi trắng siêu nhiệt
        this.laserGraphics.moveTo(startX, startY);
        this.laserGraphics.lineTo(endX, endY);
        this.laserGraphics.stroke({ width: this.beamWidth * 0.45, color: 0xffffff, alpha: 0.95 * alpha });

        // Synergy Visual Enhancements (Lightning Coils, Solar Flares, Gravity Distortion)
        this.renderSynergyVfx(startX, startY, endX, endY, mainAngle, this.beamWidth, alpha);
      }

      // Vòng lõi siêu năng lượng ở tâm trụ
      this.laserGraphics.circle(this.turret.x, this.turret.y, 35);
      this.laserGraphics.fill({ color: 0xff0044, alpha: 0.7 * alpha });
      this.laserGraphics.circle(this.turret.x, this.turret.y, 20);
      this.laserGraphics.fill({ color: 0xffffff, alpha: 0.95 * alpha });
    }
  }

  renderNormal() {
    const alpha = Math.min(1, this.fireTimer / 0.12);
    const originX = this.turret.x + this.mountOffsetX;
    const originY = this.turret.y + this.mountOffsetY;
    const mainAngles = this.currentBeamAngles && this.currentBeamAngles.length > 0
      ? this.currentBeamAngles
      : [this.rotationAngle];

    for (const mainAngle of mainAngles) {

      // Auxiliary sub-beams for this main beam
      for (let s = 1; s <= this.extraSubBeams; s++) {
        const side = (s % 2 === 1) ? 1 : -1;
        const subOffset = side * (0.16 * Math.ceil(s / 2));
        const subAngle = mainAngle + subOffset;
        const cosS = Math.cos(subAngle);
        const sinS = Math.sin(subAngle);
        const sStartX = originX + cosS * 20;
        const sStartY = originY + sinS * 20;
        const sEndX = originX + cosS * (this.beamRange * 0.88);
        const sEndY = originY + sinS * (this.beamRange * 0.88);

        // Sub-beam glow
        this.laserGraphics.moveTo(sStartX, sStartY);
        this.laserGraphics.lineTo(sEndX, sEndY);
        this.laserGraphics.stroke({ width: this.beamWidth * 1.3, color: 0x00e5ff, alpha: 0.28 * alpha });

        // Sub-beam core
        this.laserGraphics.moveTo(sStartX, sStartY);
        this.laserGraphics.lineTo(sEndX, sEndY);
        this.laserGraphics.stroke({ width: this.beamWidth * 0.5, color: 0xe0f2fe, alpha: 0.85 * alpha });
      }

      // Main beam
      const cosA = Math.cos(mainAngle);
      const sinA = Math.sin(mainAngle);
      const startX = originX + cosA * 20;
      const startY = originY + sinA * 20;
      const endX = originX + cosA * this.beamRange;
      const endY = originY + sinA * this.beamRange;

      // Outer glow
      this.laserGraphics.moveTo(startX, startY);
      this.laserGraphics.lineTo(endX, endY);
      this.laserGraphics.stroke({ width: this.beamWidth * 2.2, color: 0x00ffcc, alpha: 0.35 * alpha });

      // Core beam
      this.laserGraphics.moveTo(startX, startY);
      this.laserGraphics.lineTo(endX, endY);
      this.laserGraphics.stroke({ width: this.beamWidth, color: 0xffffff, alpha: 0.95 * alpha });

      // Synergy Visual Enhancements (Lightning Coils, Solar Flares, Gravity Distortion)
      this.renderSynergyVfx(startX, startY, endX, endY, mainAngle, this.beamWidth, alpha);
    }
  }

  renderSynergyVfx(startX, startY, endX, endY, angle, beamWidth, alpha) {
    const hasLightning = this.turret.hasSynergy('laser+passive_lightning');
    const hasFlame = this.turret.hasSynergy('laser+flame');
    const hasBlackHole = this.turret.hasSynergy('laser+passive_black_hole');

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const normX = -sinA;
    const normY = cosA;
    const dist = Math.hypot(endX - startX, endY - startY);
    const steps = 18;
    const stepLen = dist / steps;

    // 1. LASER + LIGHTNING SYNERGY: Vibrant procedural zig-zag lightning wrapping around the beam
    if (hasLightning) {
      // Primary lightning coil
      this.laserGraphics.moveTo(startX, startY);
      for (let s = 1; s <= steps; s++) {
        const segDist = s * stepLen;
        const phase = s * 0.85 + (this.fireTimer * 30 || Date.now() * 0.015);
        const wave = Math.sin(phase) * (beamWidth * 1.8 + 8);
        const jitter = (Math.random() - 0.5) * 8;
        const px = startX + cosA * segDist + normX * (wave + jitter);
        const py = startY + sinA * segDist + normY * (wave + jitter);
        this.laserGraphics.lineTo(px, py);

        // Occasional arc fork branching outward
        if (s % 5 === 0 && Math.random() < 0.6) {
          const forkLen = 25 + Math.random() * 25;
          const forkSide = Math.random() > 0.5 ? 1 : -1;
          const fx = px + (normX * forkSide + cosA * 0.5) * forkLen;
          const fy = py + (normY * forkSide + sinA * 0.5) * forkLen;
          this.laserGraphics.stroke({ width: 2.2, color: 0xffea00, alpha: 0.9 * alpha });
          this.laserGraphics.moveTo(px, py);
          this.laserGraphics.lineTo(fx, fy);
          this.laserGraphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.85 * alpha });
          this.laserGraphics.moveTo(px, py);
        }
      }
      this.laserGraphics.stroke({ width: 2.5, color: 0xffea00, alpha: 0.95 * alpha });

      // Secondary interlaced electric discharge
      this.laserGraphics.moveTo(startX, startY);
      for (let s = 1; s <= steps; s++) {
        const segDist = s * stepLen;
        const phase = s * 0.85 + Math.PI + (this.fireTimer * 30 || Date.now() * 0.015);
        const wave = Math.sin(phase) * (beamWidth * 1.5 + 6);
        const jitter = (Math.random() - 0.5) * 6;
        const px = startX + cosA * segDist + normX * (wave + jitter);
        const py = startY + sinA * segDist + normY * (wave + jitter);
        this.laserGraphics.lineTo(px, py);
      }
      this.laserGraphics.stroke({ width: 1.5, color: 0x00f0ff, alpha: 0.85 * alpha });
    }

    // 2. LASER + FLAME SYNERGY: Roaring Solar Flare Prominence
    if (hasFlame) {
      for (let s = 1; s < steps; s += 2) {
        const segDist = s * stepLen + (Math.random() - 0.5) * 15;
        const flameOffset = (Math.random() - 0.5) * (beamWidth * 2.5 + 14);
        const fx = startX + cosA * segDist + normX * flameOffset;
        const fy = startY + sinA * segDist + normY * flameOffset;
        const fRadius = 8 + Math.random() * 10;
        this.laserGraphics.circle(fx, fy, fRadius);
        this.laserGraphics.fill({ color: Math.random() > 0.5 ? 0xff4500 : 0xffa500, alpha: 0.45 * alpha });
      }
    }

    // 3. LASER + BLACK HOLE SYNERGY: Gravitational Singularity Lensing Rings
    if (hasBlackHole) {
      for (let s = 3; s < steps; s += 4) {
        const segDist = s * stepLen;
        const cx = startX + cosA * segDist;
        const cy = startY + sinA * segDist;
        const ringR = beamWidth * 2.0 + 10;
        this.laserGraphics.circle(cx, cy, ringR);
        this.laserGraphics.stroke({ width: 2, color: 0x9d4edd, alpha: 0.7 * alpha });
        this.laserGraphics.circle(cx, cy, ringR * 0.4);
        this.laserGraphics.fill({ color: 0x1e0038, alpha: 0.6 * alpha });
      }
    }
  }

  destroy() {
    this.laserGraphics.destroy();
  }
}
