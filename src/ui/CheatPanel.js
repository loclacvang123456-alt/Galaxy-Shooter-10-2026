import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { CONFIG } from '../config.js';
import {
  WEAPON_DEFINITIONS,
  PASSIVE_DEFINITIONS,
  WEAPON_TYPES,
  PASSIVE_TYPES,
  getSynergy,
  getPassiveSynergy
} from '../weapons/WeaponRegistry.js';
import { renderIcon } from './IconRenderer.js';

export class CheatPanel {
  constructor(engine, scene) {
    this.engine = engine;
    this.scene = scene;
    this.isVisible = false;
    this.activeTab = 0; // 0: Weapons, 1: Passives, 2: Stats & Game, 3: Synergies

    this.panelWidth = 920;
    this.panelHeight = 560;

    this.container = new Container();
    this.container.visible = false;
    this.engine.uiLayer.addChild(this.container);

    this.secretTapCount = 0;
    this.lastTapTime = 0;
    this.updateTicker = 0;

    this.setupPanel();
    this.setupListeners();

    // Expose on global window only if cheat is enabled
    if (typeof window !== 'undefined' && this.isCheatEnabled()) {
      window.__cheatPanel = this;
      window.__toggleCheat = () => this.toggle();
    }
  }

  isCheatEnabled() {
    if (typeof window === 'undefined') return true;
    if (CONFIG.ENABLE_CHEATS) return true;
    try {
      const params = new URLSearchParams(window.location?.search || '');
      if (params.get('debug') === '1' || params.get('debug') === 'true' || params.get('cheat') === '1') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  setupListeners() {
    // 1. Secret Hotkeys: ~ (Backquote), F2, Shift + C
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Backquote' || e.code === 'F2' || (e.shiftKey && e.code === 'KeyC')) {
        if (!this.isCheatEnabled()) return;
        e.preventDefault();
        this.toggle();
      } else if (e.code === 'Escape' && this.isVisible) {
        this.toggle();
      }
    });

