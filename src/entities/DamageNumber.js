import { Text, TextStyle } from 'pixi.js';
import { ObjectPool } from '../core/ObjectPool.js';

export class DamageNumberManager {
  constructor(engine) {
    this.engine = engine;
    this.activeNumbers = [];

    this.style = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: { color: '#000000', width: 3 }
    });

    this.pool = new ObjectPool(
      () => {
        const text = new Text({ text: '0', style: this.style });
        text.anchor.set(0.5);
        text.visible = false;
        this.engine.vfxLayer.addChild(text);
        return text;
      },
      (text, x, y, value, isCrit = false, color = '#ffffff') => {
        text.text = Math.round(value).toString();
        text.style.fill = color;
        text.style.fontSize = isCrit ? 22 : 16;
        text.x = x + (Math.random() - 0.5) * 16;
        text.y = y - 10;
        text.alpha = 1;
        text.scale.set(isCrit ? 1.4 : 1);
        text.visible = true;
        text.life = 0.6;
        text.vy = -70;
      },
      30
    );
  }

  spawn(x, y, value, isCrit = false, color = '#ffffff') {
    if (this.activeNumbers.length >= 35) {
      const oldest = this.activeNumbers.shift();
      if (oldest) {
        oldest.visible = false;
        this.pool.release(oldest);
      }
    }
    const num = this.pool.get(x, y, value, isCrit, color);
    this.activeNumbers.push(num);
  }

  update(dt) {
    for (let i = this.activeNumbers.length - 1; i >= 0; i--) {
      const item = this.activeNumbers[i];
      item.life -= dt;

      item.y += item.vy * dt;
      item.vy += 60 * dt; // gravity

      if (item.scale.x > 1) {
        item.scale.x = Math.max(1, item.scale.x - dt * 2);
        item.scale.y = item.scale.x;
      }

      if (item.life <= 0.25) {
        item.alpha = item.life / 0.25;
      }

      if (item.life <= 0) {
        item.visible = false;
        this.pool.release(item);
        this.activeNumbers.splice(i, 1);
      }
    }
  }

  destroy() {
    this.activeNumbers.forEach(n => this.pool.release(n));
    this.activeNumbers = [];
    this.pool.clear();
  }
}
