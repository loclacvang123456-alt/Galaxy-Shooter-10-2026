// Cross-platform Input Manager (Mouse, Touch, Keyboard)
export class InputManager {
  constructor(engine) {
    this.engine = engine;
    this.pointerX = engine.width / 2;
    this.pointerY = engine.height / 2;
    this.isPointerDown = false;
    this.selectedTarget = null; // Prioritized enemy tapped by player

    this.setupListeners();
  }

  setupListeners() {
    const canvas = this.engine.app.canvas;

    const updatePointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = this.engine.width / rect.width;
      const scaleY = this.engine.height / rect.height;

      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      this.pointerX = (clientX - rect.left) * scaleX;
      this.pointerY = (clientY - rect.top) * scaleY;
    };

    canvas.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      updatePointer(e);
      this.checkTargetSelection(this.pointerX, this.pointerY);
    });

    window.addEventListener('pointermove', (e) => {
      updatePointer(e);
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    window.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        const scene = this.engine.sceneManager.currentScene;
        scene?.openPauseMenu?.();
      }
    });
  }

  checkTargetSelection(x, y) {
    // If active scene has enemies, test if player clicked near an enemy
    const scene = this.engine.sceneManager.currentScene;
    if (scene && scene.enemies) {
      let clickedEnemy = null;
      let minDistance = 50; // Hitbox tolerance radius for tap selection
      for (const enemy of scene.enemies) {
        if (!enemy.isAlive) continue;
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < enemy.size + minDistance && dist < minDistance) {
          minDistance = dist;
          clickedEnemy = enemy;
        }
      }
      if (clickedEnemy) {
        this.selectedTarget = clickedEnemy;
      }
    }
  }

  clearSelectedTarget() {
    this.selectedTarget = null;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen?.();
    }
  }
}