    // 2. Secret Triple-Click on Top-Left Corner (x < 70, y < 70)
    window.addEventListener('pointerdown', (e) => {
      if (!this.isCheatEnabled()) return;
      const rect = this.engine.app?.canvas?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = this.engine.width / rect.width;
      const scaleY = this.engine.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (x >= 0 && x <= 75 && y >= 0 && y <= 75) {
        const now = performance.now();
        if (now - this.lastTapTime < 500) {
          this.secretTapCount++;
          if (this.secretTapCount >= 3) {
            this.secretTapCount = 0;
            this.toggle();
          }
        } else {
          this.secretTapCount = 1;
        }
        this.lastTapTime = now;
      }
    });
  }

  toggle() {
    if (!this.isCheatEnabled()) {
      this.isVisible = false;
      this.container.visible = false;
      return false;
    }
    this.isVisible = !this.isVisible;
    this.container.visible = this.isVisible;
    if (this.isVisible) {
      audio.playPowerUp?.(1.5);
      this.refresh();
    } else {
      audio.playClick?.();
    }
    return this.isVisible;
  }

  show() {
    if (!this.isVisible) this.toggle();
  }

  hide() {
    if (this.isVisible) this.toggle();
  }

  setupPanel() {
    this.bg = new Graphics();
    this.container.addChild(this.bg);

    this.headerContainer = new Container();
    this.container.addChild(this.headerContainer);

    this.tabBarContainer = new Container();
    this.container.addChild(this.tabBarContainer);

    this.contentContainer = new Container();
    this.container.addChild(this.contentContainer);
  }

  update(dt) {
    if (!this.isVisible) return;
    this.updateTicker += dt;
    if (this.updateTicker >= 0.35) {
      this.updateTicker = 0;
      this.refreshStatusHeader();
    }
  }

  refresh() {
    const px = Math.round((this.engine.width - this.panelWidth) / 2);
    const py = Math.round((this.engine.height - this.panelHeight) / 2);
    this.container.x = px;
    this.container.y = py;

    // Render Window Chrome
    this.bg.clear();
    // Dimmed backlight shadow
    this.bg.roundRect(-4, -4, this.panelWidth + 8, this.panelHeight + 8, 18);
    this.bg.stroke({ width: 3, color: 0x00f0ff, alpha: 0.65 });
    // Cyber frame
    this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 16);
    this.bg.fill({ color: 0x070d1d, alpha: 0.96 });
    this.bg.roundRect(0, 0, this.panelWidth, this.panelHeight, 16);
    this.bg.stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });

    // Inner header bar separator
    this.bg.rect(0, 52, this.panelWidth, 1);
    this.bg.fill({ color: 0x1e293b });

    // Tab bar separator
    this.bg.rect(0, 96, this.panelWidth, 1);
    this.bg.fill({ color: 0x1e293b });

    this.renderHeader();
    this.renderTabs();
    this.renderContent();
  }

  renderHeader() {
    this.headerContainer.removeChildren();

    // Title
    const title = new Text({
      text: '⚡ DEVELOPER CHEAT CONSOLE  [Phím: ~ / F2 / Shift+C]',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace, system-ui',
        fontSize: 15,
        fontWeight: '900',
        fill: '#00f0ff',
        dropShadow: { color: '#00f0ff', blur: 6, distance: 0 }
      })
    });
    title.x = 20;
    title.y = 17;
    this.headerContainer.addChild(title);

    // Live status indicator
    this.statusText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace',
        fontSize: 12,
        fill: '#94a3b8'
      })
    });
    this.statusText.x = 440;
    this.statusText.y = 18;
    this.headerContainer.addChild(this.statusText);
    this.refreshStatusHeader();

    // Pause Toggle Button
    const isPaused = this.engine.isPaused;
    const pauseBtn = this.createButton({
      text: isPaused ? '▶ TIẾP TỤC' : '⏸ TẠM DỪNG',
      x: this.panelWidth - 170,
      y: 12,
      width: 95,
      height: 28,
      bgColor: isPaused ? 0x16a34a : 0x0284c7,
      textColor: '#ffffff',
      fontSize: 11,
      onClick: () => {
        if (this.engine.isPaused) {
          this.engine.resume();
        } else {
          this.engine.pause();
        }
        this.renderHeader();
      }
    });
    this.headerContainer.addChild(pauseBtn);

    // Close Button [X]
    const closeBtn = this.createButton({
      text: '✖ ĐÓNG',
      x: this.panelWidth - 65,
      y: 12,
      width: 50,
      height: 28,
      bgColor: 0x334155,
      textColor: '#ffffff',
      fontSize: 11,
      onClick: () => this.toggle()
    });
    this.headerContainer.addChild(closeBtn);
  }

  refreshStatusHeader() {
    if (!this.statusText || !this.scene) return;
    const god = this.scene.godMode ? '🛡️GOD:BẬT' : 'GOD:TẮT';
    const hp = this.scene.turret ? `${Math.round(this.scene.turret.currentHp)}/${this.scene.turret.maxHp}` : '0';
    const lv = this.scene.level || 1;
    const wave = this.scene.spawner?.currentWave || 1;
    this.statusText.text = `[${god} | HP:${hp} | Lv:${lv} | Wave:${wave}]`;
    this.statusText.style.fill = this.scene.godMode ? '#ffd700' : '#94a3b8';
  }

  renderTabs() {
    this.tabBarContainer.removeChildren();

    const tabs = [
      { id: 0, label: '⚔️ VŨ KHÍ (10 WEAPONS)' },
      { id: 1, label: '🔮 BUFF / PASSIVE (9 BUFFS)' },
      { id: 2, label: '⚙️ CHỈ SỐ & GAME (STATS)' },
      { id: 3, label: '🧬 HỢP NHẤT (SYNERGIES)' }
    ];

    const tabWidth = (this.panelWidth - 40) / tabs.length;
    tabs.forEach((tab, index) => {
      const isActive = this.activeTab === tab.id;
      const tabBtn = new Container();
      tabBtn.x = 20 + index * tabWidth;
      tabBtn.y = 58;
      tabBtn.eventMode = 'static';
      tabBtn.cursor = 'pointer';

      const g = new Graphics();
      g.roundRect(2, 0, tabWidth - 4, 32, 6);
      g.fill({ color: isActive ? 0x0284c7 : 0x0f172a, alpha: isActive ? 0.95 : 0.6 });
      g.roundRect(2, 0, tabWidth - 4, 32, 6);
      g.stroke({ width: 1.5, color: isActive ? 0x00f0ff : 0x334155 });
      tabBtn.addChild(g);

      const label = new Text({
        text: tab.label,
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 12,
          fontWeight: isActive ? '900' : '600',
          fill: isActive ? '#00f0ff' : '#94a3b8'
        })
      });
      label.anchor.set(0.5);
      label.x = tabWidth / 2;
      label.y = 16;
      tabBtn.addChild(label);

      tabBtn.on('pointerdown', (e) => {
        e.stopPropagation();
        audio.playClick?.();
        this.activeTab = tab.id;
        this.renderTabs();
        this.renderContent();
      });

      this.tabBarContainer.addChild(tabBtn);
    });
  }

  renderContent() {
    this.contentContainer.removeChildren();
    switch (this.activeTab) {
      case 0:
        this.renderWeaponsTab();
        break;
      case 1:
        this.renderPassivesTab();
        break;
      case 2:
        this.renderStatsTab();
        break;
      case 3:
        this.renderSynergiesTab();
        break;
    }
  }

  // ==========================================
  // TAB 0: VŨ KHÍ (WEAPONS)
  // ==========================================
  renderWeaponsTab() {
    const list = Object.values(WEAPON_DEFINITIONS);
    const colWidth = 430;
    const rowHeight = 76;
    const startY = 106;

    list.forEach((def, index) => {
      const col = index < 5 ? 0 : 1;
      const row = index % 5;
      const x = 20 + col * (colWidth + 20);
      const y = startY + row * (rowHeight + 6);

      const equipped = this.scene.turret?.equippedWeapons.find(w => w.id === def.id);
      const currentTier = equipped ? equipped.tier : 0;

      const card = new Container();
      card.x = x;
      card.y = y;

      const g = new Graphics();
      g.roundRect(0, 0, colWidth, rowHeight, 8);
      g.fill({ color: equipped ? 0x0f1f38 : 0x0a1020, alpha: 0.9 });
      g.roundRect(0, 0, colWidth, rowHeight, 8);
      g.stroke({
        width: 1.5,
        color: equipped ? (currentTier === 5 ? 0xff0055 : 0x00f0ff) : 0x1e293b
      });
      card.addChild(g);

      // Icon
      renderIcon(g, def.id, 24, 24, 11, def.color);

      // Name & Status
      const nameText = new Text({
        text: def.name,
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 'bold',
          fill: def.color ? '#' + def.color.toString(16).padStart(6, '0') : '#ffffff'
        })
      });
      nameText.x = 44;
      nameText.y = 8;
      card.addChild(nameText);

      const statusBadge = new Text({
        text: equipped ? `[ĐANG TRANG BỊ - CẤP ${currentTier}]` : '[CHƯA TRANG BỊ]',
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 'bold',
          fill: equipped ? (currentTier === 5 ? '#ff0055' : '#00ff66') : '#64748b'
        })
      });
      statusBadge.x = 44;
      statusBadge.y = 26;
      card.addChild(statusBadge);

      // Level Buttons: [Lv 1] [Lv 2] [Lv 3] [Lv 4] [Lv 5 ★]
      const btnW = 46;
      const btnH = 24;
      const btnY = 44;

      for (let t = 1; t <= 5; t++) {
        const isCurrent = currentTier === t;
        const isTier5 = t === 5;
        const btn = this.createButton({
          text: isTier5 ? '★ 5' : `Lv ${t}`,
          x: 44 + (t - 1) * (btnW + 6),
          y: btnY,
          width: btnW,
          height: btnH,
          bgColor: isCurrent ? (isTier5 ? 0xff0055 : 0x0284c7) : 0x1e293b,
          textColor: isCurrent ? '#ffffff' : (isTier5 ? '#ffd700' : '#cbd5e1'),
          strokeColor: isCurrent ? (isTier5 ? 0xffea00 : 0x00f0ff) : 0x334155,
          fontSize: 11,
          onClick: () => {
            this.scene.setWeaponTier(def.id, t);
            this.renderWeaponsTab();
            this.refreshStatusHeader();
          }
        });
        card.addChild(btn);
      }

      // Unequip Button [X GỠ] (if equipped)
      if (equipped) {
        const unequipBtn = this.createButton({
          text: '✖ GỠ',
          x: colWidth - 56,
          y: 8,
          width: 48,
          height: 22,
          bgColor: 0x471515,
          textColor: '#ef4444',
          strokeColor: 0xef4444,
          fontSize: 9,
          onClick: () => {
            this.scene.removeWeapon(def.id);
            this.renderWeaponsTab();
            this.refreshStatusHeader();
          }
        });
        card.addChild(unequipBtn);
      } else {
        // Equip Button
        const equipBtn = this.createButton({
          text: '+ LẮP',
          x: colWidth - 56,
          y: 8,
          width: 48,
          height: 22,
          bgColor: 0x064e3b,
          textColor: '#10b981',
          strokeColor: 0x10b981,
          fontSize: 9,
          onClick: () => {
            this.scene.setWeaponTier(def.id, 1);
            this.renderWeaponsTab();
            this.refreshStatusHeader();
          }
        });
        card.addChild(equipBtn);
      }

      // Sub-Upgrade Button [+Sub]
      const subBtn = this.createButton({
        text: '+SUB',
        x: colWidth - 60,
        y: btnY,
        width: 52,
        height: btnH,
        bgColor: 0x312e81,
        textColor: '#a5b4fc',
        strokeColor: 0x6366f1,
        fontSize: 10,
        onClick: () => {
          if (!equipped) {
            this.scene.setWeaponTier(def.id, 1);
          }
          const w = this.scene.turret?.equippedWeapons.find(item => item.id === def.id);
          if (w) {
            w.applySubUpgrade('damage');
          }
          this.renderWeaponsTab();
        }
      });
      card.addChild(subBtn);

      this.contentContainer.addChild(card);
    });

    // Quick Bottom Toolbar
    const bottomY = startY + 5 * (rowHeight + 6) + 6;

    const maxCurBtn = this.createButton({
      text: '🔥 MAX CÁC VŨ KHÍ ĐANG TRANG BỊ (LV 5)',
      x: 20,
      y: bottomY,
      width: 280,
      height: 32,
      bgColor: 0x831843,
      textColor: '#f472b6',
      strokeColor: 0xec4899,
      fontSize: 11,
      onClick: () => {
        this.scene.maxEquippedWeapons();
        this.renderWeaponsTab();
        this.refreshStatusHeader();
      }
    });
    this.contentContainer.addChild(maxCurBtn);

    const equipAllBtn = this.createButton({
      text: '⚡ LẮP CẢ 10 VŨ KHÍ MAX TIER 5 (CHAOS MODE)',
      x: 315,
      y: bottomY,
      width: 320,
      height: 32,
      bgColor: 0x701a75,
      textColor: '#e879f9',
      strokeColor: 0xd946ef,
      fontSize: 11,
      onClick: () => {
        this.scene.equipAllWeaponsMax();
        this.renderWeaponsTab();
        this.refreshStatusHeader();
      }
    });
    this.contentContainer.addChild(equipAllBtn);

    const clearBtn = this.createButton({
      text: '🧹 GỠ TẤT CẢ VŨ KHÍ',
      x: 650,
      y: bottomY,
      width: 170,
      height: 32,
      bgColor: 0x334155,
      textColor: '#ffffff',
      fontSize: 11,
      onClick: () => {
        this.scene.removeAllWeapons();
        this.renderWeaponsTab();
        this.refreshStatusHeader();
      }
    });
    this.contentContainer.addChild(clearBtn);
  }

  // ==========================================
  // TAB 1: BUFF / PASSIVE (9 PASSIVES)
  // ==========================================
  renderPassivesTab() {
    const list = Object.values(PASSIVE_DEFINITIONS);
    const colWidth = 430;
    const rowHeight = 76;
    const startY = 106;

    list.forEach((def, index) => {
      const col = index < 5 ? 0 : 1;
      const row = index % 5;
      const x = 20 + col * (colWidth + 20);
      const y = startY + row * (rowHeight + 6);

      let currentTier = 0;
      if (def.id === PASSIVE_TYPES.SHIELD) {
        currentTier = this.scene.shield?.tier || 1;
      } else if (this.scene.passives && this.scene.passives[def.id]) {
        currentTier = this.scene.passives[def.id].tier || 0;
      }

      const isActive = currentTier > 0;
      const card = new Container();
      card.x = x;
      card.y = y;

      const g = new Graphics();
      g.roundRect(0, 0, colWidth, rowHeight, 8);
      g.fill({ color: isActive ? 0x0f1f38 : 0x0a1020, alpha: 0.9 });
      g.roundRect(0, 0, colWidth, rowHeight, 8);
      g.stroke({
        width: 1.5,
        color: isActive ? (currentTier === 5 ? 0xffd700 : 0x00f0ff) : 0x1e293b
      });
      card.addChild(g);

      // Icon
      renderIcon(g, def.id, 24, 24, 11, def.color || 0x00f0ff);

      // Name & Status
      const nameText = new Text({
        text: def.name,
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 'bold',
          fill: def.color ? '#' + def.color.toString(16).padStart(6, '0') : '#ffffff'
        })
      });
      nameText.x = 44;
      nameText.y = 8;
      card.addChild(nameText);

      const statusBadge = new Text({
        text: isActive ? `[ĐANG KÍCH HOẠT - CẤP ${currentTier}${currentTier === 5 ? ' MAX' : ''}]` : '[CHƯA KÍCH HOẠT]',
        style: new TextStyle({
          fontFamily: 'system-ui, sans-serif',
          fontSize: 10,
          fontWeight: 'bold',
          fill: isActive ? (currentTier === 5 ? '#ffd700' : '#10b981') : '#64748b'
        })
      });
      statusBadge.x = 44;
      statusBadge.y = 26;
      card.addChild(statusBadge);

      // Buttons: [Tắt (0)] [1] [2] [3] [4] [5 ★]
      const btnW = 54;
      const btnH = 24;
      const btnY = 44;

      // Disable / Tier 0 Button
      const isOff = currentTier === 0;
      const offBtn = this.createButton({
        text: 'Tắt (0)',
        x: 44,
        y: btnY,
        width: btnW,
        height: btnH,
        bgColor: isOff ? 0x471515 : 0x1e293b,
        textColor: isOff ? '#ef4444' : '#64748b',
        strokeColor: isOff ? 0xef4444 : 0x334155,
        fontSize: 10,
        onClick: () => {
          this.scene.setPassiveTier(def.id, 0);
          this.renderPassivesTab();
        }
      });
      card.addChild(offBtn);

      for (let t = 1; t <= 5; t++) {
        const isCurrent = currentTier === t;
        const isMax = t === 5;
        const btn = this.createButton({
          text: isMax ? '★ 5' : `Lv ${t}`,
          x: 44 + btnW + 6 + (t - 1) * (btnW + 6),
          y: btnY,
          width: btnW,
          height: btnH,
          bgColor: isCurrent ? (isMax ? 0xb45309 : 0x0284c7) : 0x1e293b,
          textColor: isCurrent ? '#ffffff' : (isMax ? '#ffd700' : '#cbd5e1'),
          strokeColor: isCurrent ? (isMax ? 0xffea00 : 0x00f0ff) : 0x334155,
          fontSize: 11,
          onClick: () => {
            this.scene.setPassiveTier(def.id, t);
            this.renderPassivesTab();
          }
        });
        card.addChild(btn);
      }

      this.contentContainer.addChild(card);
    });

    // Quick Bottom Toolbar
    const bottomY = startY + 5 * (rowHeight + 6) + 6;

    const maxAllBtn = this.createButton({
      text: '✨ BẬT TẤT CẢ 9 BUFF LÊN MAX (LV 5)',
      x: 20,
      y: bottomY,
      width: 320,
      height: 32,
      bgColor: 0xb45309,
      textColor: '#fef08a',
      strokeColor: 0xfacc15,
      fontSize: 12,
      onClick: () => {
        this.scene.maxAllPassives();
        this.renderPassivesTab();
      }
    });
    this.contentContainer.addChild(maxAllBtn);

    const resetAllBtn = this.createButton({
      text: '🚫 TẮT TOÀN BỘ BUFF (VỀ 0)',
      x: 360,
      y: bottomY,
      width: 220,
      height: 32,
      bgColor: 0x334155,
      textColor: '#ffffff',
      fontSize: 12,
      onClick: () => {
        this.scene.resetAllPassives();
        this.renderPassivesTab();
      }
    });
    this.contentContainer.addChild(resetAllBtn);
  }

  // ==========================================
  // TAB 2: CHỈ SỐ & GAME (STATS)
  // ==========================================
  renderStatsTab() {
    const startY = 110;

    // SECTION 1: CẤP ĐỘ & EXP
    const sec1 = new Container();
    sec1.x = 20;
    sec1.y = startY;

    const g1 = new Graphics();
    g1.roundRect(0, 0, 880, 100, 8);
    g1.fill({ color: 0x0f172a, alpha: 0.8 });
    g1.roundRect(0, 0, 880, 100, 8);
    g1.stroke({ width: 1.5, color: 0x0284c7 });
    sec1.addChild(g1);

    const t1 = new Text({
      text: `👑 CẤP ĐỘ NGƯỜI CHƠI & KINH NGHIỆM  [Cấp hiện tại: ${this.scene.level} | EXP: ${this.scene.xp}/${this.scene.nextXp} | Điểm: ${this.scene.score}]`,
      style: new TextStyle({ fontFamily: 'system-ui', fontSize: 13, fontWeight: 'bold', fill: '#00f0ff' })
    });
    t1.x = 16;
    t1.y = 10;
    sec1.addChild(t1);

    // Level adjustment buttons
    const lvDeltas = [
      { text: '+1 CẤP', delta: 1 },
      { text: '+5 CẤP', delta: 5 },
      { text: '+10 CẤP', delta: 10 },
      { text: 'SET LV 1', set: 1 },
      { text: 'SET LV 10', set: 10 },
      { text: 'SET LV 20', set: 20 },
      { text: 'SET LV 50 ★', set: 50 }
    ];

    lvDeltas.forEach((item, idx) => {
      const btn = this.createButton({
        text: item.text,
        x: 16 + idx * 82,
        y: 34,
        width: 76,
        height: 26,
        bgColor: item.set === 50 ? 0xb45309 : 0x1e293b,
        textColor: item.set === 50 ? '#ffd700' : '#ffffff',
        fontSize: 10,
        onClick: () => {
          if (item.set !== undefined) {
            this.scene.setLevel(item.set);
          } else {
            this.scene.setLevel(this.scene.level + item.delta);
          }
          this.renderStatsTab();
          this.refreshStatusHeader();
        }
      });
      sec1.addChild(btn);
    });

    const expBtn1 = this.createButton({
      text: '+5,000 EXP',
      x: 16,
      y: 66,
      width: 100,
      height: 24,
      bgColor: 0x047857,
      textColor: '#6ee7b7',
      fontSize: 10,
      onClick: () => {
        this.scene.addXp(5000);
        this.renderStatsTab();
      }
    });
    sec1.addChild(expBtn1);

    const expBtn2 = this.createButton({
      text: '+50,000 EXP',
      x: 124,
      y: 66,
      width: 110,
      height: 24,
      bgColor: 0x065f46,
      textColor: '#a7f3d0',
      fontSize: 10,
      onClick: () => {
        this.scene.addXp(50000);
        this.renderStatsTab();
      }
    });
    sec1.addChild(expBtn2);

    const popupUpgradeBtn = this.createButton({
      text: '🎁 MỞ BẢNG CHỌN NÂNG CẤP (UPGRADE POPUP)',
      x: 244,
      y: 66,
      width: 290,
      height: 24,
      bgColor: 0x581c87,
      textColor: '#e9d5ff',
      fontSize: 10,
      onClick: () => {
        this.toggle(); // Close cheat panel and open upgrade modal
        this.scene.triggerLevelUp();
      }
    });
    sec1.addChild(popupUpgradeBtn);

    this.contentContainer.addChild(sec1);

    // SECTION 2: BẤT TỬ & SINH LỰC (GOD MODE & HP)
    const sec2 = new Container();
    sec2.x = 20;
    sec2.y = startY + 112;

    const g2 = new Graphics();
    g2.roundRect(0, 0, 880, 90, 8);
    g2.fill({ color: 0x0f172a, alpha: 0.8 });
    g2.roundRect(0, 0, 880, 90, 8);
    g2.stroke({ width: 1.5, color: 0x10b981 });
    sec2.addChild(g2);

    const t2 = new Text({
      text: '🛡️ SINH TỒN & BẤT TỬ (SURVIVAL & GOD MODE)',
      style: new TextStyle({ fontFamily: 'system-ui', fontSize: 13, fontWeight: 'bold', fill: '#10b981' })
    });
    t2.x = 16;
    t2.y = 10;
    sec2.addChild(t2);

    // God mode toggle
    const isGod = !!this.scene.godMode;
    const godBtn = this.createButton({
      text: isGod ? '🛡️ GOD MODE: ĐANG BẬT [BẤT TỬ]' : '🛡️ GOD MODE: ĐANG TẮT',
      x: 16,
      y: 38,
      width: 240,
      height: 38,
      bgColor: isGod ? 0xb45309 : 0x1e293b,
      textColor: isGod ? '#ffd700' : '#94a3b8',
      strokeColor: isGod ? 0xfacc15 : 0x475569,
      fontSize: 12,
      onClick: () => {
        this.scene.godMode = !this.scene.godMode;
        if (this.scene.godMode) {
          this.scene.fullHeal();
        }
        this.renderStatsTab();
        this.refreshStatusHeader();
      }
    });
    sec2.addChild(godBtn);

    const healBtn = this.createButton({
      text: '❤️ HỒI ĐẦY 100% MÁU & LÁ CHẮN',
      x: 268,
      y: 38,
      width: 240,
      height: 38,
      bgColor: 0x991b1b,
      textColor: '#fecaca',
      strokeColor: 0xef4444,
      fontSize: 12,
      onClick: () => {
        this.scene.fullHeal();
        this.refreshStatusHeader();
      }
    });
    sec2.addChild(healBtn);

    const superShieldBtn = this.createButton({
      text: '⚡ SIÊU LÁ CHẮN (MAX HP x 10)',
      x: 520,
      y: 38,
      width: 220,
      height: 38,
      bgColor: 0x0e7490,
      textColor: '#cffafe',
      strokeColor: 0x06b6d4,
      fontSize: 12,
      onClick: () => {
        if (this.scene.shield) {
          this.scene.shield.maxHp = 1000;
          this.scene.shield.currentHp = 1000;
          this.scene.shield.radius = 160;
        }
        if (this.scene.turret) {
          this.scene.turret.maxHp = 1000;
          this.scene.turret.currentHp = 1000;
        }
        audio.playPowerUp?.(1.8);
        this.refreshStatusHeader();
      }
    });
    sec2.addChild(superShieldBtn);

    this.contentContainer.addChild(sec2);

    // SECTION 3: WAVE & QUÁI VẬT (ENEMIES & COMBAT)
    const sec3 = new Container();
    sec3.x = 20;
    sec3.y = startY + 214;

    const g3 = new Graphics();
    g3.roundRect(0, 0, 880, 115, 8);
    g3.fill({ color: 0x0f172a, alpha: 0.8 });
    g3.roundRect(0, 0, 880, 115, 8);
    g3.stroke({ width: 1.5, color: 0xef4444 });
    sec3.addChild(g3);

    const t3 = new Text({
      text: `💀 QUÁI VẬT & WAVE CHIẾN ĐẤU  [Wave: ${this.scene.spawner?.currentWave} | Quái sống: ${this.scene.spawner?.enemies.filter(e => e.isAlive).length || 0}]`,
      style: new TextStyle({ fontFamily: 'system-ui', fontSize: 13, fontWeight: 'bold', fill: '#ef4444' })
    });
    t3.x = 16;
    t3.y = 10;
    sec3.addChild(t3);

    const killAllBtn = this.createButton({
      text: '💀 TIÊU DIỆT TOÀN BỘ QUÁI NGAY',
      x: 16,
      y: 36,
      width: 250,
      height: 32,
      bgColor: 0x7f1d1d,
      textColor: '#fca5a5',
      strokeColor: 0xef4444,
      fontSize: 11,
      onClick: () => {
        this.scene.killAllEnemies();
        this.renderStatsTab();
      }
    });
    sec3.addChild(killAllBtn);

    const nextWaveBtn = this.createButton({
      text: '⏭️ QUA WAVE TIẾP THEO',
      x: 278,
      y: 36,
      width: 190,
      height: 32,
      bgColor: 0xb45309,
      textColor: '#fef08a',
      fontSize: 11,
      onClick: () => {
        this.scene.nextWave();
        this.renderStatsTab();
        this.refreshStatusHeader();
      }
    });
    sec3.addChild(nextWaveBtn);

    const spawnBossBtn = this.createButton({
      text: '👹 TRIỆU HỒI MEGA BOSS NGAY',
      x: 480,
      y: 36,
      width: 230,
      height: 32,
      bgColor: 0x831843,
      textColor: '#fbcfe8',
      strokeColor: 0xf43f5e,
      fontSize: 11,
      onClick: () => {
        this.scene.spawnMegaBossNow();
        this.renderStatsTab();
      }
    });
    sec3.addChild(spawnBossBtn);

    const magnetBtn = this.createButton({
      text: '💎 HÚT TẤT CẢ NGỌC EXP',
      x: 720,
      y: 36,
      width: 145,
      height: 32,
      bgColor: 0x065f46,
      textColor: '#6ee7b7',
      fontSize: 11,
      onClick: () => {
        this.scene.magnetAllGems();
      }
    });
    sec3.addChild(magnetBtn);

    // Specific wave jumps
    const waveJumps = [
      { text: 'Wave 1', wave: 1 },
      { text: 'Wave 5 (Boss 1)', wave: 5 },
      { text: 'Wave 10 (Boss 2)', wave: 10 },
      { text: 'Wave 15 (Boss 3)', wave: 15 },
      { text: 'Wave 20 (Boss 4)', wave: 20 },
      { text: 'Wave 25 (Boss 5)', wave: 25 },
      { text: 'Wave 30 (Ultra)', wave: 30 }
    ];

    waveJumps.forEach((item, idx) => {
      const btn = this.createButton({
        text: item.text,
        x: 16 + idx * 122,
        y: 76,
        width: 116,
        height: 26,
        bgColor: 0x1e293b,
        textColor: '#e2e8f0',
        fontSize: 10,
        onClick: () => {
          this.scene.setWave(item.wave);
          this.renderStatsTab();
          this.refreshStatusHeader();
        }
      });
      sec3.addChild(btn);
    });

    this.contentContainer.addChild(sec3);
  }

  // ==========================================
  // TAB 3: HỢP NHẤT (SYNERGIES)
  // ==========================================
  renderSynergiesTab() {
    const startY = 110;
    const activeSyns = this.scene.turret?.activeSynergies || [];

    // Header info
    const infoText = new Text({
      text: `🧬 KẾT HỢP VŨ KHÍ & BUFF [Đang kích hoạt: ${activeSyns.length} Fusions (Tối đa 2 fusions/vũ khí)]`,
      style: new TextStyle({ fontFamily: 'system-ui', fontSize: 13, fontWeight: 'bold', fill: '#ffd700' })
    });
    infoText.x = 20;
    infoText.y = startY;
    this.contentContainer.addChild(infoText);

    // Quick Actions
    const unlockEquippedBtn = this.createButton({
      text: '🧬 TỰ ĐỘNG KÍCH HOẠT TẤT CẢ FUSION CỦA TRANG BỊ HIỆN TẠI',
      x: 20,
      y: startY + 26,
      width: 440,
      height: 32,
      bgColor: 0xb45309,
      textColor: '#fef08a',
      strokeColor: 0xfbbf24,
      fontSize: 11,
      onClick: () => {
        this.scene.unlockAllEquippedSynergies();
        this.renderSynergiesTab();
      }
    });
    this.contentContainer.addChild(unlockEquippedBtn);

    const clearSynBtn = this.createButton({
      text: '🧹 XÓA TẤT CẢ FUSION',
      x: 472,
      y: startY + 26,
      width: 190,
      height: 32,
      bgColor: 0x334155,
      textColor: '#ffffff',
      fontSize: 11,
      onClick: () => {
        this.scene.clearAllSynergies();
        this.renderSynergiesTab();
      }
    });
    this.contentContainer.addChild(clearSynBtn);

    // Active synergies cards list
    const activeContainer = new Container();
    activeContainer.x = 20;
    activeContainer.y = startY + 70;

    if (activeSyns.length === 0) {
      const emptyText = new Text({
        text: 'Hiện chưa có Fusion nào đang hoạt động. Bấm nút màu vàng ở trên hoặc chọn các Fusion mẫu bên dưới để kích hoạt ngay!',
        style: new TextStyle({ fontFamily: 'system-ui', fontSize: 12, fill: '#64748b' })
      });
      activeContainer.addChild(emptyText);
    } else {
      activeSyns.forEach((syn, idx) => {
        const syG = new Graphics();
        const syW = 420;
        const syH = 34;
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = col * (syW + 20);
        const sy = row * (syH + 6);

        syG.roundRect(sx, sy, syW, syH, 6);
        syG.fill({ color: 0x1e1b4b, alpha: 0.85 });
        syG.roundRect(sx, sy, syW, syH, 6);
        syG.stroke({ width: 1.5, color: syn.color || 0xffd700 });
        activeContainer.addChild(syG);

        const syTitle = new Text({
          text: `★ ${syn.name}`,
          style: new TextStyle({
            fontFamily: 'system-ui',
            fontSize: 11,
            fontWeight: 'bold',
            fill: syn.color ? '#' + syn.color.toString(16).padStart(6, '0') : '#ffd700'
          })
        });
        syTitle.x = sx + 10;
        syTitle.y = sy + 9;
        activeContainer.addChild(syTitle);
      });
    }

    this.contentContainer.addChild(activeContainer);

    // Curated Popular Synergies to 1-click test
    const popularY = startY + 190;
    const popTitle = new Text({
      text: '⭐ TOP CÁC KẾT HỢP MẠNH NHẤT (BẤM ĐỂ TRANG BỊ & KÍCH HOẠT NGAY):',
      style: new TextStyle({ fontFamily: 'system-ui', fontSize: 12, fontWeight: 'bold', fill: '#00f0ff' })
    });
    popTitle.x = 20;
    popTitle.y = popularY;
    this.contentContainer.addChild(popTitle);

    const curated = [
      {
        name: 'Tesla Doomsday Storm (Laser + Sét)',
        w: WEAPON_TYPES.LASER,
        p: PASSIVE_TYPES.LIGHTNING,
        desc: 'Tia laser bọc sét xích điện đa mục tiêu'
      },
      {
        name: 'Inferno Supernova Core (Bom + Phun Lửa)',
        w: WEAPON_TYPES.BOMB,
        w2: WEAPON_TYPES.FLAME,
        desc: 'Bom plasma nổ kích hoạt bão lửa magma toàn màn hình'
      },
      {
        name: 'Event Horizon Collapse (Pháo Hư Không + Hố Đen)',
        w: WEAPON_TYPES.VOID_RAILGUN,
        p: PASSIVE_TYPES.BLACK_HOLE,
        desc: 'Đạn hư không tạo lỗ sâu hút nén quái vật'
      },
      {
        name: 'Thor Charged Buzzsaw (Lưỡi Cưa + Sét)',
        w: WEAPON_TYPES.SAWBLADE,
        p: PASSIVE_TYPES.LIGHTNING,
        desc: 'Cưa plasma phóng bão sét liên tục'
      },
      {
        name: 'Frostfire Cataclysm (Băng + Lửa)',
        w: WEAPON_TYPES.CRYO,
        w2: WEAPON_TYPES.FLAME,
        desc: 'Gai băng tan chảy nổ sốc nhiệt plasma'
      },
      {
        name: 'Swarm Annihilator (Động Năng + Tên Lửa)',
        w: WEAPON_TYPES.KINETIC,
        w2: WEAPON_TYPES.MISSILE,
        desc: 'Xả đạn kinetic kèm loạt tên lửa mini'
      }
    ];

    curated.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cW = 425;
      const cH = 50;
      const cx = 20 + col * (cW + 15);
      const cy = popularY + 22 + row * (cH + 8);

      const card = new Container();
      card.x = cx;
      card.y = cy;

      const g = new Graphics();
      g.roundRect(0, 0, cW, cH, 6);
      g.fill({ color: 0x0f172a, alpha: 0.9 });
      g.roundRect(0, 0, cW, cH, 6);
      g.stroke({ width: 1.5, color: 0x38bdf8 });
      card.addChild(g);

      const tName = new Text({
        text: item.name,
        style: new TextStyle({ fontFamily: 'system-ui', fontSize: 11, fontWeight: 'bold', fill: '#00f0ff' })
      });
      tName.x = 10;
      tName.y = 8;
      card.addChild(tName);

      const tDesc = new Text({
        text: item.desc,
        style: new TextStyle({ fontFamily: 'system-ui', fontSize: 10, fill: '#94a3b8' })
      });
      tDesc.x = 10;
      tDesc.y = 26;
      card.addChild(tDesc);

      const actBtn = this.createButton({
        text: 'KÍCH HOẠT',
        x: cW - 88,
        y: 10,
        width: 78,
        height: 30,
        bgColor: 0x0284c7,
        textColor: '#ffffff',
        fontSize: 10,
        onClick: () => {
          this.scene.activateCuratedSynergy(item);
          this.renderSynergiesTab();
          this.refreshStatusHeader();
        }
      });
      card.addChild(actBtn);

      this.contentContainer.addChild(card);
    });
  }

  // ==========================================
  // HELPER: CREATE INTERACTIVE BUTTON
  // ==========================================
  createButton({
    text,
    x,
    y,
    width,
    height,
    bgColor = 0x1e293b,
    textColor = '#ffffff',
    strokeColor = 0x475569,
    fontSize = 11,
    onClick
  }) {
    const btn = new Container();
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const g = new Graphics();
    g.roundRect(0, 0, width, height, 5);
    g.fill({ color: bgColor });
    g.roundRect(0, 0, width, height, 5);
    g.stroke({ width: 1.2, color: strokeColor });
    btn.addChild(g);

    const label = new Text({
      text,
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize,
        fontWeight: 'bold',
        fill: textColor
      })
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = height / 2;
    btn.addChild(label);

    btn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick?.();
      onClick?.();
    });

    return btn;
  }
}
