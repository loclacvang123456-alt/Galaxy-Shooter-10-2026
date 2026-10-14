// Scene Manager for switching game scenes and cleaning up resources
export class SceneManager {
  constructor(engine) {
    this.engine = engine;
    this.currentScene = null;
    this.scenes = new Map();
  }

  register(name, SceneClass) {
    this.scenes.set(name, SceneClass);
  }

  async loadScene(name, ...args) {
    try {
      const SceneClass = this.scenes.get(name);
      if (!SceneClass) {
        console.error(`Scene not registered: ${name}`);
        return;
      }
      await this.setScene(new SceneClass(...args));
    } catch (err) {
      console.error(`Failed to load scene "${name}":`, err);
    }
  }

  async setScene(sceneInstance) {
    try {
      if (this.currentScene) {
        if (typeof this.currentScene.destroy === 'function') {
          this.currentScene.destroy();
        }
        this.engine.backgroundLayer.removeChildren();
        this.engine.gameWorldLayer.removeChildren();
        this.engine.vfxLayer.removeChildren();
        this.engine.uiLayer.removeChildren();
      }

      this.currentScene = sceneInstance;
      if (this.currentScene) {
        await this.currentScene.init(this.engine);
      }
    } catch (err) {
      console.error('Error during setScene:', err);
    }
  }

  update(dt) {
    if (this.currentScene && typeof this.currentScene.update === 'function') {
      this.currentScene.update(dt);
    }
  }
}
