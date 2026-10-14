import { Engine } from './core/Engine.js';
import { sdk } from './sdk/SDKManager.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

async function bootstrap() {
  const container = document.getElementById('game-container');
  if (!container) {
    console.error('Fatal: #game-container not found in DOM');
    return;
  }

  // 1. Initialize Engine (PixiJS v8)
  const engine = new Engine();
  await engine.init(container);

  // 2. Register scenes
  engine.sceneManager.register('menu', MenuScene);
  engine.sceneManager.register('game', GameScene);

  // 3. Launch Initial Scene (Menu Scene) immediately
  await engine.sceneManager.loadScene('menu');

  // 4. Initialize SDK Manager (GameMonetize / CrazyGames / ByteBrew) in background
  sdk.init(engine).then(() => {
    sdk.loadingStop();
  }).catch(err => {
    console.warn('[SDK] Init warning:', err);
  });

  window.__ENGINE__ = engine;
  console.log('Galaxy Shooter initialized successfully.');
}

window.addEventListener('DOMContentLoaded', bootstrap);
