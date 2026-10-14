import { Graphics } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';

export class Bullet {
  constructor(engine) {
    this.engine = engine;
    this.graphics = new Graphics();
    this.graphics.visible = false;
    this.engine.gameWorldLayer.addChild(this.graphics);

    this.isAlive = false;
    this.type = 'normal'; // 'normal' | 'missile' | 'bomb'
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 400;
    this.damage = 10;
    this.pierce = 1;
    this.hitCount = 0;
    this.aoeRadius = 0;
    this.life = 2.0;
    this.color = 0x00f0ff;
    this.target = null;
    this.bouncesLeft = 0;
    this.splitCount = 0;
    this.trailTimer = 0;
    this.pulseAnim = 0;
    this.isTier5 = false;
    this.isInfernoCore = false;
    this.isTitanComet = false;
    this.clusterStage = 0;
    this.isSawbladeChild = false;
  }

  reset({
    type = 'normal',
    x = 0,
    y = 0,
    angle = 0,
    speed = 450,
    damage = 15,
    pierce = 1,
    aoeRadius = 0,
    life = 2.0,
    color = 0x00f0ff,
    target = null,
    bouncesLeft = 0,
    splitCount = 0,
    isTier5 = false,
    isInfernoCore = false,
    isTitanComet = false,
    clusterStage = 0,
    isSawbladeChild = false
  }) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.pierce = pierce;
    this.hitCount = 0;
    this.aoeRadius = aoeRadius;
    this.life = life;
    this.color = color;
    this.target = target;
    this.bouncesLeft = bouncesLeft;
    this.splitCount = splitCount;
    this.trailTimer = 0;
    this.pulseAnim = Math.random() * Math.PI * 2;
    this.isTier5 = isTier5;
    this.isInfernoCore = isInfernoCore;
    this.isTitanComet = isTitanComet;
    this.clusterStage = clusterStage;
    this.isSawbladeChild = isSawbladeChild;
    this.isAlive = true;
    this.graphics.visible = true;

