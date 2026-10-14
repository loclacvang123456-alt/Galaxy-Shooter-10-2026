import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { audio } from '../audio/AudioManager.js';
import { sdk } from '../sdk/SDKManager.js';
import { i18n, t } from '../core/i18n.js';

export class BossChestModal {
  constructor(engine, { onClaimFree, onClaimAd }) {
    this.engine = engine;
    this.onClaimFree = onClaimFree;
    this.onClaimAd = onClaimAd;

    this.container = new Container();
    this.container.visible = false;
    this.engine.uiLayer.addChild(this.container);

    this.modalWidth = 440;
    this.modalHeight = 360;
  }

  show(bossOrder = 1) {
    this.container.removeChildren();
    this.container.visible = true;

    // Dim Background Overlay
    const bg = new Graphics();
    bg.rect(0, 0, this.engine.width, this.engine.height);
    bg.fill({ color: 0x030712, alpha: 0.88 });
    bg.eventMode = 'static';
    this.container.addChild(bg);

    const boxX = (this.engine.width - this.modalWidth) / 2;
    const boxY = (this.engine.height - this.modalHeight) / 2;

    const box = new Graphics();
    box.roundRect(boxX, boxY, this.modalWidth, this.modalHeight, 16);
    box.fill({ color: 0x171206 });
    box.roundRect(boxX, boxY, this.modalWidth, this.modalHeight, 16);
    box.stroke({ width: 2.5, color: 0xffd700 });
    this.container.addChild(box);

    // Title
    const title = new Text({
      text: t('chest.title'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#ffd700',
        dropShadow: { color: '#ffea00', blur: 8, distance: 0 }
      })
    });
    title.anchor.set(0.5);
    title.x = this.engine.width / 2;
    title.y = boxY + 45;
    this.container.addChild(title);

    // Subtitle
    const sub = new Text({
      text: t('chest.subtitle'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#f59e0b'
      })
    });
    sub.anchor.set(0.5);
    sub.x = this.engine.width / 2;
    sub.y = boxY + 75;
    this.container.addChild(sub);

    // Chest Icon
    const chestIcon = new Text({
      text: '🎁',
      style: new TextStyle({ fontSize: 48 })
    });
    chestIcon.anchor.set(0.5);
    chestIcon.x = this.engine.width / 2;
    chestIcon.y = boxY + 130;
    this.container.addChild(chestIcon);

    const desc = new Text({
      text: i18n.getLanguage() === 'vi'
        ? 'Chọn nhận quà thường hoặc Xem Video Ngắn để mở Rương Thần Kỳ nhận ngay Siêu Nâng Cấp và Full Hồi Phục!'
        : 'Claim standard reward or watch a short video to open the Legendary Chest for massive EXP and full shield repair!',
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fill: '#cbd5e1',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.modalWidth - 60
      })
    });
    desc.anchor.set(0.5);
    desc.x = this.engine.width / 2;
    desc.y = boxY + 185;
    this.container.addChild(desc);

    // Button 1: AD REWARD CHEST (Highlighted)
    const adBtn = new Container();
    adBtn.x = boxX + 35;
    adBtn.y = boxY + 225;
    adBtn.eventMode = 'static';
    adBtn.cursor = 'pointer';

    const adBg = new Graphics();
    adBg.roundRect(0, 0, this.modalWidth - 70, 48, 10);
    adBg.fill({ color: 0xd97706 });
    adBg.stroke({ width: 2, color: 0xffd700 });
    adBtn.addChild(adBg);

    const adText = new Text({
      text: t('chest.claim_ad'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#ffffff'
      })
    });
    adText.anchor.set(0.5);
    adText.x = (this.modalWidth - 70) / 2;
    adText.y = 24;
    adBtn.addChild(adText);

    adBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      sdk.showRewarded({
        onReward: () => {
          this.hide();
          this.onClaimAd();
        },
        onCancel: () => console.log('Ad cancelled'),
        onComplete: () => {}
      });
    });
    this.container.addChild(adBtn);

    // Button 2: Free Reward
    const freeBtn = new Container();
    freeBtn.x = boxX + 35;
    freeBtn.y = boxY + 288;
    freeBtn.eventMode = 'static';
    freeBtn.cursor = 'pointer';

    const fBg = new Graphics();
    fBg.roundRect(0, 0, this.modalWidth - 70, 42, 8);
    fBg.fill({ color: 0x1e293b });
    fBg.stroke({ width: 1.5, color: 0x475569 });
    freeBtn.addChild(fBg);

    const fText = new Text({
      text: t('chest.claim_free'),
      style: new TextStyle({
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#94a3b8'
      })
    });
    fText.anchor.set(0.5);
    fText.x = (this.modalWidth - 70) / 2;
    fText.y = 21;
    freeBtn.addChild(fText);

    freeBtn.on('pointerdown', (e) => {
      e.stopPropagation();
      audio.playClick();
      this.hide();
      this.onClaimFree();
    });
    this.container.addChild(freeBtn);
  }

  hide() {
    this.container.visible = false;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
