// Balance Stats Tracker & Real-Time Performance Monitor
export class BalanceStatsTracker {
  constructor(engine) {
    this.engine = engine;

    this.stats = {
      gameTime: 0,
      fps: 60,
      frameCount: 0,
      fpsTimer: 0,
      totalKills: 0,
      totalDamageDealt: 0,
      damageBySource: {
        kinetic: 0,
        missile: 0,
        bomb: 0,
        laser: 0,
        flame: 0,
        lightning: 0,
        black_hole: 0,
        shield_reflect: 0
      },
      shotsFiredByWeapon: {
        kinetic: 0,
        missile: 0,
        bomb: 0,
        laser: 0,
        flame: 0
      },
      enemySpawnCountByType: {
        swarm: 0,
        speeder: 0,
        tank: 0,
        minion: 0,
        mega_boss: 0
      },
      enemyKilledByType: {
        swarm: 0,
        speeder: 0,
        tank: 0,
        minion: 0,
        mega_boss: 0
      }
    };

    // Attach global helper to window for browser console access
    if (typeof window !== 'undefined') {
      window.dumpGameStats = () => this.dumpStats();
      window.getGameStats = () => this.getSnapshot();
      console.log('💡 [Balance Tool] Type window.dumpGameStats() in console or press [B] in game to view full balance metrics.');
    }
  }

  update(dt) {
    this.stats.gameTime += dt;
    this.stats.frameCount++;
    this.stats.fpsTimer += dt;

    if (this.stats.fpsTimer >= 0.5) {
      this.stats.fps = Math.round(this.stats.frameCount / this.stats.fpsTimer);
      this.stats.frameCount = 0;
      this.stats.fpsTimer = 0;
    }
  }

  recordShot(weaponId) {
    if (this.stats.shotsFiredByWeapon[weaponId] !== undefined) {
      this.stats.shotsFiredByWeapon[weaponId]++;
    }
  }

  recordDamage(source, amount) {
    const val = Math.max(0, amount);
    this.stats.totalDamageDealt += val;

    let key = source;
    if (source === 'normal') key = 'kinetic';
    if (source === 'burn') key = 'flame';
    if (source === 'explosion') key = 'bomb';
    if (source === 'crit') key = 'lightning';

    if (this.stats.damageBySource[key] !== undefined) {
      this.stats.damageBySource[key] += val;
    }
  }

  recordSpawn(type) {
    if (this.stats.enemySpawnCountByType[type] !== undefined) {
      this.stats.enemySpawnCountByType[type]++;
    }
  }

  recordKill(type) {
    this.stats.totalKills++;
    if (this.stats.enemyKilledByType[type] !== undefined) {
      this.stats.enemyKilledByType[type]++;
    }
  }

  getSnapshot() {
    const scene = this.engine.sceneManager.currentScene;
    const turret = scene?.turret;
    const shield = scene?.shield;
    const spawner = scene?.spawner;

    const totalDmg = Math.max(1, this.stats.totalDamageDealt);
    const damageBreakdown = {};
    for (const [src, dmg] of Object.entries(this.stats.damageBySource)) {
      damageBreakdown[src] = {
        damage: Math.round(dmg),
        percentage: `${((dmg / totalDmg) * 100).toFixed(1)}%`,
        dps: (dmg / Math.max(1, this.stats.gameTime)).toFixed(1)
      };
    }

    const weaponLoadout = turret ? turret.equippedWeapons.map(w => ({
      id: w.id,
      tier: w.tier,
      cooldown: w.cooldown ? w.cooldown.toFixed(2) : '0',
      baseCooldown: w.baseCooldown,
      damage: w.damage || w.directDamage || 0,
      shots: this.stats.shotsFiredByWeapon[w.id] || 0
    })) : [];

    return {
      time: `${Math.floor(this.stats.gameTime / 60)}m ${Math.floor(this.stats.gameTime % 60)}s`,
      fps: this.stats.fps,
      wave: spawner ? spawner.currentWave : 1,
      waveProgress: spawner ? `${spawner.waveTimer.toFixed(1)}s / ${spawner.waveDuration}s` : 'N/A',
      enemiesAlive: spawner ? spawner.enemies.length : 0,
      totalKills: this.stats.totalKills,
      totalDamageDealt: Math.round(this.stats.totalDamageDealt),
      overallDps: (this.stats.totalDamageDealt / Math.max(1, this.stats.gameTime)).toFixed(1),
      playerLevel: scene ? scene.level : 1,
      playerXp: scene ? `${scene.xp} / ${scene.nextXp}` : '0',
      turretHp: turret ? `${Math.round(turret.currentHp)} / ${turret.maxHp}` : '0',
      shieldHp: shield ? `${Math.round(shield.currentHp)} / ${shield.maxHp} (Radius: ${shield.radius})` : '0',
      weaponLoadout,
      damageBreakdown,
      enemyKills: this.stats.enemyKilledByType,
      enemySpawns: this.stats.enemySpawnCountByType
    };
  }

  dumpStats() {
    const snap = this.getSnapshot();
    console.log('====================================================');
    console.log('📊 GALAXY SHOOTER GAME BALANCE SUMMARY');
    console.log('====================================================');
    console.log(`⏱️ Survived: ${snap.time} | FPS: ${snap.fps} | Wave: ${snap.wave} (${snap.waveProgress})`);
    console.log(`💀 Kills: ${snap.totalKills} | Enemies Alive: ${snap.enemiesAlive} | Total Damage: ${snap.totalDamageDealt} (DPS: ${snap.overallDps})`);
    console.log(`🛡️ Turret HP: ${snap.turretHp} | Shield HP: ${snap.shieldHp} | Level: ${snap.playerLevel} (XP: ${snap.playerXp})`);
    console.log('----------------------------------------------------');
    console.log('🔫 EQUIPPED WEAPONS & PERFORMANCE:');
    console.table(snap.weaponLoadout);
    console.log('----------------------------------------------------');
    console.log('💥 DAMAGE BREAKDOWN BY SOURCE:');
    console.table(snap.damageBreakdown);
    console.log('----------------------------------------------------');
    console.log('👾 ENEMY DESTRUCTION STATS:');
    console.table({
      'Killed': snap.enemyKills,
      'Spawned': snap.enemySpawns
    });
    console.log('====================================================');
    return snap;
  }
}
