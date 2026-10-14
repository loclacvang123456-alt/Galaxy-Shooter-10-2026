import { Graphics, Container } from 'pixi.js';

export class BackgroundStarfield {
  constructor(engine) {
    this.engine = engine;
    this.container = new Container();
    this.engine.backgroundLayer.addChild(this.container);

    this.stars = [];
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.initStars();
  }

  initStars() {
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.engine.width,
        y: Math.random() * this.engine.height,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 25 + 10,
        alpha: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.4 ? 0x00f0ff : (Math.random() > 0.5 ? 0xff00aa : 0xffffff)
      });
    }
  }

  update(dt) {
    this.graphics.clear();

    // Subtle space grid
    this.graphics.beginPath();
    const gridSize = 80;
    for (let x = 0; x < this.engine.width; x += gridSize) {
      this.graphics.moveTo(x, 0);
      this.graphics.lineTo(x, this.engine.height);
    }
    for (let y = 0; y < this.engine.height; y += gridSize) {
      this.graphics.moveTo(0, y);
      this.graphics.lineTo(this.engine.width, y);
    }
    this.graphics.stroke({ width: 1, color: 0x0d1838, alpha: 0.3 });

    // Center arena halo
    const cx = this.engine.width / 2;
    const cy = this.engine.height / 2;
    this.graphics.circle(cx, cy, 320);
    this.graphics.stroke({ width: 1.5, color: 0x11234a, alpha: 0.35 });

    // Moving stars
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > this.engine.height) {
        star.y = 0;
        star.x = Math.random() * this.engine.width;
      }
      this.graphics.circle(star.x, star.y, star.size);
      this.graphics.fill({ color: star.color, alpha: star.alpha });
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
