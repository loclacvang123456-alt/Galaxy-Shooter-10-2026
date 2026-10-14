import { Graphics } from 'pixi.js';
import { ObjectPool } from '../core/ObjectPool.js';
import { audio } from '../audio/AudioManager.js';

export class DropGemManager {
  constructor(engine) {
    this.engine = engine;
    this.gems = [];
    this.gemSpeedMult = 1.0;
    this.magnetRadiusMult = 1.0;

    this.pool = new ObjectPool(
      () => {
        const g = new Graphics();
        g.visible = false;
        this.engine.gameWorldLayer.addChild(g);
        return g;
      },
      (g, x, y, xpValue, isGreen = false) => {
        g.x = x;
        g.y = y;
        g.xpValue = xpValue;
        g.isGreen = isGreen || xpValue >= 15;
        g.visible = true;
        g.alpha = 1;

        // Render Gem Shape (Blue Standard vs Emerald Green Mega Gem)
        g.clear();
        if (g.isGreen) {
          // GREEN MEGA GEM (x10+ XP): Huge Glowing Emerald Diamond
          // Outer glowing green halo
          g.poly([
            { x: 0, y: -13 },
            { x: 11, y: 0 },
            { x: 0, y: 13 },
            { x: -11, y: 0 }
          ]);
          g.fill({ color: 0x15803d, alpha: 0.45 });

          // Main emerald body
          g.poly([
            { x: 0, y: -10 },
            { x: 8.5, y: 0 },
            { x: 0, y: 10 },
            { x: -8.5, y: 0 }
          ]);
          g.fill({ color: 0x22c55e });
          g.stroke({ width: 2, color: 0x86efac });

          // Gleaming white center core
          g.poly([
            { x: 0, y: -4 },
            { x: 3.5, y: 0 },
            { x: 0, y: 4 },
            { x: -3.5, y: 0 }
          ]);
          g.fill({ color: 0xffffff });
        } else {
          // STANDARD BLUE GEM: Sleek Diamond
          g.poly([
            { x: 0, y: -7 },
            { x: 6, y: 0 },
            { x: 0, y: 7 },
            { x: -6, y: 0 }
          ]);
          g.fill({ color: 0x00f0ff });
          g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.9 });
        }

        // Brief outward burst before homing into turret
        const angle = Math.random() * Math.PI * 2;
        const scatterSpeed = Math.random() * 80 + 35;
        g.vx = Math.cos(angle) * scatterSpeed;
        g.vy = Math.sin(angle) * scatterSpeed;
        g.speed = 220;
        g.delay = 0.16;
      },
      60
    );
  }

  spawn(x, y, xpValue = 1, isGreen = false) {
    const gem = this.pool.get(x, y, xpValue, isGreen);
    this.gems.push(gem);
  }

  update(dt, turretX, turretY, onCollect) {
    const collectRadius = 38;

    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];

      const dx = turretX - g.x;
      const dy = turretY - g.y;
      const dist = Math.hypot(dx, dy);

      // Check collection at turret center
      if (dist < collectRadius) {
        audio.playGemCollect(g.isGreen);
        onCollect(g.xpValue);
        g.visible = false;
        this.pool.release(g);
        this.gems.splice(i, 1);
        continue;
      }

      if (g.delay > 0) {
        g.delay -= dt * (this.gemSpeedMult || 1.0);
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.vx *= 0.88;
        g.vy *= 0.88;
      } else {
        // Accelerate directly towards the central turret from anywhere on the screen
        const mult = this.gemSpeedMult || 1.0;
        g.speed += dt * 580 * mult;
        const speed = g.speed * mult;
        const dirX = dx / dist;
        const dirY = dy / dist;
        g.x += dirX * speed * dt;
        g.y += dirY * speed * dt;
      }
    }
  }

  destroy() {
    this.gems.forEach(g => {
      g.visible = false;
      this.pool.release(g);
    });
    this.gems = [];
    this.pool.clear();
  }
}
