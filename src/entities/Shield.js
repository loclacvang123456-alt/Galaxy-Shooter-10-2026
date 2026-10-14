import { Graphics } from 'pixi.js';
import { CONFIG } from '../config.js';
import { audio } from '../audio/AudioManager.js';

export class Shield {
  constructor(engine, x, y) {
    this.engine = engine;
    this.x = x;
    this.y = y;

    this.maxHp = CONFIG.SHIELD.BASE_HP;
    this.currentHp = this.maxHp;
    this.radius = CONFIG.SHIELD.BASE_RADIUS;
    this.isActive = true;
    this.tier = 1;

    this.regenDelay = CONFIG.SHIELD.REGEN_DELAY;
    this.timeSinceHit = 0;
    this.pulsePhase = 0;
    this.soundCooldown = 0;

    this.graphics = new Graphics();
    this.engine.gameWorldLayer.addChild(this.graphics);
  }

  upgrade() {
    if (this.tier < 5) {
      this.tier++;
      this.upgradeHp(30);
      this.upgradeRadius(15);
      if (this.tier === 5) {
        this.maxHp += 50;
        this.currentHp = this.maxHp;
        this.regenDelay = Math.max(0.8, this.regenDelay * 0.6);
      }
      return true;
    }
    return false;
  }

  upgradeRadius(amount = 15) {
    this.radius += amount;
  }

  upgradeHp(amount = 25) {
    this.maxHp += amount;
    this.currentHp = Math.min(this.currentHp + amount, this.maxHp);
  }

  takeDamage(amount) {
    if (!this.isActive) return 0;
    if (this.engine.sceneManager.currentScene?.godMode) return 0;

    const damageTaken = Math.min(amount, this.currentHp);
    this.currentHp -= damageTaken;
    this.timeSinceHit = 0;

    // Throttle hit sound to prevent overwhelming loud audio accumulation
    if (this.soundCooldown <= 0) {
      this.soundCooldown = 0.25;
      audio.playShieldHit();
    }

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.isActive = false;
      this.timeSinceHit = 0;
      // Shield break explosion
      if (this.engine.sceneManager.currentScene?.particles) {
        this.engine.sceneManager.currentScene.particles.emitShockwave(this.x, this.y, this.radius, 0x00f0ff);
      }
    }

    return damageTaken;
  }

  update(dt) {
    this.pulsePhase += dt * 3;
    this.timeSinceHit += dt;
    if (this.soundCooldown > 0) {
      this.soundCooldown -= dt;
    }

    // Shield Regeneration
    if (!this.isActive) {
      if (this.timeSinceHit >= this.regenDelay * 1.5) {
        // Reboot shield
        this.isActive = true;
        this.currentHp = this.maxHp * 0.3; // Reboots at 30%
      }
    } else {
      if (this.timeSinceHit >= this.regenDelay && this.currentHp < this.maxHp) {
        this.currentHp = Math.min(this.maxHp, this.currentHp + CONFIG.SHIELD.REGEN_RATE * dt);
      }
    }

    this.render();
  }

  render() {
    this.graphics.clear();
    if (!this.isActive) {
      // Draw faint recharging boundary
      const rechargeProgress = Math.min(this.timeSinceHit / (this.regenDelay * 1.5), 1);
      this.graphics.circle(this.x, this.y, this.radius);
      this.graphics.stroke({ width: 1, color: 0x00f0ff, alpha: 0.15 * rechargeProgress });
      return;
    }

    const healthRatio = this.currentHp / this.maxHp;
    const pulseAlpha = 0.5 + Math.sin(this.pulsePhase) * 0.2;

    // Outer glow aura
    this.graphics.circle(this.x, this.y, this.radius + 3);
    this.graphics.stroke({ width: 2, color: 0x00f0ff, alpha: 0.3 * healthRatio });

    // Main barrier ring
    this.graphics.circle(this.x, this.y, this.radius);
    this.graphics.stroke({ width: 3.5, color: 0x00e5ff, alpha: pulseAlpha * healthRatio });

    // Inner translucent energy dome
    this.graphics.circle(this.x, this.y, this.radius);
    this.graphics.fill({ color: 0x00f0ff, alpha: 0.05 * healthRatio });
  }

  destroy() {
    this.graphics.destroy();
  }
}
