// Procedural Lens Flare & Additive Bloom VFX Engine for Pixi.js v8
// Generates soft radial bloom, anamorphic light streaks, and starburst flares
// with hardware-accelerated additive blending.

import { Texture, Sprite, Container, Graphics } from 'pixi.js';

class GlowVFXEngine {
  constructor() {
    this.textures = new Map();
    this.activeFlares = [];
  }

  // Generate or retrieve cached radial bloom texture
  getBloomTexture(size = 128) {
    if (typeof document === 'undefined') return Texture.EMPTY;
    const key = `bloom_${size}`;
    if (this.textures.has(key)) return this.textures.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.10)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = Texture.from(canvas);
    this.textures.set(key, texture);
    return texture;
  }

  // Generate or retrieve anamorphic horizontal streak flare texture
  getStreakTexture(width = 256, height = 32) {
    if (typeof document === 'undefined') return Texture.EMPTY;
    const key = `streak_${width}x${height}`;
    if (this.textures.has(key)) return this.textures.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const cx = width / 2;
    const cy = height / 2;

    // Horizontal beam gradient
    const gradX = ctx.createLinearGradient(0, cy, width, cy);
    gradX.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
    gradX.addColorStop(0.35, 'rgba(255, 255, 255, 0.25)');
    gradX.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    gradX.addColorStop(0.65, 'rgba(255, 255, 255, 0.25)');
    gradX.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    // Vertical falloff
    const gradY = ctx.createLinearGradient(cx, 0, cx, height);
    gradY.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
    gradY.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');
    gradY.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradX;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = gradY;
    ctx.fillRect(0, 0, width, height);

    const texture = Texture.from(canvas);
    this.textures.set(key, texture);
    return texture;
  }

  // Generate 4-pointed star flare texture
  getStarFlareTexture(size = 128) {
    if (typeof document === 'undefined') return Texture.EMPTY;
    const key = `star_${size}`;
    if (this.textures.has(key)) return this.textures.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;

    // Center circular glow
    const radial = ctx.createRadialGradient(half, half, 0, half, half, half * 0.55);
    radial.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    radial.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
    radial.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, size, size);

    // Cross rays
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    // Horizontal ray
    ctx.beginPath();
    ctx.moveTo(0, half);
    ctx.lineTo(half, half - 3);
    ctx.lineTo(size, half);
    ctx.lineTo(half, half + 3);
    ctx.closePath();
    ctx.fill();

    // Vertical ray
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half - 3, half);
    ctx.lineTo(half, size);
    ctx.lineTo(half + 3, half);
    ctx.closePath();
    ctx.fill();

    const texture = Texture.from(canvas);
    this.textures.set(key, texture);
    return texture;
  }

  // Spawn an additive bloom halo attached to any container
  createGlowSprite(size = 64, color = 0x00f0ff, alpha = 0.7) {
    const spr = new Sprite(this.getBloomTexture(128));
    spr.anchor.set(0.5);
    spr.width = size;
    spr.height = size;
    spr.tint = color;
    spr.alpha = alpha;
    spr.blendMode = 'add';
    return spr;
  }

  // Spawn a lens flare star sprite
  createStarFlareSprite(size = 64, color = 0xffea00, alpha = 0.85) {
    const spr = new Sprite(this.getStarFlareTexture(128));
    spr.anchor.set(0.5);
    spr.width = size;
    spr.height = size;
    spr.tint = color;
    spr.alpha = alpha;
    spr.blendMode = 'add';
    return spr;
  }

  // Spawn an anamorphic streak flare sprite
  createStreakSprite(width = 160, height = 24, color = 0x00f0ff, alpha = 0.8) {
    const spr = new Sprite(this.getStreakTexture(256, 32));
    spr.anchor.set(0.5);
    spr.width = width;
    spr.height = height;
    spr.tint = color;
    spr.alpha = alpha;
    spr.blendMode = 'add';
    return spr;
  }

  // Instant one-shot explosion lens flare flash (expands and decays)
  spawnExplosionFlare(targetLayer, x, y, maxRadius = 120, color = 0xff6600) {
    if (!targetLayer || typeof document === 'undefined') return;

    const flareContainer = new Container();
    flareContainer.x = x;
    flareContainer.y = y;

    // 1. Core blinding white-to-color bloom
    const bloom = this.createGlowSprite(maxRadius * 0.8, color, 0.95);
    flareContainer.addChild(bloom);

    // 2. 4-pointed anamorphic star flash
    const star = this.createStarFlareSprite(maxRadius * 1.4, 0xffffff, 0.9);
    flareContainer.addChild(star);

    // 3. Horizontal lens streak
    const streak = this.createStreakSprite(maxRadius * 2.2, maxRadius * 0.25, color, 0.8);
    flareContainer.addChild(streak);

    targetLayer.addChild(flareContainer);

    this.activeFlares.push({
      container: flareContainer,
      life: 0.32,
      maxLife: 0.32,
      maxRadius,
      update(dt) {
        this.life -= dt;
        const progress = Math.max(0, this.life / this.maxLife); // 1 -> 0
        const ease = 1 - Math.pow(1 - (1 - progress), 3);

        const currentScale = 0.3 + 0.8 * ease;
        bloom.scale.set(currentScale);
        bloom.alpha = Math.pow(progress, 1.2) * 0.95;

        star.scale.set(currentScale * 1.2);
        star.rotation += dt * 1.5;
        star.alpha = Math.pow(progress, 1.5);

        streak.scale.set(currentScale * 1.4, currentScale * 0.6);
        streak.alpha = progress * 0.8;

        return this.life <= 0;
      }
    });
  }

  // Muzzle flare when a weapon fires
  spawnMuzzleFlare(targetLayer, x, y, angle, size = 32, color = 0x00f0ff) {
    if (!targetLayer) return;

    const flare = this.createStarFlareSprite(size, color, 0.95);
    flare.x = x;
    flare.y = y;
    flare.rotation = angle;
    targetLayer.addChild(flare);

    this.activeFlares.push({
      container: flare,
      life: 0.08,
      maxLife: 0.08,
      update(dt) {
        this.life -= dt;
        flare.alpha = Math.max(0, this.life / this.maxLife);
        flare.scale.set(1.2 - (this.life / this.maxLife) * 0.4);
        return this.life <= 0;
      }
    });
  }

  // Update all transient flare particles
  update(dt) {
    for (let i = this.activeFlares.length - 1; i >= 0; i--) {
      const f = this.activeFlares[i];
      const isDead = f.update(dt);
      if (isDead) {
        f.container.parent?.removeChild(f.container);
        f.container.destroy({ children: true });
        this.activeFlares.splice(i, 1);
      }
    }
  }

  destroy() {
    this.activeFlares.forEach(f => {
      f.container.parent?.removeChild(f.container);
      f.container.destroy({ children: true });
    });
    this.activeFlares = [];
    this.textures.clear();
  }
}

export const glowVFX = new GlowVFXEngine();
