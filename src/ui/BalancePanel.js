import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';

export class BalancePanel {
  constructor(engine, tracker) {
    this.engine = engine;
    this.tracker = tracker;
    this.isVisible = false;

    this.container = new Container();
    this.container.visible = false;
    this.engine.uiLayer.addChild(this.container);

    this.panelWidth = 580;
    this.panelHeight = 460;
    this.updateInterval = 0;

    this.setupPanel();
    this.setupHotkeys();
  }

  setupHotkeys() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyB') {
        this.toggle();
      }
    });
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.container.visible = this.isVisible;
    if (this.isVisible) {
      audio.playClick();
      this.refreshContent();
    }
    return this.isVisible;
  }

  setupPanel() {
    this.bg = new Graphics();
    this.container.addChild(this.bg);

    const titleStyle = new TextStyle({
      fontFamily: 'Consolas, monospace, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#00f0ff'
    });

    this.titleText = new Text({
      text: '⚙️ REAL-TIME BALANCE & COMBAT TELEMETRY [KEY: B]',
      style: titleStyle
    });
    this.container.addChild(this.titleText);

    this.bodyText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace, sans-serif',
        fontSize: 12,
        fill: '#cbd5e1',
        lineHeight: 18
      })
    });
    this.container.addChild(this.bodyText);

    // Dump Button
    this.dumpBtn = new Container();
    this.dumpBtn.eventMode = 'static';
    this.dumpBtn.cursor = 'pointer';
    const dumpG = new Graphics();
    dumpG.roundRect(0, 0, 160, 32, 6);
    dumpG.fill({ color: 0x0284c7 });
    dumpG.stroke({ width: 1.5, color: 0x38bdf8 });
    this.dumpBtn.addChild(dumpG);

    const dumpLabel = new Text({
      text: '📋 DUMP TO CONSOLE',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#ffffff'
      })
    });
    dumpLabel.anchor.set(0.5);
    dumpLabel.x = 80;
    dumpLabel.y = 16;
    this.dumpBtn.addChild(dumpLabel);

    this.dumpBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      this.tracker.dumpStats();
      dumpLabel.text = '✓ DUMPED TO CONSOLE!';
      setTimeout(() => {
        dumpLabel.text = '📋 DUMP TO CONSOLE';
      }, 1500);
    });
    this.container.addChild(this.dumpBtn);

    // Close Button
    this.closeBtn = new Container();
    this.closeBtn.eventMode = 'static';
    this.closeBtn.cursor = 'pointer';
    const closeG = new Graphics();
    closeG.roundRect(0, 0, 80, 32, 6);
    closeG.fill({ color: 0x334155 });
    closeG.stroke({ width: 1.5, color: 0x64748b });
    this.closeBtn.addChild(closeG);

    const closeLabel = new Text({
      text: 'CLOSE [B]',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#ffffff'
      })
    });
    closeLabel.anchor.set(0.5);
    closeLabel.x = 40;
    closeLabel.y = 16;
    this.closeBtn.addChild(closeLabel);

    this.closeBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    this.container.addChild(this.closeBtn);
  }

  update(dt) {
    if (!this.isVisible) return;

    this.updateInterval += dt;
    if (this.updateInterval >= 0.25) { // Refresh every 250ms
      this.updateInterval = 0;
      this.refreshContent();
    }
  }

  refreshContent() {
    const snap = this.tracker.getSnapshot();
    const px = (this.engine.width - this.panelWidth) / 2;
    const py = (this.engine.height - this.panelHeight) / 2;

    this.container.x = px;
    this.container.y = py;

    // Redraw box background
    this.bg.clear();
    this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 12);
    this.bg.fill({ color: 0x050816, alpha: 0.94 });
    this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 12);
    this.bg.stroke({ width: 2, color: 0x0284c7 });

    this.titleText.x = 20;
    this.titleText.y = 16;

    // Format text metrics
    let text = `TIME: ${snap.time}  |  FPS: ${snap.fps}  |  WAVE: ${snap.wave} (${snap.waveProgress})\n`;
    text += `TURRET HP: ${snap.turretHp}  |  SHIELD: ${snap.shieldHp}  |  LV: ${snap.playerLevel} (XP: ${snap.playerXp})\n`;
    text += `TOTAL DMG: ${snap.totalDamageDealt.toLocaleString()} (DPS: ${snap.overallDps})  |  KILLS: ${snap.totalKills}  |  ALIVE: ${snap.enemiesAlive}\n`;
    text += `----------------------------------------------------------------------\n`;
    text += `WEAPONS IN SERVICE:\n`;

    snap.weaponLoadout.forEach(w => {
      text += ` • [${w.id.toUpperCase()}] Tier ${w.tier} | Base CD: ${w.baseCooldown}s | Dmg: ${w.damage} | Shots: ${w.shots}\n`;
    });

    text += `----------------------------------------------------------------------\n`;
    text += `DAMAGE DISTRIBUTION BY SOURCE:\n`;
    const dmgEntries = Object.entries(snap.damageBreakdown)
      .filter(([_, d]) => d.damage > 0)
      .map(([src, d]) => `${src.toUpperCase()}: ${d.damage.toLocaleString()} (${d.percentage}) [DPS: ${d.dps}]`)
      .join('\n • ');

    text += dmgEntries ? ` • ${dmgEntries}\n` : ` • No damage recorded yet\n`;

    text += `----------------------------------------------------------------------\n`;
    text += `ENEMIES KILLED: Drone: ${snap.enemyKills.swarm} | Speeder: ${snap.enemyKills.speeder} | Tank: ${snap.enemyKills.tank} | Boss: ${snap.enemyKills.mega_boss}\n`;

    this.bodyText.text = text;
    this.bodyText.x = 20;
    this.bodyText.y = 45;

    // Position buttons at bottom
    this.dumpBtn.x = 20;
    this.dumpBtn.y = this.panelHeight - 48;

    this.closeBtn.x = this.panelWidth - 100;
    this.closeBtn.y = this.panelHeight - 48;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
