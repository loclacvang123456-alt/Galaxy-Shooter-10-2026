// Localization Manager: English (Default) & Vietnamese
import { storage } from '../storage/StorageManager.js';

const TRANSLATIONS = {
  en: {
    // HUD
    'hud.lv': 'LV {level}',
    'hud.wave': 'WAVE {wave}',
    'hud.wave_boss': 'WAVE {wave} (MEGA BOSS!)',
    'hud.score': 'SCORE: {score}',
    'hud.kills': 'KILLS: {kills}',
    'hud.weapons': 'WEAPONS',
    'hud.passives': 'SUPPORT PASSIVES',
    'hud.boss_warning': '⚠️ WARNING: TITAN MEGA BOSS APPROACHING! ⚠️',
    'hud.boss_title': '☠️ MEGA TITAN DREADNOUGHT',
    'hud.boss_hp': '☠️ MEGA TITAN DREADNOUGHT [ HP: {hp} / {maxHp} ({pct}%) ]',
    'hud.soul_title': 'SOUL SIPHON',
    'hud.soul_full': '★ MAX OVERDRIVE ★',
    'hud.soul_dmg': '+{pct}% DMG',

    // Wave Transition
    'wave.start': '⚡ CAMPAIGN COMMENCED: WAVE 1 ⚡',
    'wave.cleared': '★ WAVE {wave} CLEARED ★',
    'wave.incoming': '⚡ NEXT WAVE: WAVE {wave} INCOMING ⚡',
    'wave.boss_incoming': '☠️ WARNING: WAVE {wave} - TITAN BOSS INCOMING! ☠️',

    // Level Up Celebration
    'levelup.title': '★ LEVEL UP! ★',
    'levelup.congrats': 'CONGRATULATIONS ON REACHING LEVEL {level}',

    // Pause Modal
    'pause.title': 'GAME PAUSED',
    'pause.continue': '▶ CONTINUE',
    'pause.restart': '🔄 RESTART',
    'pause.lang': '🌐 LANGUAGE: ENGLISH 🇬🇧',
    'pause.sound_on': '🔊 SOUND: ON',
    'pause.sound_off': '🔇 SOUND: OFF',
    'pause.summary': 'Wave {wave} • Score {score}',

    // Upgrade Modal
    'upgrade.title': 'LEVEL UP! CHOOSE AN UPGRADE',
    'upgrade.reroll': '🎲 REROLL 3 CHOICES (WATCH AD)',
    'upgrade.select': 'SELECT',
    'upgrade.activate_fusion': '★ ACTIVATE FUSION ★',
    'upgrade.evolve_tier': '★ EVOLVE TO TIER {tier} ★',
    'upgrade.fusion_prefix': '★ FUSION: {name}',
    'upgrade.synergy_prefix': '★ SYNERGY: {name}',
    'upgrade.tier_unlocked': '★ TIER {tier} UNLOCKED!',
    'upgrade.new_weapon': 'NEW: {name}',
    'upgrade.minor_desc': 'Choose 1 of 2 sub-stats below. Collect 3 to unlock Major Evolution!',
    'upgrade.progress': 'Tier Progress: {n}/{max}',
    'upgrade.tier_progress': 'TIER PROGRESS',
    'upgrade.progress_ready': 'READY TO EVOLVE',
    'upgrade.progress_hint': 'Reach 3/3 to unlock Major Evolution!',
    'upgrade.progress_ready_sub': '3/3 Complete • Major Evolution Ready!',
    'upgrade.pick': 'PICK [{n}]',
    'upgrade.overdrive_title': '★ OVERDRIVE MATRIX ★',
    'upgrade.overdrive_sub': 'HYPERCHARGE RECOVERY',
    'upgrade.overdrive_desc': 'Instantly restore 100% Shield HP, permanently boost +15% damage and +35% EXP gain for all sources!',
    'synergy.banner_title': '★ SUPER FUSION: {name} ★',

    // Game Over
    'gameover.defeat': 'COMBAT DEFEAT',
    'gameover.revive': '❤️ REVIVE 50% HP (WATCH AD)',
    'gameover.restart': 'PLAY AGAIN',
    'gameover.score': 'Final Score',
    'gameover.kills': 'Total Kills',
    'gameover.time': 'Survival Time',

    // Boss Chest
    'chest.title': '★ VICTORY CHEST ★',
    'chest.subtitle': 'Titan Dreadnought Destroyed!',
    'chest.claim_free': 'CLAIM FREE EXP (+800)',
    'chest.claim_ad': '🎁 SUPER EXP (+2500) & REPAIR (AD)',

    // Sub-upgrade stat labels
    'sub.damage': '+35% DMG',
    'sub.cooldown': '+20% SPD',
    'sub.aoe': '+35% AoE',
    'sub.sub_beam': '+1 BEAM',
    'sub.range': '+25% RANGE',
    'sub.speed': '+30% SPEED',
    'sub.exp': '+25% EXP',
    'sub.lbl_damage': 'DAMAGE',
    'sub.lbl_cooldown': 'FIRE RATE',
    'sub.lbl_aoe': 'BLAST RADIUS',
    'sub.lbl_sub_beam': 'EXTRA BEAM',
    'sub.lbl_range': 'SPRAY RANGE',
    'sub.lbl_speed': 'ROTATION SPEED',
    'sub.lbl_exp': 'EXP BOOST',

    // Starter Weapon Selection
    'starter.title': '★ CHOOSE STARTER WEAPON ★',
    'starter.subtitle': 'Select 1 of 3 random weapons for your central turret',
    'starter.select': 'EQUIP WEAPON',

    // Main Menu
    'menu.title': 'GALAXY SHOOTER',
    'menu.sub': 'CENTRAL TURRET SURVIVOR DEFENSE',
    'menu.guide1': '• Choose 1 of 3 random weapons to begin your survivor defense.',
    'menu.guide2': '• Slay enemies, gather EXP to level up & unlock weapons.',
    'menu.guide3': '• Equip up to 3 weapons concurrently on the turret.',
    'menu.guide4': '• Max out 2 weapons to unlock powerful Synergy Fusions.',
    'menu.guide5': '• Energy Shield deflects invaders upon collision.',
    'menu.guide6': '• Ultimate supports: Chain Lightning & Crushing Black Holes.',
    'menu.start': 'START GAME',
    'menu.hint': 'HIGH SCORE: {score}   |   Controls: Mouse / Touch to aim priority   |   [F] Fullscreen'
  },
  vi: {
    // HUD
    'hud.lv': 'CẤP {level}',
    'hud.wave': 'ĐỢT {wave}',
    'hud.wave_boss': 'ĐỢT {wave} (TRÙM TITAN!)',
    'hud.score': 'ĐIỂM: {score}',
    'hud.kills': 'HẠ: {kills}',
    'hud.weapons': 'VŨ KHÍ',
    'hud.passives': 'BỔ TRỢ',
    'hud.boss_warning': '⚠️ CẢNH BÁO: TITAN MEGA BOSS XUẤT HIỆN! ⚠️',
    'hud.boss_title': '☠️ SIÊU HẠM ĐỘI TITAN DREADNOUGHT',
    'hud.boss_hp': '☠️ MEGA TITAN DREADNOUGHT [ HP: {hp} / {maxHp} ({pct}%) ]',
    'hud.soul_title': 'HÚT LINH HỒN',
    'hud.soul_full': '★ CỰC ĐẠI SỨC MẠNH ★',
    'hud.soul_dmg': '+{pct}% SÁT THƯƠNG',

    // Wave Transition
    'wave.start': '⚡ CHIẾN DỊCH KHỞI TRANH: ĐỢT 1 ⚡',
    'wave.cleared': '★ HOÀN THÀNH ĐỢT {wave} ★',
    'wave.incoming': '⚡ TIẾP TỤC: ĐỢT {wave} BẮT ĐẦU ⚡',
    'wave.boss_incoming': '☠️ BÁO ĐỘNG: ĐỢT {wave} - TITAN BOSS ĐỔ BỘ! ☠️',

    // Level Up Celebration
    'levelup.title': '★ LEVEL UP! ★',
    'levelup.congrats': 'CHÚC MỪNG ĐẠT CẤP ĐỘ {level}',

    // Pause Modal
    'pause.title': 'TẠM DỪNG TRẬN ĐẤU',
    'pause.continue': '▶ TIẾP TỤC',
    'pause.restart': '🔄 CHƠI LẠI',
    'pause.lang': '🌐 NGÔN NGỮ: TIẾNG VIỆT 🇻🇳',
    'pause.sound_on': '🔊 ÂM THANH: BẬT',
    'pause.sound_off': '🔇 ÂM THANH: TẮT',
    'pause.summary': 'Đợt {wave} • Điểm {score}',

    // Upgrade Modal
    'upgrade.title': 'LÊN CẤP! CHỌN NÂNG CẤP',
    'upgrade.reroll': '🎲 ĐỔI 3 LỰA CHỌN MỚI (XEM AD)',
    'upgrade.select': 'CHỌN',
    'upgrade.activate_fusion': '★ KÍCH HOẠT HỢP THỂ ★',
    'upgrade.evolve_tier': '★ TIẾN HÓA BẬC {tier} ★',
    'upgrade.fusion_prefix': '★ HỢP THỂ: {name}',
    'upgrade.synergy_prefix': '★ KẾT HỢP: {name}',
    'upgrade.tier_unlocked': '★ MỞ KHÓA BẬC {tier}!',
    'upgrade.new_weapon': 'MỚI: {name}',
    'upgrade.minor_desc': 'Chọn 1 trong 2 chỉ số phụ bên dưới. Đủ 3 cấp nhỏ sẽ kích hoạt Tiến Hóa Bậc To tiếp theo!',
    'upgrade.progress': 'Tiến trình lên bậc: {n}/{max}',
    'upgrade.tier_progress': 'TIẾN ĐỘ LÊN BẬC',
    'upgrade.progress_ready': 'SẴN SÀNG TIẾN HÓA',
    'upgrade.progress_hint': 'Đủ 3/3 để mở khóa Tiến Hóa Bậc To!',
    'upgrade.progress_ready_sub': '3/3 Hoàn tất • Sẵn sàng Tiến Hóa Lớn!',
    'upgrade.pick': 'CHỌN [{n}]',
    'upgrade.overdrive_title': '★ OVERDRIVE MATRIX ★',
    'upgrade.overdrive_sub': 'SẠC SIÊU CƯỜNG HÓA',
    'upgrade.overdrive_desc': 'Hồi phục 100% Khiên, tăng vĩnh viễn +15% sát thương và +35% EXP nhận được!',
    'synergy.banner_title': '★ SIÊU KẾT HỢP: {name} ★',

    // Game Over
    'gameover.defeat': 'CHIẾN ĐẤU THẤT BẠI',
    'gameover.revive': '❤️ HỒI SINH 50% HP (XEM AD)',
    'gameover.restart': 'CHƠI LẠI TỪ ĐẦU',
    'gameover.score': 'Điểm số đạt được',
    'gameover.kills': 'Quái vật tiêu diệt',
    'gameover.time': 'Thời gian sống sót',

    // Boss Chest
    'chest.title': '★ RƯƠNG CHIẾN THẮNG ★',
    'chest.subtitle': 'Trùm Titan Đã Bị Tiêu Diệt!',
    'chest.claim_free': 'NHẬN EXP MIỄN PHÍ (+800)',
    'chest.claim_ad': '🎁 SIÊU THƯỞNG (+2500 EXP + HỒI PHỤC KHIÊN) (AD)',

    // Sub-upgrade stat labels
    'sub.damage': '+35% ST',
    'sub.cooldown': '+20% TỐC BẮN',
    'sub.aoe': '+35% BÁN KÍNH',
    'sub.sub_beam': '+1 TIA PHỤ',
    'sub.range': '+25% TẦM XA',
    'sub.speed': '+30% TỐC ĐỘ',
    'sub.exp': '+25% EXP',
    'sub.lbl_damage': 'SÁT THƯƠNG',
    'sub.lbl_cooldown': 'TỐC ĐỘ BẮN',
    'sub.lbl_aoe': 'BÁN KÍNH NỔ',
    'sub.lbl_sub_beam': 'THÊM TIA CON',
    'sub.lbl_range': 'TẦM PHUN',
    'sub.lbl_speed': 'TỐC ĐỘ XOAY',
    'sub.lbl_exp': 'TĂNG EXP',

    // Starter Weapon Selection
    'starter.title': '★ CHỌN VŨ KHÍ KHỞI ĐẦU ★',
    'starter.subtitle': 'Chọn 1 trong 3 vũ khí ngẫu nhiên để trang bị cho trụ',
    'starter.select': 'TRANG BỊ VŨ KHÍ',

    // Main Menu
    'menu.title': 'GALAXY SHOOTER',
    'menu.sub': 'CENTRAL TURRET SURVIVOR DEFENSE',
    'menu.guide1': '• Chọn 1 trong 3 vũ khí ngẫu nhiên để bắt đầu cuộc chiến.',
    'menu.guide2': '• Tiêu diệt quái, thu thập EXP để lên cấp và nhận vũ khí mới ngẫu nhiên.',
    'menu.guide3': '• Trang bị tối đa 3 loại vũ khí cùng lúc lên trụ trung tâm.',
    'menu.guide4': '• Nâng cấp 2 vũ khí đạt Max Cấp để mở khóa hiệu ứng Hợp Thể (Synergy Buff).',
    'menu.guide5': '• Khiên năng lượng bảo vệ trụ và đẩy lùi quái vật khi chạm vào.',
    'menu.guide6': '• Phụ trợ tối thượng: Sét Giật Chuỗi & Lỗ Đen Không Gian hút nghiền nát quái.',
    'menu.start': 'BẮT ĐẦU CHƠI',
    'menu.hint': 'ĐIỂM CAO: {score}   |   Điều khiển: Chuột / Chạm để chọn ưu tiên mục tiêu   |   [F] Toàn màn hình'
  }
};

class I18nManager {
  constructor() {
    // English is the default language per user requirements
    this.currentLang = storage?.getLanguage?.() || 'en';
    this.listeners = new Set();
  }

  getLanguage() {
    return this.currentLang;
  }

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'vi') lang = 'en';
    this.currentLang = lang;
    storage?.setLanguage?.(lang);
    this.notify();
  }

  toggleLanguage() {
    const next = this.currentLang === 'en' ? 'vi' : 'en';
    this.setLanguage(next);
    return next;
  }

  t(key, params = {}) {
    const langDict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    let text = langDict[key] ?? TRANSLATIONS.en[key] ?? key;

    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  offChange(callback) {
    this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentLang);
      } catch (err) {
        console.error('Error in i18n change listener:', err);
      }
    }
  }
}

export const i18n = new I18nManager();
export const t = (key, params) => i18n.t(key, params);
