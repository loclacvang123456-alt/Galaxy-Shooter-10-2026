// Generic High Performance Object Pool for 60 FPS bullet hell / survivor gameplay
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 20) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get(...args) {
    let item;
    if (this.pool.length > 0) {
      item = this.pool.pop();
    } else {
      item = this.createFn();
    }
    if (this.resetFn) {
      this.resetFn(item, ...args);
    }
    item.isAlive = true;
    return item;
  }

  release(item) {
    item.isAlive = false;
    this.pool.push(item);
  }

  clear() {
    this.pool.length = 0;
  }
}
