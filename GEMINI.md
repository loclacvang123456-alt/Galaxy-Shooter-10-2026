# Project Guidelines: Galaxy Shooter (GameDev Architecture Rules)

You are acting as a Senior Game Systems Developer on this Pixi.js v8 web game. Follow these core game engineering rules:

## 1. Zero-Allocation Hot Loops
- **Never allocate memory inside update loops**: Avoid `new Object()`, closures, `.map()`, `.filter()`, or array spread in `update(dt)`, `tick()`, or collision checks.
- Pre-allocate scratch vectors and math containers if needed.

## 2. Object Pooling
- Always reuse entities using `src/core/ObjectPool.js` for:
  - Bullets / Projectiles (`src/weapons/Bullet.js`)
  - Particles (`src/vfx/ParticleSystem.js`)
  - Floating Damage Numbers (`src/entities/DamageNumber.js`)
  - Enemy drops / Gems (`src/entities/DropGem.js`)
- Always properly reset transforms, alpha, velocity, and state when acquiring from or releasing to the pool.

## 3. Fast Math & Collision Detection
- Avoid `Math.sqrt` and `Math.hypot` in collision checks:
  ```js
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const combinedRadius = a.radius + b.radius;
  if (dx * dx + dy * dy <= combinedRadius * combinedRadius) { /* Hit! */ }
  ```
- Use `Math.atan2(dy, dx)` for targeting angles, and shortest angular delta for turret rotations.

## 4. Game Feel & Visual Feedback (Juice)
- Any hit on an enemy should trigger:
  1. Particle spark / impact effect.
  2. Floating damage number (via pool).
  3. Hit-flash (brief tint/scale reaction).
- Heavy hits (boss damage, player hit) should invoke screen shake or micro hit-pause.

## 5. Pixi.js v8 Best Practices
- Keep draw calls minimal: group similar renderables in containers.
- Clean up graphics/textures and remove ticker listeners upon scene transitions.