    this.render();
  }

  render() {
    this.graphics.clear();
    this.graphics.x = this.x;
    this.graphics.y = this.y;

    if (this.type === 'normal') {
      this.graphics.rotation = Math.atan2(this.vy, this.vx);
      if (this.isTier5) {
        // TIER 5: CRIMSON OMEGA RAILGUN SLUG (Khổng lồ, đỏ rực với viền lóe sáng)
        this.graphics.roundRect(-21, -8, 42, 16, 8);
        this.graphics.stroke({ width: 5.5, color: 0xff0055, alpha: 0.55 });
        this.graphics.roundRect(-18, -6, 36, 12, 6);
        this.graphics.fill({ color: 0xff0044 });
        this.graphics.roundRect(-18, -6, 36, 12, 6);
        this.graphics.stroke({ width: 2.5, color: 0xffffff, alpha: 0.9 });
        // Glowing white core
        this.graphics.roundRect(-10, -2.5, 20, 5, 2.5);
        this.graphics.fill({ color: 0xffffff });
      } else {
        // Standard sleek energy dart with luminous neon halo
        this.graphics.roundRect(-13, -5, 26, 10, 5);
        this.graphics.stroke({ width: 3.5, color: this.color, alpha: 0.5 });
        this.graphics.roundRect(-10, -3, 20, 6, 3);
        this.graphics.fill({ color: this.color });
        this.graphics.roundRect(-10, -3, 20, 6, 3);
        this.graphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.95 });
      }
    } else if (this.type === 'missile') {
      this.graphics.rotation = Math.atan2(this.vy, this.vx);
      const scene = this.engine.sceneManager?.currentScene;
      const hasSawSynergy = scene?.turret?.hasSynergy('missile+sawblade') || this.isSawbladeChild;

      if (this.isTier5) {
        // TIER 5: FRACTAL RECURSIVE HELLFIRE MISSILE
        const stage = this.clusterStage || 0;
        const scale = stage === 2 ? 0.55 : (stage === 1 ? 0.78 : 1.0);
        const mainColor = stage === 2 ? 0xfacc15 : (stage === 1 ? 0xf43f5e : 0xd946ef);
        const strokeColor = stage === 2 ? 0xffffff : (stage === 1 ? 0xffea00 : 0x00f0ff);

        const mPts = [
          { x: 16 * scale, y: 0 },
          { x: -10 * scale, y: -7 * scale },
          { x: -6 * scale, y: 0 },
          { x: -10 * scale, y: 7 * scale }
        ];
        this.graphics.poly(mPts);
        this.graphics.fill({ color: mainColor });
        this.graphics.poly(mPts);
        this.graphics.stroke({ width: 4 * scale, color: mainColor, alpha: 0.55 });
        this.graphics.poly(mPts);
        this.graphics.stroke({ width: 2 * scale, color: strokeColor, alpha: 0.95 });

        // Thruster flame
        this.graphics.poly([
          { x: -6 * scale, y: -4 * scale },
          { x: -18 * scale, y: 0 },
          { x: -6 * scale, y: 4 * scale }
        ]);
        this.graphics.fill({ color: stage === 2 ? 0xffea00 : 0x00ffff, alpha: 0.9 });
      } else {
        // Standard Rocket with fiery neon halo
        const mPts = [
          { x: 12, y: 0 },
          { x: -8, y: -5 },
          { x: -5, y: 0 },
          { x: -8, y: 5 }
        ];
        this.graphics.poly(mPts);
        this.graphics.fill({ color: this.color || 0xff6600 });
        this.graphics.poly(mPts);
        this.graphics.stroke({ width: 4, color: 0xff4500, alpha: 0.5 });
        this.graphics.poly(mPts);
        this.graphics.stroke({ width: 1.8, color: 0xffea00, alpha: 0.95 });
      }

      // FUSION VISUAL: Rotating Razor Buzzsaw mounted on missile body
      if (hasSawSynergy) {
        const rot = (this.pulseAnim || 0) * 14;
        const sawTeeth = 6;
        const sawPts = [];
        for (let t = 0; t < sawTeeth; t++) {
          const a1 = rot + (t * Math.PI * 2) / sawTeeth;
          const a2 = a1 + (Math.PI / sawTeeth);
          sawPts.push({ x: Math.cos(a1) * 11, y: Math.sin(a1) * 11 });
          sawPts.push({ x: Math.cos(a2) * 6, y: Math.sin(a2) * 6 });
        }
        this.graphics.poly(sawPts);
        this.graphics.fill({ color: 0x00f0ff, alpha: 0.9 });
        this.graphics.poly(sawPts);
        this.graphics.stroke({ width: 1.5, color: 0xffffff });
      }
    } else if (this.type === 'bomb') {
      const pulse = 0.85 + Math.sin(this.pulseAnim * 5) * 0.15;
      if (this.isInfernoCore) {
        // FUSION: INFERNO SUPERNOVA CORE (Cầu Lửa Siêu Tân Tinh khổng lồ rực cháy xoay tròn 360°)
        const r = 20 * pulse;
        // Outer spinning fiery corona
        this.graphics.circle(0, 0, r + 12);
        this.graphics.stroke({ width: 4.5, color: 0xff3300, alpha: 0.5 });
        this.graphics.circle(0, 0, r + 10);
        this.graphics.fill({ color: 0xff2200, alpha: 0.4 });

        // 6 Spinning flame blades / corona tongues
        for (let i = 0; i < 6; i++) {
          const fAngle = this.pulseAnim * 8 + (i * Math.PI * 2) / 6;
          const fx = Math.cos(fAngle) * (r + 12);
          const fy = Math.sin(fAngle) * (r + 12);
          this.graphics.circle(fx, fy, 6);
          this.graphics.fill({ color: 0xff6600, alpha: 0.7 });
        }

        // Main core
        this.graphics.circle(0, 0, r);
        this.graphics.fill({ color: 0xff4500 });
        this.graphics.stroke({ width: 3, color: 0xffea00 });
        this.graphics.circle(0, 0, r * 0.55);
        this.graphics.fill({ color: 0xffffff });
      } else if (this.isTier5) {
        // TIER 5: SUPERNOVA HYPER BOMB (Quả cầu Mặt Trời Siêu Tân Tinh khổng lồ)
        const r = 16 * pulse;
        // Solar corona aura
        this.graphics.circle(0, 0, r + 10);
        this.graphics.stroke({ width: 4, color: 0xff3300, alpha: 0.55 });
        this.graphics.circle(0, 0, r + 8);
        this.graphics.fill({ color: 0xff3300, alpha: 0.35 });
        // Main solar orb
        this.graphics.circle(0, 0, r);
        this.graphics.fill({ color: 0xff7700 });
        this.graphics.stroke({ width: 3, color: 0xffea00 });
        // Core white heat
        this.graphics.circle(0, 0, r * 0.5);
        this.graphics.fill({ color: 0xffffff });
      } else {
        // Standard Plasma Bomb with vibrant neon purple corona
        const r = 10 * pulse;
        this.graphics.circle(0, 0, r + 6);
        this.graphics.stroke({ width: 3, color: 0xc084fc, alpha: 0.55 });
        this.graphics.circle(0, 0, r + 4);
        this.graphics.fill({ color: 0xaa00ff, alpha: 0.3 });
        this.graphics.circle(0, 0, r);
        this.graphics.fill({ color: 0x9d4edd });
        this.graphics.stroke({ width: 2, color: 0xff00ff });
        this.graphics.circle(0, 0, 4);
        this.graphics.fill({ color: 0xffffff });
      }
    } else if (this.type === 'sawblade') {
      // PLASMA SAWBLADE / BUZZSAW (Quả cầu răng cưa plasma xoay tít)
      const r = this.isTier5 ? 22 : 14;
      const teeth = this.isTier5 ? 12 : 8;
      const rot = this.pulseAnim * 15;
      const bladeColor = this.isTier5 ? 0xff0055 : (this.color || 0x00f0ff);

      // Outer Glow Aura
      this.graphics.circle(0, 0, r + 6);
      this.graphics.stroke({ width: 3.5, color: bladeColor, alpha: 0.45 });

      // Rotating Saw Teeth
      const pts = [];
      for (let i = 0; i < teeth; i++) {
        const a1 = rot + (i * Math.PI * 2) / teeth;
        const a2 = a1 + (Math.PI / teeth);
        pts.push({ x: Math.cos(a1) * (r + 5), y: Math.sin(a1) * (r + 5) });
        pts.push({ x: Math.cos(a2) * (r * 0.75), y: Math.sin(a2) * (r * 0.75) });
      }
      this.graphics.poly(pts);
      this.graphics.fill({ color: bladeColor });
      this.graphics.poly(pts);
      this.graphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.9 });

      // Inner Hub
      this.graphics.circle(0, 0, r * 0.45);
      this.graphics.fill({ color: 0x0f172a });
      this.graphics.stroke({ width: 1.5, color: 0xffffff });
      this.graphics.circle(0, 0, r * 0.2);
      this.graphics.fill({ color: 0xffffff });
    } else if (this.type === 'frost_shard') {
      // CRYO FROST SHARDS (Mũi kim băng pha lê sắc lẹm)
      this.graphics.rotation = Math.atan2(this.vy, this.vx);
      if (this.isTitanComet) {
        // TITAN GLACIAL COMET LANCE (Đại Băng Tiễn Khổng Lồ xé toạc không gian)
        const pts = [
          { x: 30, y: 0 },
          { x: -8, y: -10 },
          { x: -20, y: 0 },
          { x: -8, y: 10 }
        ];
        this.graphics.poly(pts);
        this.graphics.fill({ color: 0x38bdf8 });
        this.graphics.poly(pts);
        this.graphics.stroke({ width: 5.5, color: 0x00f0ff, alpha: 0.75 });
        this.graphics.poly(pts);
        this.graphics.stroke({ width: 2, color: 0xffffff });

        // Frost crystal wings / Blizzard trailing vanes
        this.graphics.poly([
          { x: 4, y: -6 },
          { x: -14, y: -16 },
          { x: -8, y: -4 }
        ]);
        this.graphics.fill({ color: 0xa5f3fc, alpha: 0.9 });
        this.graphics.poly([
          { x: 4, y: 6 },
          { x: -14, y: 16 },
          { x: -8, y: 4 }
        ]);
        this.graphics.fill({ color: 0xa5f3fc, alpha: 0.9 });

        // Blinding white core
        this.graphics.circle(4, 0, 4);
        this.graphics.fill({ color: 0xffffff });
      } else {
        const pts = [
          { x: 14, y: 0 },
          { x: -3, y: -5 },
          { x: -10, y: 0 },
          { x: -3, y: 5 }
        ];
        this.graphics.poly(pts);
        this.graphics.fill({ color: 0xa5f3fc, alpha: 0.95 });
        this.graphics.poly(pts);
        this.graphics.stroke({ width: 3, color: 0x06b6d4, alpha: 0.6 });
        this.graphics.poly(pts);
        this.graphics.stroke({ width: 1.2, color: 0xffffff });
      }
    } else if (this.type === 'needle') {
      // NEEDLER HOMING CRYSTAL (Pha lê nhọn phát sáng truy sát)
      this.graphics.rotation = Math.atan2(this.vy, this.vx);
      const needleColor = this.color || 0xec4899;
      const pts = [
        { x: 12, y: 0 },
        { x: -2, y: -3.5 },
        { x: -8, y: 0 },
        { x: -2, y: 3.5 }
      ];
      this.graphics.poly(pts);
      this.graphics.fill({ color: needleColor });
      this.graphics.poly(pts);
      this.graphics.stroke({ width: 2.5, color: 0xf472b6, alpha: 0.5 });
      this.graphics.circle(4, 0, 2);
      this.graphics.fill({ color: 0xffffff });
    } else if (this.type === 'void_slug') {
      // VOID PIERCER / SINGULARITY RAILGUN SLUG (Đầu đạn lỗ đen vũ trụ siêu xuyên thấu)
      this.graphics.rotation = Math.atan2(this.vy, this.vx);
      const rW = this.isTier5 ? 38 : 26;
      const rH = this.isTier5 ? 14 : 9;

      this.graphics.roundRect(-rW / 2 - 4, -rH / 2 - 4, rW + 8, rH + 8, 7);
      this.graphics.stroke({ width: 4.5, color: 0x9333ea, alpha: 0.55 });

      this.graphics.roundRect(-rW / 2, -rH / 2, rW, rH, 5);
      this.graphics.fill({ color: 0x3b0764 });
      this.graphics.roundRect(-rW / 2, -rH / 2, rW, rH, 5);
      this.graphics.stroke({ width: 2, color: 0xc084fc });

      // Core blinding white antimatter
      this.graphics.roundRect(-rW * 0.35, -rH * 0.25, rW * 0.7, rH * 0.5, 3);
      this.graphics.fill({ color: 0xffffff });
    }
  }

  update(dt, enemies, particles) {
    if (!this.isAlive) return;

    this.pulseAnim += dt * 5;
    this.life -= dt;

    if (this.life <= 0) {
      if (this.type === 'bomb' && this.aoeRadius > 0) {
        this.detonate(enemies, particles);
      } else if (this.type === 'void_slug') {
        this.detonateVoidSlug(enemies, particles);
      }
      this.isAlive = false;
      this.graphics.visible = false;
      return;
    }

    // Inferno Supernova Core In-Flight 360° Scorching Aura
    if (this.isInfernoCore) {
      this.trailTimer += dt;
      if (this.trailTimer > 0.035) {
        this.trailTimer = 0;
        const pAngle = this.pulseAnim * 10;
        particles?.emit({
          x: this.x + Math.cos(pAngle) * 22,
          y: this.y + Math.sin(pAngle) * 22,
          count: 3,
          color: Math.random() > 0.5 ? 0xff3300 : 0xffaa00,
          speed: 80,
          life: 0.22,
          size: 4
        });
      }

      // Continuous burn damage to enemies along flight trajectory
      if (enemies) {
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (d <= 80 + enemy.size) {
            enemy.takeDamage(75 * dt, 'burn');
            enemy.applyBurn(70, 2.0);
          }
        }
      }
    }

    // Missile & Needle homing & smoke trails
    if (this.type === 'missile' || this.type === 'needle') {
      this.trailTimer += dt;
      if (this.trailTimer > 0.03) {
        this.trailTimer = 0;
        const trailColor = this.type === 'needle'
          ? (Math.random() > 0.5 ? 0xec4899 : 0x06b6d4)
          : (this.isTier5 ? (Math.random() > 0.5 ? 0xd946ef : 0x00f0ff) : 0xffaa00);
        particles?.emitTrail(this.x, this.y, trailColor);
      }

      let activeTarget = this.target && this.target.isAlive ? this.target : null;
      if (!activeTarget && enemies && enemies.length > 0) {
        let minDist = 700;
        for (const e of enemies) {
          if (!e.isAlive) continue;
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minDist) {
            minDist = d;
            activeTarget = e;
          }
        }
      }

      if (activeTarget) {
        const targetAngle = Math.atan2(activeTarget.y - this.y, activeTarget.x - this.x);
        const currentAngle = Math.atan2(this.vy, this.vx);
        let diff = targetAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const turnSpeed = this.type === 'needle' ? 12.0 : (this.isTier5 ? 9.5 : 7.0);
        const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed * dt);
        this.vx = Math.cos(newAngle) * this.speed;
        this.vy = Math.sin(newAngle) * this.speed;
      }
    }

    // Void Slug Gravitational Wake (Drags nearby enemies toward slug path)
    if (this.type === 'void_slug' && enemies) {
      this.trailTimer += dt;
      if (this.trailTimer > 0.04) {
        this.trailTimer = 0;
        particles?.emit({
          x: this.x,
          y: this.y,
          count: 2,
          color: 0x9333ea,
          speed: 40,
          life: 0.25,
          size: 3
        });
      }
      const pullRadius = this.isTier5 ? 200 : 120;
      const pullSpeed = this.isTier5 ? 120 : 60;
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (d < pullRadius && d > 10) {
          enemy.x += ((this.x - enemy.x) / d) * pullSpeed * dt;
          enemy.y += ((this.y - enemy.y) / d) * pullSpeed * dt;
        }
      }
    }

    // Frost Shard Trail
    if (this.type === 'frost_shard') {
      this.trailTimer += dt;
      if (this.trailTimer > (this.isTitanComet ? 0.025 : 0.05)) {
        this.trailTimer = 0;
        particles?.emit({
          x: this.x,
          y: this.y,
          count: this.isTitanComet ? 3 : 1,
          color: this.isTitanComet ? 0x00f0ff : 0xa5f3fc,
          speed: this.isTitanComet ? 70 : 30,
          life: this.isTitanComet ? 0.28 : 0.18,
          size: this.isTitanComet ? 4 : 2
        });
      }
    }

    // Movement
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.graphics.x = this.x;
    this.graphics.y = this.y;
    if (this.type === 'normal' || this.type === 'missile' || this.type === 'frost_shard' || this.type === 'needle' || this.type === 'void_slug') {
      this.graphics.rotation = Math.atan2(this.vy, this.vx);
    } else if (this.type === 'bomb' || this.type === 'sawblade') {
      this.render(); // Re-render for spinning saw teeth / flame corona
    }

    // Bounds check
    const padding = 80;
    if (
      this.x < -padding ||
      this.x > this.engine.width + padding ||
      this.y < -padding ||
      this.y > this.engine.height + padding
    ) {
      this.isAlive = false;
      this.graphics.visible = false;
    }
  }

  detonate(enemies, particles) {
    const scene = this.engine.sceneManager.currentScene;

    if (particles) {
      const expColor = this.isInfernoCore ? 0xff2200 : (this.isTier5 ? 0xff3300 : this.color);
      particles.emitExplosion(this.x, this.y, this.aoeRadius, expColor);
      particles.emitShockwave(this.x, this.y, this.aoeRadius, this.isInfernoCore ? 0xffdd00 : (this.isTier5 ? 0xffea00 : 0xd946ef));
    }

    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isAlive) continue;
        const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (dist <= this.aoeRadius + enemy.size) {
          enemy.takeDamage(this.damage, 'explosion');
          scene?.triggerSynergyProc?.(this.type, enemy, this.x, this.y);
          if (this.isInfernoCore) {
            enemy.applyBurn(90, 3.0);
          }
        }
      }
    }

    // 0. Tier 5 Homing Missile: 2-stage Recursive Fractal Cluster Splits!
    if (this.type === 'missile' && this.isTier5 && scene?.bulletPool) {
      const currentStage = this.clusterStage || 0;
      if (currentStage < 2) {
        const nextStage = currentStage + 1;
        audio.playMissileLaunch?.();
        const baseAngle = Math.atan2(this.vy, this.vx);
        for (let s = 0; s < 2; s++) {
          const sAngle = baseAngle + (s === 0 ? 0.75 : -0.75) + (Math.random() - 0.5) * 0.3;
          scene.bulletPool.get({
            type: 'missile',
            x: this.x + Math.cos(sAngle) * 18,
            y: this.y + Math.sin(sAngle) * 18,
            angle: sAngle,
            speed: this.speed * (nextStage === 1 ? 0.95 : 0.85),
            damage: Math.round(this.damage * 0.55),
            aoeRadius: Math.max(35, Math.round(this.aoeRadius * 0.7)),
            life: 2.2,
            target: null,
            color: nextStage === 1 ? 0xf43f5e : 0xfacc15,
            isTier5: true,
            clusterStage: nextStage
          });
        }
      }
    }

    // 0b. Synergy: Missile + Sawblade -> Detonates into 5 starburst homing rockets + 1 cutting buzzsaw!
    if (this.type === 'missile' && scene?.turret?.hasSynergy('missile+sawblade') && !this.isSawbladeChild) {
      if (scene.bulletPool) {
        audio.playExplosion?.();
        for (let r = 0; r < 5; r++) {
          const rAngle = (r * Math.PI * 2) / 5;
          scene.bulletPool.get({
            type: 'missile',
            x: this.x,
            y: this.y,
            angle: rAngle,
            speed: 520,
            damage: Math.round(this.damage * 0.6),
            aoeRadius: 55,
            life: 2.0,
            color: 0x00f0ff,
            isSawbladeChild: true
          });
        }
        scene.bulletPool.get({
          type: 'sawblade',
          x: this.x,
          y: this.y,
          angle: Math.random() * Math.PI * 2,
          speed: 380,
          damage: Math.round(this.damage * 0.9),
          pierce: 8,
          life: 2.5,
          color: 0x00f0ff
        });
      }
      particles?.emitShockwave(this.x, this.y, 140, 0x00f0ff);
    }

    // 1. Synergy: Bomb + Flame -> Spawns Magma Lake (Biển Dung Nham)
    if (this.isInfernoCore && scene) {
      scene.addMagmaPool(this.x, this.y, 140, 3.5, 95);
    }

    // 2. Synergy: Missile + Flame -> Napalm Ground Pool
    if (this.type === 'missile' && scene?.turret?.hasSynergy('flame+missile')) {
      scene.addMagmaPool(this.x, this.y, 105, 3.0, 75);
    }

    // 3. Synergy: Bomb + Lightning -> 6 Electric Bolts
    if (this.type === 'bomb' && scene?.turret?.hasSynergy('bomb+passive_lightning')) {
      if (enemies) {
        let zapped = 0;
        for (const enemy of enemies) {
          if (!enemy.isAlive || zapped >= 6) continue;
          if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= 220) {
            enemy.takeDamage(85, 'lightning');
            particles?.emit({ x: enemy.x, y: enemy.y, count: 5, color: 0xffea00, speed: 100, life: 0.2 });
            zapped++;
          }
        }
      }
    }

    // 4. Synergy: Bomb + Kinetic -> 8 Shrapnel Darts
    if (this.type === 'bomb' && scene?.turret?.hasSynergy('bomb+kinetic') && scene.bulletPool) {
      for (let s = 0; s < 8; s++) {
        const sAngle = (s * Math.PI * 2) / 8;
        scene.bulletPool.get({
          type: 'normal',
          x: this.x,
          y: this.y,
          angle: sAngle,
          speed: 550,
          damage: 50,
          pierce: 2,
          life: 0.6,
          color: 0xffd700
        });
      }
    }

    // 5. Plasma Bomb Cluster Splits (Tier 4 MIRV: 3 bombs, Tier 5 Supernova: 6 hexagonal bombs)
    if (this.type === 'bomb' && this.splitCount > 0 && scene?.bulletPool) {
      audio.playExplosion?.(0.75);
      const subCount = this.splitCount;
      for (let s = 0; s < subCount; s++) {
        const sAngle = (s * Math.PI * 2) / subCount;
        scene.bulletPool.get({
          type: 'bomb',
          x: this.x,
          y: this.y,
          angle: sAngle,
          speed: 280,
          damage: Math.round(this.damage * 0.45),
          aoeRadius: Math.round(this.aoeRadius * 0.65),
          life: 0.55,
          color: this.isTier5 ? 0xffaa00 : 0xaa00ff,
          bouncesLeft: 0,
          splitCount: 0,
          isTier5: false,
          isInfernoCore: this.isInfernoCore
        });
      }
      particles?.emitShockwave(this.x, this.y, this.aoeRadius * 1.15, this.isTier5 ? 0xffea00 : 0xaa00ff);
    }
  }

  detonateVoidSlug(enemies, particles) {
    const scene = this.engine.sceneManager?.currentScene;
    const hasBlackHoleSyn = scene?.turret?.hasSynergy('void_railgun+passive_black_hole');

    if (hasBlackHoleSyn) {
      // EVENT HORIZON COLLAPSE: Spawn Supermassive Singularity
      scene.blackHolePassive?.spawnCustomHole(this.x, this.y, 220, 3.5, 180, 520);
      particles?.emitExplosion(this.x, this.y, 220, 0x9333ea);
      particles?.emitShockwave(this.x, this.y, 240, 0xc084fc);
    } else if (this.isTier5) {
      particles?.emitExplosion(this.x, this.y, 160, 0x9333ea);
      particles?.emitShockwave(this.x, this.y, 180, 0xc084fc);
      if (enemies) {
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= 160) {
            enemy.takeDamage(this.damage * 0.5, 'black_hole');
          }
        }
      }
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
