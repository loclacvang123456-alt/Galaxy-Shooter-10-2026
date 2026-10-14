import { Graphics } from 'pixi.js';
import { glowVFX } from './GlowVFX.js';

export class ParticleSystem {
  constructor(engine) {
    this.engine = engine;
    this.graphics = new Graphics();
    this.engine.vfxLayer.addChild(this.graphics);

    this.particles = [];
    this.shockwaves = [];
    this.maxParticles = 600;
  }

  emit({ x, y, count = 10, color = 0x00f0ff, speed = 100, life = 0.5, size = 3, spread = Math.PI * 2, angle = 0 }) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const pAngle = angle + (Math.random() - 0.5) * spread;
      const pSpeed = speed * (0.4 + Math.random() * 0.8);

      this.particles.push({
        x,
        y,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        life,
        maxLife: life,
        alpha: 1
      });
    }
  }

  emitExplosion(x, y, radius = 50, color = 0xff6600) {
    // 1. Expanding Neon Shockwave Ring & Plasma Dome reaching EXACT radius
    this.shockwaves.push({
      x,
      y,
      maxRadius: radius,
      color: 0xffffff,
      rimColor: color,
      isExplosionDome: true,
      life: 0.42,
      maxLife: 0.42,
      strokeWidth: 4.5
    });

    // 2. High-speed fire sparks expanding out to radius
    const count = Math.min(32, Math.max(14, Math.round(radius * 0.22)));
    this.emit({ x, y, count, color: 0xffffff, speed: radius * 2.8, life: 0.22, size: 4 });
    this.emit({ x, y, count, color: color, speed: radius * 2.1, life: 0.42, size: 5 });
    this.emit({ x, y, count: Math.round(count * 0.7), color: 0xff0044, speed: radius * 1.3, life: 0.55, size: 6 });

    // 3. Additive Blooming Lens Flare Flash
    glowVFX.spawnExplosionFlare(this.engine.vfxLayer, x, y, Math.min(180, radius * 1.4), color);
  }

  emitTrail(x, y, color = 0x00f0ff) {
    this.emit({ x, y, count: 2, color, speed: 20, life: 0.25, size: 2.5 });
  }

  emitShockwave(x, y, radius, color = 0x00f0ff, strokeWidth = 3.5) {
    this.shockwaves.push({
      x,
      y,
      maxRadius: radius,
      color,
      rimColor: color,
      isExplosionDome: false,
      life: 0.38,
      maxLife: 0.38,
      strokeWidth
    });
    this.emit({ x, y, count: Math.min(26, Math.round(radius * 0.2)), color, speed: radius * 2.2, life: 0.32, size: 3 });
  }

  update(dt) {
    this.graphics.clear();

    // 1. Render Expanding Shockwaves & True AoE Explosion Domes
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      const t = 1 - sw.life / sw.maxLife; // 0 -> 1
      const easeOut = Math.sin(t * Math.PI * 0.5);
      const curRadius = sw.maxRadius * easeOut;
      const alpha = Math.max(0, 1 - t);

      if (sw.isExplosionDome) {
        // Inner glowing plasma dome filling the blast radius
        this.graphics.circle(sw.x, sw.y, curRadius * 0.88);
        this.graphics.fill({ color: sw.rimColor || sw.color, alpha: alpha * 0.35 });

        // Blinding white flash core at origin for the initial 90ms
        if (t < 0.22) {
          this.graphics.circle(sw.x, sw.y, curRadius * 0.5);
          this.graphics.fill({ color: 0xffffff, alpha: (1 - t * 4.5) * 0.85 });
        }
      }

      // Neon Shockwave Rim (Viền lóe sáng sắc nét đúng phạm vi nổ)
      this.graphics.circle(sw.x, sw.y, curRadius);
      this.graphics.stroke({
        width: Math.max(1.5, sw.strokeWidth * alpha),
        color: sw.rimColor || sw.color,
        alpha: alpha * 0.95
      });

      // Bright white accent edge
      this.graphics.circle(sw.x, sw.y, Math.max(0.1, curRadius - 2));
      this.graphics.stroke({
        width: Math.max(1, 2 * alpha),
        color: 0xffffff,
        alpha: alpha * 0.85
      });
    }

    // 2. Render Particle Sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94; // slight drag
      p.vy *= 0.94;

      const progress = p.life / p.maxLife;
      const currentSize = p.size * progress;

      this.graphics.circle(p.x, p.y, Math.max(currentSize, 0.5));
      this.graphics.fill({ color: p.color, alpha: progress });
    }
  }

  destroy() {
    this.particles = [];
    this.shockwaves = [];
    this.graphics.destroy();
  }
}
