import { Application, Container } from 'pixi.js';
import { CONFIG } from '../config.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { sdk } from '../sdk/SDKManager.js';

export class Engine {
  constructor() {
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;
    this.app = new Application();
    this.isPaused = false;

    // Containers per architecture requirements
    this.backgroundLayer = new Container();
    this.gameWorldLayer = new Container();
    this.vfxLayer = new Container();
    this.uiLayer = new Container();

    this.sceneManager = new SceneManager(this);
    this.input = null;
  }

  async init(containerElement) {
    // PixiJS v8 asynchronous initialization
    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundColor: CONFIG.CANVAS.BG_COLOR,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      antialias: true
    });

    containerElement.appendChild(this.app.canvas);

    // Layer stacking order
    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.gameWorldLayer);
    this.app.stage.addChild(this.vfxLayer);
    this.app.stage.addChild(this.uiLayer);

    // Ensure PixiJS EventBoundary rootTarget is set to stage
    if (this.app.renderer?.events?.rootBoundary) {
      this.app.renderer.events.rootBoundary.rootTarget = this.app.stage;
    }

    this.input = new InputManager(this);
    this.setupResizeHandler();
    this.setupGameLoop();

    // Register engine to SDK manager for ad pause/resume
    sdk.setGameInstance(this);
  }

  setupResizeHandler() {
    const resize = () => {
      const windowWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const windowHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

      // Fit / Letterbox aspect ratio 16:9
      const targetRatio = this.width / this.height;
      const windowRatio = windowWidth / windowHeight;

      let displayWidth, displayHeight;
      if (windowRatio > targetRatio) {
        displayHeight = windowHeight;
        displayWidth = windowHeight * targetRatio;
      } else {
        displayWidth = windowWidth;
        displayHeight = windowWidth / targetRatio;
      }

      const canvas = this.app.canvas;
      canvas.style.width = `${Math.floor(displayWidth)}px`;
      canvas.style.height = `${Math.floor(displayHeight)}px`;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => {
      setTimeout(resize, 100);
      setTimeout(resize, 350);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resize);
      window.visualViewport.addEventListener('scroll', resize);
    }
    resize();
  }

  setupGameLoop() {
    this.app.ticker.add((ticker) => {
      if (this.app.renderer?.events?.rootBoundary && !this.app.renderer.events.rootBoundary.rootTarget) {
        this.app.renderer.events.rootBoundary.rootTarget = this.app.stage;
      }
      if (this.isPaused) return;
      // Convert frame deltaTime to seconds (60fps baseline -> ~1/60s per frame)
      const dt = Math.min(ticker.deltaTime / 60, 0.1);
      this.sceneManager.update(dt);
    });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }
}
