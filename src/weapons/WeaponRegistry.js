// Weapon & Upgrade Registry with 5 Tiers each, Passives & Synergies
import { i18n } from '../core/i18n.js';

export const WEAPON_TYPES = {
  KINETIC: 'kinetic',
  MISSILE: 'missile',
  BOMB: 'bomb',
  LASER: 'laser',
  FLAME: 'flame',
  SAWBLADE: 'sawblade',
  CRYO: 'cryo',
  SWARM: 'swarm',
  TESLA: 'tesla',
  VOID_RAILGUN: 'void_railgun'
};

export const PASSIVE_TYPES = {
  LIGHTNING: 'passive_lightning',
  BLACK_HOLE: 'passive_black_hole',
  SHIELD: 'passive_shield',
  CHRONO: 'passive_chrono',
  NANITE: 'passive_nanite',
  OVERCHARGE: 'passive_overcharge',
  REPULSOR: 'passive_repulsor',
  VAMPIRIC: 'passive_vampiric',
  QUANTUM: 'passive_quantum'
};


export const WEAPON_DEFINITIONS = {
  [WEAPON_TYPES.KINETIC]: {
    id: WEAPON_TYPES.KINETIC,
    name: 'Kinetic Cannon',
    color: 0x00f0ff,
    description: 'Rapid-fire kinetic rounds with pinpoint accuracy.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng xung lực đạn' },
      { key: 'cooldown', name: '+20% SPD', label: 'TỐC ĐỘ BẮN', icon: 'cooldown', glyph: '⚡', desc: 'Tăng tốc xả đạn của pháo' },
      { key: 'exp', name: '+25% EXP', label: 'KINH NGHIỆM', icon: 'exp', glyph: '💎', desc: 'Tăng 25% kinh nghiệm nhận được từ mọi nguồn' }
    ],
    tiers: [
      { tier: 1, name: 'Kinetic Mk I', desc: 'Single high-velocity projectile', desc_vi: 'Bắn 1 viên đạn động năng vận tốc cao' },
      { tier: 2, name: 'Twin Barrel', desc: 'Fires 2 parallel kinetic rounds', desc_vi: 'Bắn 2 luồng đạn động năng song song' },
      { tier: 3, name: 'Armor Piercing', desc: 'Rounds pierce through 2 targets', desc_vi: 'Đạn xuyên thấu qua 2 mục tiêu' },
      { tier: 4, name: 'Gatling Overdrive', desc: '+60% fire rate and +25% damage', desc_vi: '+60% tốc độ bắn và +25% sát thương' },
      { tier: 5, name: 'CRIMSON OMEGA RAILGUN', desc: '★ TIER 5 EVOLUTION: Giant piercing beam cannon firing 3 fullscreen scarlet railgun beams!', desc_vi: '★ TIER 5 EVOLUTION: Đạn biến thành chùm hạt ĐỎ RỰC khổng lồ, bắn 3 luồng song song xuyên thấu toàn màn hình!' }
    ]
  },
  [WEAPON_TYPES.MISSILE]: {
    id: WEAPON_TYPES.MISSILE,
    name: 'Fire Rocket',
    color: 0xff6600,
    description: 'Homing missiles tracking clicked target or closest enemy.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng uy lực thuốc nổ plasma' },
      { key: 'aoe', name: '+35% AoE', label: 'BÁN KÍNH NỔ', icon: 'aoe', glyph: '💥', desc: 'Tăng phạm vi bán kính vụ nổ tên lửa' }
    ],
    tiers: [
      { tier: 1, name: 'Homing Pod', desc: 'Launches guided rocket seeking targets', desc_vi: 'Phóng tên lửa tự hành tìm mục tiêu' },
      { tier: 2, name: 'Turbo Thruster', desc: '+50% missile velocity and turn rate', desc_vi: '+50% tốc độ bay và độ lượn tên lửa' },
      { tier: 3, name: 'Dual Launcher', desc: 'Fires 2 homing rockets simultaneously', desc_vi: 'Phóng 2 tên lửa tự hành cùng lúc' },
      { tier: 4, name: 'Heavy Warhead', desc: '+60% explosion blast radius and damage', desc_vi: '+60% bán kính nổ và sát thương' },
      { tier: 5, name: 'VOID HELLFIRE SWARM', desc: '★ TIER 5 EVOLUTION: Fires volley of 6 spiraling neon-violet rockets with catastrophic plasma blast radius!', desc_vi: '★ TIER 5 EVOLUTION: Phóng loạt 6 tên lửa TÍM NEON bay lượn xoắn ốc tuyệt đẹp, nổ plasma hủy diệt diện rộng!' }
    ]
  },
  [WEAPON_TYPES.BOMB]: {
    id: WEAPON_TYPES.BOMB,
    name: 'Plasma Bomb',
    color: 0xaa00ff,
    description: 'Heavy explosive artillery shell with wide area damage.',
    subOptions: [
      { key: 'aoe', name: '+30% AoE', label: 'BÁN KÍNH NỔ', icon: 'aoe', glyph: '💥', desc: 'Mở rộng phạm vi hủy diệt sóng plasma' },
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng sát thương bom hủy diệt' }
    ],
    tiers: [
      { tier: 1, name: 'Plasma Mortar', desc: 'Lobbed shell detonating in AoE', desc_vi: 'Bắn đạn pháo nổ plasma diện rộng' },
      { tier: 2, name: 'Mega Charge', desc: 'Radius +50% and damage +40%', desc_vi: 'Bán kính nổ +50% và sát thương +40%' },
      { tier: 3, name: 'Bouncing Core', desc: 'Bomb bounces once and detonates twice', desc_vi: 'Bom nảy 1 lần và phát nổ 2 lần' },
      { tier: 4, name: 'Twin Mortar', desc: 'Fires 2 plasma shells at once', desc_vi: 'Bắn 2 quả pháo plasma cùng lúc' },
      { tier: 5, name: 'SUPERNOVA HYPER BOMB', desc: '★ TIER 5 EVOLUTION: Colossal blazing supernova sphere causing screen-shaking blast and releasing 6 cluster bombs!', desc_vi: '★ TIER 5 EVOLUTION: Quả cầu Mặt Trời Siêu Tân Tinh rực lửa khổng lồ, nổ chấn động màn hình và tách 6 bom chùm!' }
    ]
  },
  [WEAPON_TYPES.LASER]: {
    id: WEAPON_TYPES.LASER,
    name: 'Piercing Laser',
    color: 0x00ffcc,
    description: 'Continuous energy beam that burns through all enemies in its line.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng nhiệt photon thiêu đốt kẻ địch' },
      { key: 'sub_beam', name: '+1 TIA PHỤ', label: 'THÊM TIA CON', icon: 'sub_beam', glyph: '✨', desc: 'Bắn thêm tia laser phụ mini quét xung quanh' }
    ],
    tiers: [
      { tier: 1, name: 'Focus Beam', desc: 'Single high-energy laser beam', desc_vi: 'Tia laser năng lượng cao thiêu đốt mục tiêu' },
      { tier: 2, name: 'Twin Beams', desc: 'Fires 2 divergent laser beams sweeping through enemies', desc_vi: 'Bắn 2 tia laser về 2 hướng khác nhau quét sạch kẻ địch xung quanh' },
      { tier: 3, name: 'Tri-Beam Array', desc: 'Fires 3 fan-shaped laser beams covering a wide area', desc_vi: 'Bắn 3 tia laser tỏa ra 3 hướng khác nhau bao phủ toàn chiến trường' },
      { tier: 4, name: 'Thermal Overcharge', desc: '+70% damage and melts enemy armor', desc_vi: '+70% sát thương và thiêu rụi giáp kẻ địch' },
      { tier: 5, name: 'DOOMSDAY CROSS LASER', desc: '★ TIER 5 EVOLUTION: 4 massive revolving crimson beams forming a lethal 360° cross sweeping the battlefield!', desc_vi: '★ TIER 5 EVOLUTION: 4 Tia Laser ĐỎ RỰC SIÊU TO tạo thành chữ thập hủy diệt xoay 360 độ liên tục quét sạch chiến trường!' }
    ]
  },
  [WEAPON_TYPES.FLAME]: {
    id: WEAPON_TYPES.FLAME,
    name: 'Flamethrower',
    color: 0xff4500,
    description: 'Cone of searing plasma that sets enemies on fire.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Napalm cháy dai hơn, tăng sát thương' },
      { key: 'range', name: '+25% TẦM XA', label: 'TẦM PHUN', icon: 'range', glyph: '🎯', desc: 'Phun lửa xa hơn và góc phủ rộng' }
    ],
    tiers: [
      { tier: 1, name: 'Plasma Torch', desc: 'Streams of searing plasma burning through enemies', desc_vi: 'Luồng lửa cuộn trào thiêu đốt kẻ địch' },
      { tier: 2, name: 'Extended Stream', desc: '+50% flame range with intense searing heat', desc_vi: '+50% tầm xa, ngọn lửa bùng cháy dữ dội' },
      { tier: 3, name: 'Blue Napalm', desc: 'Blue napalm flames dealing 2x burn damage over time', desc_vi: 'Lửa Napalm xanh x2 sát thương thiêu đốt' },
      { tier: 4, name: 'Twin Nozzles', desc: 'Dual torrents of parallel rolling fire', desc_vi: '2 vòi phun lửa song song cuồn cuộn' },
      { tier: 5, name: 'INFERNO VORTEX WHEEL', desc: '★ TIER 5 EVOLUTION: Colossal 360° spinning vortex of flame engulfing the battlefield in infernal hellfire!', desc_vi: '★ TIER 5 EVOLUTION: Vòng xoáy bão lửa 360 độ khổng lồ bao quanh trụ, biến toàn bộ khu vực thành biển lửa địa ngục!' }
    ]
  },
  [WEAPON_TYPES.SAWBLADE]: {
    id: WEAPON_TYPES.SAWBLADE,
    name: 'Plasma Sawblade',
    color: 0x00f0ff,
    description: 'Orbiting plasma buzzsaws slicing through all encroaching enemies.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng xung lực cắt của lưỡi cưa' },
      { key: 'speed', name: '+30% TỐC ĐỘ QUỸ ĐẠO', label: 'TỐC ĐỘ XOAY', icon: 'speed', glyph: '⚡', desc: 'Tăng tốc độ xoay quỹ đạo của lưỡi cưa' }
    ],
    tiers: [
      { tier: 1, name: 'Orbital Buzzsaw', desc: 'Single high-velocity orbiting sawblade', desc_vi: '1 lưỡi cưa plasma xoay quanh trụ tốc độ cao' },
      { tier: 2, name: 'Dual Razor Blades', desc: 'Adds a 2nd orbiting sawblade on opposing side', desc_vi: 'Thêm lưỡi cưa thứ 2 đối xứng' },
      { tier: 3, name: 'Plasma Shredder', desc: 'Sawblades expand radius and emit slicing sparks', desc_vi: 'Mở rộng bán kính quay và phát tia lửa cắt nát quái' },
      { tier: 4, name: 'Quad Buzzsaw Vortex', desc: '4 orbital sawblades forming a lethal shredding ring', desc_vi: '4 lưỡi cưa tạo thành vành đai nghiền nát tử thần' },
      { tier: 5, name: 'OMEGA APOCALYPSE SAWBLADE', desc: '★ TIER 5 EVOLUTION: 6 hyper-spinning crimson saws emitting devastating shockwaves that shred all foes!', desc_vi: '★ TIER 5 EVOLUTION: 6 Lưỡi cưa ĐỎ RỰC xoay cực đại, phóng sóng chấn động cắt nát mọi kẻ địch!' }
    ]
  },
  [WEAPON_TYPES.CRYO]: {
    id: WEAPON_TYPES.CRYO,
    name: 'Cryo Spikes',
    color: 0xa5f3fc,
    description: 'Piercing crystal ice shards inflicting severe freezing slow.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng độ sắc nhọn và sát thương pha lê băng' },
      { key: 'cooldown', name: '+20% SPD', label: 'TỐC ĐỘ BẮN', icon: 'cooldown', glyph: '⚡', desc: 'Tăng tần suất phóng loạt băng thương' },
      { key: 'exp', name: '+25% EXP', label: 'KINH NGHIỆM', icon: 'exp', glyph: '💎', desc: 'Tăng 25% kinh nghiệm nhận được từ mọi nguồn' }
    ],
    tiers: [
      { tier: 1, name: 'Frost Shard', desc: 'Fires 3 ice spikes with center spear slowing enemies by 50%', desc_vi: 'Bắn 3 phi tiêu băng (1 tia ở giữa trúng đích) làm chậm 50%' },
      { tier: 2, name: 'Ice Lance Spread', desc: 'Fires 5 piercing shards in a cone', desc_vi: 'Bắn 5 mảnh băng xuyên thấu hình nón' },
      { tier: 3, name: 'Blizzard Piercer', desc: '7 shards piercing through 3 enemies with 60% slow', desc_vi: '7 mảnh băng xuyên qua 3 mục tiêu, làm chậm 60%' },
      { tier: 4, name: 'Glacial Burst', desc: '9 heavy frost spears with rapid recharge', desc_vi: '9 đại băng thương phóng liên tục với tốc độ hồi nhanh' },
      { tier: 5, name: 'GLACIAL ZERO ABSOLUTE', desc: '★ TIER 5 EVOLUTION: Fires volley of 11 massive glacial spears piercing 8 enemies and freezing movement by 75%!', desc_vi: '★ TIER 5 EVOLUTION: Phóng loạt 11 đại băng chùy xuyên thấu 8 quái vật, làm đóng băng tê liệt 75% tốc độ!' }
    ]
  },
  [WEAPON_TYPES.SWARM]: {
    id: WEAPON_TYPES.SWARM,
    name: 'Needler Swarm',
    color: 0xec4899,
    description: 'Volleys of snaking homing needles embedding and triggering crystal detonations.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng uy lực nổ pha lê kim' },
      { key: 'cooldown', name: '+20% HỒI CHIÊU', label: 'TỐC ĐỘ BẮN', icon: 'cooldown', glyph: '⚡', desc: 'Tăng tần suất phóng loạt phi kim' },
      { key: 'exp', name: '+25% EXP', label: 'KINH NGHIỆM', icon: 'exp', glyph: '💎', desc: 'Tăng 25% kinh nghiệm nhận được từ mọi nguồn' }
    ],
    tiers: [
      { tier: 1, name: 'Crystal Needler', desc: 'Fires rapid volleys of 4 snaking homing needles', desc_vi: 'Bắn loạt 4 phi kim tự hành uốn lượn' },
      { tier: 2, name: 'Dual Pod Launcher', desc: 'Fires 6 homing darts with tighter turning radius', desc_vi: 'Bắn 6 phi kim tự hành với độ lượn linh hoạt hơn' },
      { tier: 3, name: 'Supercombine Matrix', desc: '8 darts; 3 hits on a target trigger a neon crystal burst', desc_vi: '8 phi kim; 3 phát trúng kích nổ cụm pha lê neon' },
      { tier: 4, name: 'Hydra Volley', desc: '12 snaking needles with high flight speed and damage', desc_vi: '12 phi kim tốc độ cao với sát thương uy lực' },
      { tier: 5, name: 'NEO-HYDRA PHALANX', desc: '★ TIER 5 EVOLUTION: Unleashes storm of 16 neon-pink tracking needles triggering cascading crystal explosions!', desc_vi: '★ TIER 5 EVOLUTION: Phóng bão 16 phi kim Hồng Neon truy sát đa mục tiêu, phát nổ pha lê liên hoàn hủy diệt!' }
    ]
  },
  [WEAPON_TYPES.TESLA]: {
    id: WEAPON_TYPES.TESLA,
    name: 'Tesla Pylon',
    color: 0xffea00,
    description: 'Floating orbital pylons connecting high-voltage laser trap grids.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng hiệu điện thế dòng hồ quang điện' },
      { key: 'range', name: '+25% BÁN KÍNH', label: 'BÁN KÍNH LƯỚI', icon: 'range', glyph: '🎯', desc: 'Mở rộng phạm vi giăng bẫy điện' },
      { key: 'exp', name: '+25% EXP', label: 'KINH NGHIỆM', icon: 'exp', glyph: '💎', desc: 'Tăng 25% kinh nghiệm nhận được từ mọi nguồn' }
    ],
    tiers: [
      { tier: 1, name: 'Static Pylon', desc: 'Deploys 2 orbital pylons linked by high-voltage beam', desc_vi: 'Triển khai 2 trụ quỹ đạo nối tia điện cao thế' },
      { tier: 2, name: 'Tri-Pylon Lattice', desc: 'Deploys 3 pylons forming a triangular laser trap', desc_vi: 'Triển khai 3 trụ tạo thành bẫy điện tam giác' },
      { tier: 3, name: 'High-Tension Grid', desc: 'Triangular grid with +60% beam damage and wider perimeter', desc_vi: 'Lưới tam giác +60% sát thương và phạm vi rộng hơn' },
      { tier: 4, name: 'Quad Tesla Matrix', desc: '4 orbital pylons forming a massive perimeter defense box', desc_vi: '4 trụ quỹ đạo tạo thành hàng rào phòng thủ khép kín' },
      { tier: 5, name: 'THOR SUPERCHARGED GRID', desc: '★ TIER 5 EVOLUTION: 5 golden thunder pylons weaving a colossal lethal grid with continuous chain lightning!', desc_vi: '★ TIER 5 EVOLUTION: 5 Trụ Sấm Sét Hoàng Kim giăng lưới điện tử thần khổng lồ, phóng sét sấm rền liên tục!' }
    ]
  },
  [WEAPON_TYPES.VOID_RAILGUN]: {
    id: WEAPON_TYPES.VOID_RAILGUN,
    name: 'Singularity Railgun',
    color: 0x9333ea,
    description: 'Hypersonic antimatter slugs tearing cosmic gravity wakes that drag and crush foes.',
    subOptions: [
      { key: 'damage', name: '+35% DMG', label: 'SÁT THƯƠNG', icon: 'damage', glyph: '⚔️', desc: 'Tăng mật độ phản vật chất gây sát thương' },
      { key: 'cooldown', name: '+20% NẠP ĐẠN', label: 'TỐC ĐỘ BẮN', icon: 'cooldown', glyph: '⚡', desc: 'Tăng tốc tụ năng lượng bắn pháo ray' },
      { key: 'exp', name: '+25% EXP', label: 'KINH NGHIỆM', icon: 'exp', glyph: '💎', desc: 'Tăng 25% kinh nghiệm nhận được từ mọi nguồn' }
    ],
    tiers: [
      { tier: 1, name: 'Sub-Light Void Slug', desc: 'Piercing antimatter slug leaving an imploding gravity wake', desc_vi: 'Bắn đạn phản vật chất xuyên thấu để lại vệt hút trọng lực' },
      { tier: 2, name: 'Antimatter Accelerator', desc: '+60% damage, wider projectile, and faster reload', desc_vi: '+60% sát thương, kích thước đạn to hơn và nạp nhanh hơn' },
      { tier: 3, name: 'Twin Horizon', desc: 'Fires 2 parallel railgun slugs creating dual gravity rifts', desc_vi: 'Bắn 2 luồng pháo ray song song tạo khe nứt trọng lực đôi' },
      { tier: 4, name: 'Event Horizon Accelerator', desc: 'Devastating heavy slug with wide suction vortex wake', desc_vi: 'Đạn pháo ray hạng nặng với luồng lốc hút cực mạnh' },
      { tier: 5, name: 'SINGULARITY OBLITERATOR', desc: '★ TIER 5 EVOLUTION: Fires 3 fullscreen void rail beams tearing spacetime, pulling and obliterating all enemies!', desc_vi: '★ TIER 5 EVOLUTION: Bắn 3 luồng pháo ray Hư Không xé toạc không gian xuyên suốt màn hình, hút và nghiền nát tất cả!' }
    ]
  }
};

export const PASSIVE_DEFINITIONS = {
  [PASSIVE_TYPES.LIGHTNING]: {
    id: PASSIVE_TYPES.LIGHTNING,
    name: 'Chain Lightning',
    color: 0xffea00,
    description: 'Random electric discharge zapping through groups.',
    tiers: [
      { tier: 1, name: 'Static Spark', desc: 'Periodically zaps 1 random enemy', desc_vi: 'Phóng sét giật ngẫu nhiên 1 kẻ địch định kỳ' },
      { tier: 2, name: 'Arc Conductor', desc: 'Arcs to 2 additional nearby enemies', desc_vi: 'Tia sét nhảy thêm sang 2 kẻ địch lân cận' },
      { tier: 3, name: 'High Voltage', desc: '+50% shock damage', desc_vi: '+50% sát thương sốc điện' },
      { tier: 4, name: 'Chain Storm', desc: 'Arcs up to 5 enemies per strike', desc_vi: 'Sét giật lan truyền tối đa 5 kẻ địch mỗi lần' },
      { tier: 5, name: 'Thunder Wrath', desc: 'Strikes 3 clusters simultaneously with blinding flash', desc_vi: 'Giáng sét vào 3 cụm quái cùng lúc với luồng sáng chói lòa' }
    ]
  },
  [PASSIVE_TYPES.BLACK_HOLE]: {
    id: PASSIVE_TYPES.BLACK_HOLE,
    name: 'Cosmic Black Hole',
    color: 0x9d4edd,
    description: 'Tạo Lỗ Đen Không Gian hút quái vật vào tâm và nghiền nát.',
    tiers: [
      { tier: 1, name: 'Micro Singularity', desc: 'Pulls enemies within 160px into center and crushes them', desc_vi: 'Hút quái vật trong 160px vào tâm và gây sát thương nghiền nát' },
      { tier: 2, name: 'Gravitational Pull', desc: '+40% suction radius with powerful gravitational pull', desc_vi: '+40% bán kính hút, lực kéo cực mạnh' },
      { tier: 3, name: 'Accretion Crusher', desc: 'Rapidly rotating accretion disk dealing +70% damage', desc_vi: 'Đĩa bồi tụ xoay nhanh, tăng +70% sát thương' },
      { tier: 4, name: 'Twin Event Horizon', desc: 'Spawns 2 cosmic black holes simultaneously', desc_vi: 'Sinh ra 2 lỗ đen không gian cùng lúc' },
      { tier: 5, name: 'SUPERMASSIVE SINGULARITY', desc: '★ TIER 5 EVOLUTION: Colossal 320px singularity devouring and annihilating all nearby enemies!', desc_vi: '★ TIER 5 EVOLUTION: Lỗ Đen Khổng Lồ 320px nuốt chửng và nghiền nát toàn bộ kẻ địch xung quanh!' }
    ]
  },
  [PASSIVE_TYPES.SHIELD]: {
    id: PASSIVE_TYPES.SHIELD,
    name: 'Barrier Reinforcement',
    color: 0x00e5ff,
    description: 'Expands energy barrier radius and fortifies maximum shield HP.',
    tiers: [
      { tier: 1, name: 'Shield Boost I', desc: '+30 Shield HP & +15 Radius', desc_vi: '+30 Máu Khiên & +15 Bán kính' },
      { tier: 2, name: 'Shield Boost II', desc: '+30 Shield HP & +15 Radius', desc_vi: '+30 Máu Khiên & +15 Bán kính' },
      { tier: 3, name: 'Shield Boost III', desc: '+30 Shield HP & +15 Radius', desc_vi: '+30 Máu Khiên & +15 Bán kính' },
      { tier: 4, name: 'Shield Boost IV', desc: '+30 Shield HP & +15 Radius', desc_vi: '+30 Máu Khiên & +15 Bán kính' },
      { tier: 5, name: 'Aegis Fortress', desc: '★ TIER 5 EVOLUTION: +60 Shield HP & hypercharged shield recovery rate!', desc_vi: '★ TIER 5 EVOLUTION: +60 Shield HP & Phục hồi cực nhanh' }
    ]
  },
  [PASSIVE_TYPES.CHRONO]: {
    id: PASSIVE_TYPES.CHRONO,
    name: 'Chrono Matrix',
    color: 0x00f0ff,
    description: 'Bóp méo thời gian định kỳ, làm chậm toàn bộ quái vật 70% và tăng tốc bắn.',
    tiers: [
      { tier: 1, name: 'Chrono Pulse I', desc: 'Slows enemies by 70% for 2.8s every 7.0s', desc_vi: 'Làm chậm quái vật 70% trong 2.8s mỗi 7.0s' },
      { tier: 2, name: 'Time Dilation II', desc: 'Extends dilation duration to 3.3s with 6.4s cooldown', desc_vi: 'Kéo dài thời gian bóp méo lên 3.3s, hồi chiêu 6.4s' },
      { tier: 3, name: 'Temporal Rift III', desc: 'Expands radius to 345px with 3.8s slow duration', desc_vi: 'Bán kính ảnh hưởng tăng lên 345px, thời gian làm chậm 3.8s' },
      { tier: 4, name: 'Chronosphere IV', desc: 'Cooldown reduced to 5.2s with 4.3s distortion duration', desc_vi: 'Hồi chiêu giảm còn 5.2s, thời gian bóp méo 4.3s' },
      { tier: 5, name: 'INFINITE AEON CHRONOSPHERE', desc: '★ TIER 5 EVOLUTION: Freezes enemy time almost completely fullscreen; turret gains +50% fire rate!', desc_vi: '★ TIER 5 EVOLUTION: Đóng băng thời gian toàn màn hình gần như tuyệt đối, trụ tăng +50% tốc bắn!' }
    ]
  },
  [PASSIVE_TYPES.NANITE]: {
    id: PASSIVE_TYPES.NANITE,
    name: 'Nanite Swarm',
    color: 0x10b981,
    description: 'Đàn robot nano bay quanh trụ, bào mòn giáp quái vật và hồi phục Khiên Năng Lượng.',
    tiers: [
      { tier: 1, name: 'Nanite Drones I', desc: '3 Nanites orbit turret, attacking close foes and repairing shield', desc_vi: '3 Nanite bay quanh trụ, tấn công kẻ địch áp sát và hồi khiên' },
      { tier: 2, name: 'Nanite Swarm II', desc: '5 Nanites with +40% speed and attack range', desc_vi: '5 Nanite, tăng +40% tốc độ di chuyển và tầm tấn công' },
      { tier: 3, name: 'Acid Hive III', desc: '7 Nanites inject acid shredding -30% enemy armor', desc_vi: '7 Nanite tiêm axit ăn mòn bào -30% giáp kẻ địch' },
      { tier: 4, name: 'Apex Swarm IV', desc: '9 Nanites double shield recovery when siphoning energy', desc_vi: '9 Nanite hồi phục Khiên gấp đôi khi hút năng lượng quái' },
      { tier: 5, name: 'OMNI-REPAIR NANITE HORDE', desc: '★ TIER 5 EVOLUTION: Swarm of 13 emerald nanites shredding armor and turning turret into an immortal fortress!', desc_vi: '★ TIER 5 EVOLUTION: Bầy 13 Nanite phát sáng lục bảo, liên tục xé nát giáp quái và biến trụ thành pháo đài bất tử!' }
    ]
  },
  [PASSIVE_TYPES.OVERCHARGE]: {
    id: PASSIVE_TYPES.OVERCHARGE,
    name: 'Critical Core',
    color: 0xffea00,
    description: 'Tụ năng lượng lõi kích hoạt đòn đánh Chí Mạng cho tất cả các loại vũ khí.',
    tiers: [
      { tier: 1, name: 'Critical Focus I', desc: '+16% Critical Strike Chance dealing 2.25x damage', desc_vi: '+16% Tỉ lệ Chí Mạng, gây x2.25 sát thương' },
      { tier: 2, name: 'Precision Array II', desc: '+22% Critical Strike Chance dealing 2.50x damage', desc_vi: '+22% Tỉ lệ Chí Mạng, gây x2.50 sát thương' },
      { tier: 3, name: 'Overload Matrix III', desc: '+28% Critical Strike Chance; critical hits deal 45 splash damage', desc_vi: '+28% Tỉ lệ Chí Mạng, đòn chí mạng phát nổ lan 45 sát thương' },
      { tier: 4, name: 'Hyper-Critical IV', desc: '+34% Critical Strike Chance with 3.0x critical damage multiplier', desc_vi: '+34% Tỉ lệ Chí Mạng, sát thương chí mạng x3.0' },
      { tier: 5, name: 'CATACLYSMIC OVERCHARGE CORE', desc: '★ TIER 5 EVOLUTION: +40% Crit Chance with 3.25x multiplier; crits unleash radial shockwaves!', desc_vi: '★ TIER 5 EVOLUTION: +40% Tỉ lệ Chí Mạng x3.25 sát thương, đòn chí mạng tạo sóng chấn động quét sạch xung quanh!' }
    ]
  },
  [PASSIVE_TYPES.REPULSOR]: {
    id: PASSIVE_TYPES.REPULSOR,
    name: 'Kinetic Repulsor',
    color: 0x38bdf8,
    description: 'Phát sóng xung kích đẩy lùi và làm choáng kẻ địch khi chúng áp sát vùng an toàn.',
    tiers: [
      { tier: 1, name: 'Concussion Pulse I', desc: 'Knocks back and slows enemies within 200px by 80% every 4.2s', desc_vi: 'Đẩy lùi và làm chậm 80% kẻ địch trong 200px mỗi 4.2s' },
      { tier: 2, name: 'Kinetic Shock II', desc: '+25px knockback radius with cooldown reduced to 3.7s', desc_vi: '+25px bán kính đẩy, giảm hồi chiêu còn 3.7s' },
      { tier: 3, name: 'Graviton Pulse III', desc: 'Extreme gravitational force violently hurling invaders away from turret', desc_vi: 'Lực hất văng cực mạnh, đẩy quái vật dạt xa khỏi trụ' },
      { tier: 4, name: 'Heavy Disruption IV', desc: '280px radius with 2.8s cooldown; emergency trigger when surrounded', desc_vi: 'Bán kính 280px, hồi chiêu 2.8s, tự kích hoạt khẩn cấp khi bị áp sát' },
      { tier: 5, name: 'ZERO-POINT KINETIC AEGIS', desc: '★ TIER 5 EVOLUTION: Continuous hyper-kinetic shockwave ring completely paralyzing any encroaching enemies!', desc_vi: '★ TIER 5 EVOLUTION: Vòng sóng xung kích liên hoàn cực mạnh làm tê liệt hoàn toàn mọi kẻ địch dám bén mảng!' }
    ]
  },
  [PASSIVE_TYPES.VAMPIRIC]: {
    id: PASSIVE_TYPES.VAMPIRIC,
    name: 'Soul Siphon',
    color: 0xef4444,
    description: 'Hút linh hồn từ quái vật bị tiêu diệt để cộng dồn sát thương và hồi phục máu.',
    tiers: [
      { tier: 1, name: 'Soul Motes I', desc: 'Slain foes drop Soul Motes restoring shield and stacking +2.5% damage', desc_vi: 'Quái chết rơi Linh Hồn bay về trụ, hồi khiên & cộng dồn +2.5% DMG' },
      { tier: 2, name: 'Blood Resonance II', desc: 'Increases stack cap to 20 with amplified heal per mote', desc_vi: 'Tăng giới hạn cộng dồn lên 20 tầng, hồi máu nhiều hơn' },
      { tier: 3, name: 'Crimson Feast III', desc: 'Soul motes fly twice as fast with prolonged buff duration', desc_vi: 'Linh Hồn bay nhanh gấp đôi, duy trì hiệu ứng lâu hơn' },
      { tier: 4, name: 'Soul Well IV', desc: 'Maximum 30 stacks (+75% DMG) with greater shield recharge', desc_vi: 'Tối đa 30 tầng cộng dồn sát thương (+75% DMG)' },
      { tier: 5, name: 'IMMORTAL SOUL HARVESTER', desc: '★ TIER 5 EVOLUTION: Crimson soul aura grants up to 35 stacks (+87.5% DMG) and hyper-accelerated regeneration!', desc_vi: '★ TIER 5 EVOLUTION: Vầng hào quang máu bao quanh trụ, tối đa 35 tầng cộng dồn (+87.5% DMG) và hồi phục thần tốc!' }
    ]
  },
  [PASSIVE_TYPES.QUANTUM]: {
    id: PASSIVE_TYPES.QUANTUM,
    name: 'Quantum Harvester',
    color: 0x10b981,
    description: 'Khuếch đại lượng Kinh Nghiệm thu được và gia tăng tốc độ hút ngọc kinh nghiệm.',
    tiers: [
      { tier: 1, name: 'Quantum Core I', desc: '+30% EXP bonus & +50% Gem magnet radius', desc_vi: '+30% Kinh Nghiệm nhận được & +50% Bán kính hút ngọc' },
      { tier: 2, name: 'Tachyon Siphon II', desc: '+55% EXP bonus & 20% chance for extra Green Mega Gem drop', desc_vi: '+55% Kinh Nghiệm & 20% quái chết rơi thêm Đại Ngọc Lục Bảo' },
      { tier: 3, name: 'Hyper-Extraction III', desc: '+80% EXP bonus & Gem homing flight speed doubled', desc_vi: '+80% Kinh Nghiệm & Ngọc bay về trụ nhanh gấp đôi' },
      { tier: 4, name: 'Cosmic Converter IV', desc: '+110% EXP bonus & collecting gems restores 1.5 Shield HP', desc_vi: '+110% Kinh Nghiệm & Thu thập ngọc hồi 1.5 Máu Khiên' },
      { tier: 5, name: 'OMEGA SINGULARITY HARVESTER', desc: '★ TIER 5 EVOLUTION: +160% EXP bonus (2.6x EXP), 100% Green Mega Gems, and gems unleash cosmic lightning shocks!', desc_vi: '★ TIER 5 EVOLUTION: +160% Kinh Nghiệm (x2.6 EXP), 100% quái chết rơi Đại Ngọc Lục Bảo, ngọc bay tới đâu phóng sét giật quái tới đó!' }
    ]
  }
};

// All 45 Creative Weapon + Weapon Synergies
export const WEAPON_FUSIONS = {
  'bomb+cryo': {
    id: 'bomb+cryo',
    type: 'weapon_fusion',
    name: 'Glacial Supernova Mortar',
    subtitle: 'SUB-ZERO BLAST',
    subtitle_vi: 'CỐI BĂNG SIÊU TÂN TINH',
    desc: 'Plasma bombs detonate into freezing sub-zero shockwaves slowing enemies by 90% and shattering armor!',
    desc_vi: 'Bom plasma nổ giải phóng sóng xung kích băng giá âm độ làm chậm 90% và làm vỡ vụn giáp quái!',
    color: 0x38bdf8
  },
  'bomb+flame': {
    id: 'bomb+flame',
    type: 'weapon_fusion',
    name: 'Inferno Supernova Core',
    subtitle: 'SUPERNOVA FIREBALL',
    subtitle_vi: 'CẦU LỬA SIÊU TÂN TINH',
    desc: 'Bomb becomes a giant 360° orbiting Fireball scorching enemies in flight, then detonates into a Lava Lake!',
    desc_vi: 'Bom biến thành Cầu Lửa khổng lồ xoay 360° thiêu rụi kẻ địch trên đường bay rồi nổ thành Biển Dung Nham!',
    color: 0xff3300
  },
  'bomb+kinetic': {
    id: 'bomb+kinetic',
    type: 'weapon_fusion',
    name: 'Flak Shrapnel Cannon',
    subtitle: 'FLAK SHRAPNEL CANNON',
    subtitle_vi: 'CỐI MẢNH PHÁO THẦN CÔNG',
    desc: 'Supernova bomb detonates into 10 piercing crimson railgun shrapnel shards!',
    desc_vi: 'Bom Supernova nổ văng ra 10 phi tiêu Railgun đỏ rực găm nát quái vật xung quanh!',
    color: 0xffd700
  },
  'bomb+laser': {
    id: 'bomb+laser',
    type: 'weapon_fusion',
    name: 'Orbital Death Ray',
    subtitle: 'ORBITAL DEATH RAY',
    subtitle_vi: 'TIA HỦY DIỆT QUỸ ĐẠO',
    desc: 'Doomsday laser triggers cascading micro-plasma explosions on all hit targets!',
    desc_vi: 'Laser Doomsday kích hoạt chuỗi vụ nổ plasma vi mô liên hoàn tại vị trí kẻ địch bị chiếu!',
    color: 0xaa00ff
  },
  'bomb+missile': {
    id: 'bomb+missile',
    type: 'weapon_fusion',
    name: 'MIRV Apocalypse Rocket',
    subtitle: 'MIRV APOCALYPSE ROCKET',
    subtitle_vi: 'TÊN LỬA ĐẠN ĐẠO ĐA ĐẦU ĐẠN',
    desc: 'Missiles carry heavy plasma warheads with 2x blast radius and release 3 bouncing bombs!',
    desc_vi: 'Tên lửa mang đầu đạn bom plasma khổng lồ nhân đôi bán kính nổ và sinh 3 bom nảy!',
    color: 0xff00aa
  },
  'bomb+sawblade': {
    id: 'bomb+sawblade',
    type: 'weapon_fusion',
    name: 'Explosive Buzzsaw Artillery',
    subtitle: 'BUZZSAW ARTILLERY',
    subtitle_vi: 'PHÁO CƯA NỔ PLASMA',
    desc: 'Artillery bombs burst into 6 orbiting plasma sawblades slicing through nearby crowds!',
    desc_vi: 'Bom nổ văng ra 6 lưỡi cưa plasma xoay tròn chém nát đàn quái vật áp sát!',
    color: 0xd946ef
  },
  'bomb+swarm': {
    id: 'bomb+swarm',
    type: 'weapon_fusion',
    name: 'Cluster Needler Detonator',
    subtitle: 'CLUSTER NEEDLER BOMB',
    subtitle_vi: 'ĐẠI PHÁO CHÙM KIM PHA LÊ',
    desc: 'Heavy bombs burst into a cluster of 12 homing crystal needles seeking out surviving enemies!',
    desc_vi: 'Bom plasma nổ bung ra chùm 12 phi kim pha lê tự hành truy sát toàn bộ kẻ địch còn sống sót!',
    color: 0xf43f5e
  },
  'bomb+tesla': {
    id: 'bomb+tesla',
    type: 'weapon_fusion',
    name: 'Electromagnetic Plasma Cataclysm',
    subtitle: 'EMP STORM CATACLYSM',
    subtitle_vi: 'ĐỊA CHẤN PLASMA TÍCH ĐIỆN',
    desc: 'Supernova blast ionizes the area, creating an electric storm grid zapping all caught invaders!',
    desc_vi: 'Vụ nổ plasma ion hóa vùng ảnh hưởng, tạo lưới bão điện giật liên hoàn mọi quái vật trong tâm chấn!',
    color: 0xfbbf24
  },
  'bomb+void_railgun': {
    id: 'bomb+void_railgun',
    type: 'weapon_fusion',
    name: 'Dark Matter Singularity Shell',
    subtitle: 'SINGULARITY COLLAPSE',
    subtitle_vi: 'ĐẠI PHÁO HỐ ĐEN HƯ KHÔNG',
    desc: 'Plasma bomb creates a collapsing gravitational singularity devouring and crushing surrounding enemies!',
    desc_vi: 'Bom nổ tạo hố đen trọng lực sụp đổ, nghiền nát và nuốt chửng quái vật vào hư không!',
    color: 0x7e22ce
  },

  'cryo+flame': {
    id: 'cryo+flame',
    type: 'weapon_fusion',
    name: 'Frostfire Cataclysm',
    subtitle: 'FROSTFIRE CATACLYSM',
    subtitle_vi: 'BĂNG HỎA HỦY DIỆT',
    desc: 'Frost shards and napalm trigger thermal shock reactions, causing high-pressure steam explosions!',
    desc_vi: 'Đạn băng kết hợp lửa napalm tạo phản ứng sốc nhiệt cực đại, gây nổ hơi nước siêu áp lực hủy diệt diện rộng!',
    color: 0x06b6d4
  },
  'cryo+kinetic': {
    id: 'cryo+kinetic',
    type: 'weapon_fusion',
    name: 'Cryo-Kinetic Hyper Lance',
    subtitle: 'PERMAFROST LANCE',
    subtitle_vi: 'THƯƠNG ĐỘNG NĂNG BĂNG GIÁ',
    desc: 'Kinetic rounds are sheathed in hardened permafrost, shattering into freezing shrapnel on impact!',
    desc_vi: 'Đạn động năng bọc tinh thể băng vĩnh cửu, vỡ tung thành mảnh băng sắc nhọn làm đông cứng kẻ địch!',
    color: 0x38bdf8
  },
  'cryo+laser': {
    id: 'cryo+laser',
    type: 'weapon_fusion',
    name: 'Absolute Zero Prism Ray',
    subtitle: 'ABSOLUTE ZERO RAY',
    subtitle_vi: 'TIA LĂNG KÍNH ĐỘ KHÔNG TUYỆT ĐỐI',
    desc: 'Laser refracted through cryogenic crystals chills targets instantly to Absolute Zero, freezing them solid!',
    desc_vi: 'Laser khúc xạ qua pha lê băng hạ nhiệt độ về 0 tuyệt đối, đóng băng mục tiêu ngay khi chạm!',
    color: 0x22d3ee
  },
  'cryo+missile': {
    id: 'cryo+missile',
    type: 'weapon_fusion',
    name: 'Permafrost Homing Torpedo',
    subtitle: 'BLIZZARD TORPEDO',
    subtitle_vi: 'NGƯ LÔI TẦM NHIỆT BĂNG VĨNH CỬU',
    desc: 'Homing missiles detonate into blinding blizzard bursts that freeze all foes in a wide radius!',
    desc_vi: 'Tên lửa tự hành nổ tung thành bão tuyết chói lòa, đóng băng quái vật trong bán kính rộng!',
    color: 0x0ea5e9
  },
  'cryo+sawblade': {
    id: 'cryo+sawblade',
    type: 'weapon_fusion',
    name: 'Blizzard Razor Orbit',
    subtitle: 'BLIZZARD RAZOR ORBIT',
    subtitle_vi: 'LƯỠI CƯA BÃO TUYẾT',
    desc: 'Orbiting sawblades radiate freezing blizzards, drastically slowing and lacerating all foes!',
    desc_vi: 'Vòng cưa phóng ra bão tuyết giá lạnh, làm chậm cực mạnh và xé rách kẻ địch!',
    color: 0x67e8f9
  },
  'cryo+swarm': {
    id: 'cryo+swarm',
    type: 'weapon_fusion',
    name: 'Glacial Needler Avalanche',
    subtitle: 'GLACIAL NEEDLE AVALANCHE',
    subtitle_vi: 'MƯA KIM BĂNG LỞ',
    desc: 'Crystal needles inflict deep frostbite; every 3 hits trigger a freezing Glacial Nova!',
    desc_vi: 'Phi kim pha lê gây bỏng lạnh cực độ; mỗi 3 phát găm trúng kích nổ Bão Băng Glacial Nova!',
    color: 0xa5f3fc
  },
  'cryo+tesla': {
    id: 'cryo+tesla',
    type: 'weapon_fusion',
    name: 'Cryo-Electric Superconductor',
    subtitle: 'SUPERCONDUCTING LEYLINE',
    subtitle_vi: 'SIÊU DẪN BĂNG LÔI',
    desc: 'Frozen targets become perfect conductors, causing Tesla lightning bolts to deal 2.5x damage!',
    desc_vi: 'Kẻ địch bị đóng băng trở thành chất siêu dẫn, chịu x2.5 sát thương sét giật lan truyền!',
    color: 0x7dd3fc
  },
  'cryo+void_railgun': {
    id: 'cryo+void_railgun',
    type: 'weapon_fusion',
    name: 'Zero-Point Void Piercer',
    subtitle: 'VOID PERMAFROST SLUG',
    subtitle_vi: 'ĐẠI TIỄN HƯ KHÔNG BĂNG GIÁ',
    desc: 'Antimatter slugs freeze spacetime along their trajectory, trapping pierced enemies in stasis!',
    desc_vi: 'Đạn hư không đóng băng không-thời gian trên quỹ đạo bay, giam giữ quái vật trong ngưng đọng!',
    color: 0x818cf8
  },

  'flame+kinetic': {
    id: 'flame+kinetic',
    type: 'weapon_fusion',
    name: 'Dragonfire Gatling',
    subtitle: 'DRAGONFIRE GATLING',
    subtitle_vi: 'SÚNG MÁY HỎA LONG',
    desc: 'Kinetic rounds are enveloped in roaring fireballs inflicting 100% burn DoT!',
    desc_vi: 'Đạn Kinetic bọc trong cầu lửa rực cháy, gây thiêu đốt DoT 100% cho mục tiêu!',
    color: 0xff4500
  },
  'flame+laser': {
    id: 'flame+laser',
    type: 'weapon_fusion',
    name: 'Solar Flare Prominence',
    subtitle: 'SOLAR FLARE PROMINENCE',
    subtitle_vi: 'BÃO LỬA MẶT TRỜI',
    desc: 'Flame laser converts into thermonuclear plasma with intense burn DoT and +50% flamethrower range!',
    desc_vi: 'Laser lửa chuyển thành plasma nhiệt hạch, thiêu đốt DoT và tăng +50% tầm vòi phun lửa!',
    color: 0xff5500
  },
  'flame+missile': {
    id: 'flame+missile',
    type: 'weapon_fusion',
    name: 'Napalm Cluster Torpedoes',
    subtitle: 'NAPALM CLUSTER TORPEDOES',
    subtitle_vi: 'NGƯ LÔI NAPALM PHÂN THÂN',
    desc: 'Hellfire rockets detonate into persistent blue napalm lakes scorching the area!',
    desc_vi: 'Tên lửa Hellfire phát nổ để lại biển lửa Napalm xanh thiêu đốt dữ dội chiến trường!',
    color: 0xff6600
  },
  'flame+sawblade': {
    id: 'flame+sawblade',
    type: 'weapon_fusion',
    name: 'Solar Buzzsaw Wheel',
    subtitle: 'SOLAR BUZZSAW WHEEL',
    subtitle_vi: 'LƯỠI CƯA HỎA NGỤC MẶT TRỜI',
    desc: 'Flaming buzzsaws leave persistent molten lava orbits incinerating all enemies around the turret!',
    desc_vi: 'Lưỡi cưa rực lửa để lại vệt dung nham cháy tròn vĩnh cửu, thiêu đốt cực hạn mọi kẻ địch xung quanh trụ!',
    color: 0xff4500
  },
  'flame+swarm': {
    id: 'flame+swarm',
    type: 'weapon_fusion',
    name: 'Incendiary Needler Swarm',
    subtitle: 'INCENDIARY NEEDLER',
    subtitle_vi: 'BẦY KIM HỎA TIỄN',
    desc: 'Crystal needles ignite into blazing fire-darts that embed into enemies and incinerate them from within!',
    desc_vi: 'Phi kim bốc cháy dữ dội găm sâu vào kẻ địch và thiêu rụi quái vật từ bên trong!',
    color: 0xf97316
  },
  'flame+tesla': {
    id: 'flame+tesla',
    type: 'weapon_fusion',
    name: 'Plasma Overload Inferno',
    subtitle: 'BALL LIGHTNING INFERNO',
    subtitle_vi: 'HỒ QUANG HỎA NGỤC',
    desc: 'Flames combine with high-voltage electricity to unleash scorching ball lightning discharges!',
    desc_vi: 'Ngọn lửa tích điện phóng ra bão sét cầu plasma thiêu đốt và làm tê liệt toàn bộ quái vật!',
    color: 0xf59e0b
  },
  'flame+void_railgun': {
    id: 'flame+void_railgun',
    type: 'weapon_fusion',
    name: 'Nether Void Cataclysm',
    subtitle: 'BLACKFIRE CATACLYSM',
    subtitle_vi: 'HƯ KHÔNG LỬA ĐỊA NGỤC',
    desc: 'Void slugs leave an infernal trail of black hellfire consuming all matter in its wake!',
    desc_vi: 'Đạn pháo hư không để lại vệt lửa đen hắc ám thiêu rụi mọi vật chất trên đường đi!',
    color: 0xa855f7
  },

  'kinetic+laser': {
    id: 'kinetic+laser',
    type: 'weapon_fusion',
    name: 'Prismatic Hyper Beam',
    subtitle: 'PRISMATIC HYPER BEAM',
    subtitle_vi: 'PHÁO HẠT LĂNG KÍNH SIÊU TẦN',
    desc: 'Railgun impacts refract 2 short penetrating laser beams piercing back ranks!',
    desc_vi: 'Đạn Railgun khi trúng đích phóng ra 2 tia laser phản xạ ngắn xuyên thủng hàng sau!',
    color: 0x00f0ff
  },
  'kinetic+missile': {
    id: 'kinetic+missile',
    type: 'weapon_fusion',
    name: 'Hyper Swarm Railgun',
    subtitle: 'HYPER SWARM RAILGUN',
    subtitle_vi: 'PHÁO RAY TÊN LỬA SIÊU TỐC',
    desc: 'Crimson Railgun impacts immediately launch 2 mini Hellfire homing missiles!',
    desc_vi: 'Đạn Crimson Railgun trúng đích lập tức phóng 2 tên lửa Hellfire mini truy sát!',
    color: 0xff0044
  },
  'kinetic+sawblade': {
    id: 'kinetic+sawblade',
    type: 'weapon_fusion',
    name: 'Kinetic Shuriken Vortex',
    subtitle: 'SHURIKEN RICOCHET',
    subtitle_vi: 'XOÁY PHI TIÊU ĐỘNG NĂNG',
    desc: 'High-velocity kinetic rounds ricochet off enemies as spinning kinetic buzzsaw shurikens!',
    desc_vi: 'Đạn động năng khi trúng quái dội ra các phi tiêu cưa xoay tròn nảy xuyên qua đám đông!',
    color: 0x06b6d4
  },
  'kinetic+swarm': {
    id: 'kinetic+swarm',
    type: 'weapon_fusion',
    name: 'Gatling Needler Phalanx',
    subtitle: 'CRYSTAL GATLING SALVO',
    subtitle_vi: 'PHÁO LIÊN THANH PHA LÊ',
    desc: 'Kinetic cannon fires alternating salvos of armor-piercing slugs and homing crystal needles!',
    desc_vi: 'Pháo động năng bắn xen kẽ đạn xuyên giáp và mưa phi kim pha lê tự hành truy sát!',
    color: 0xec4899
  },
  'kinetic+tesla': {
    id: 'kinetic+tesla',
    type: 'weapon_fusion',
    name: 'Railgun EMP Overcharge',
    subtitle: 'EMP OVERCHARGE RAILGUN',
    subtitle_vi: 'PHÁO RAY TÍCH ĐIỆN EMP',
    desc: 'Kinetic railgun rounds discharge devastating EMP bursts stunning and shocking all pierced foes!',
    desc_vi: 'Đạn pháo ray phóng xung điện EMP cực mạnh làm tê liệt và giật sét toàn bộ kẻ địch bị xuyên qua!',
    color: 0xeab308
  },
  'kinetic+void_railgun': {
    id: 'kinetic+void_railgun',
    type: 'weapon_fusion',
    name: 'Oblivion Hyper Railgun',
    subtitle: 'ANTIMATTER HYPER RAILGUN',
    subtitle_vi: 'TỬ THẦN PHÁO RAY HƯ KHÔNG',
    desc: 'Dual railgun synchrony unleashes devastating antimatter kinetic hyper-slugs obliterating all in line!',
    desc_vi: 'Đồng bộ 2 pháo ray bắn luồng đạn động năng phản vật chất hủy diệt toàn bộ kẻ địch trên một đường thẳng!',
    color: 0xc084fc
  },

  'laser+missile': {
    id: 'laser+missile',
    type: 'weapon_fusion',
    name: 'Laser-Guided Stinger',
    subtitle: 'LASER-GUIDED STINGER',
    subtitle_vi: 'TÊN LỬA DẪN ĐƯỜNG LASER',
    desc: 'Laser lock-on accelerates missiles by +100% and grants 1.8x critical strike damage!',
    desc_vi: 'Tia laser khóa mục tiêu khiến tên lửa tăng tốc +100% và gây x1.8 sát thương chí mạng!',
    color: 0x00ffcc
  },
  'laser+sawblade': {
    id: 'laser+sawblade',
    type: 'weapon_fusion',
    name: 'Photon Cutter Ring',
    subtitle: 'PHOTON CUTTER BLADES',
    subtitle_vi: 'VÒNG CẮT QUANG TỬ',
    desc: 'Laser beams charge spinning sawblades with pure photon plasma, doubling their shredding radius!',
    desc_vi: 'Tia laser tiếp năng lượng quang tử vào các lưỡi cưa xoay, nhân đôi bán kính chém quét của cưa!',
    color: 0x14b8a6
  },
  'laser+swarm': {
    id: 'laser+swarm',
    type: 'weapon_fusion',
    name: 'Prismatic Needler Matrix',
    subtitle: 'OPTICAL NEEDLE MATRIX',
    subtitle_vi: 'MA TRẬN KIM QUANG TUYẾN',
    desc: 'Crystal needles act as optical prisms, refracting piercing lasers across the entire battlefield!',
    desc_vi: 'Phi kim pha lê đóng vai trò lăng kính quang học, phản xạ các tia laser chằng chịt khắp chiến trường!',
    color: 0xf43f5e
  },
  'laser+tesla': {
    id: 'laser+tesla',
    type: 'weapon_fusion',
    name: 'Photon Diffraction Web',
    subtitle: 'PHOTON DIFFRACTION WEB',
    subtitle_vi: 'LƯỚI NHIỄU XẠ QUANG TỬ',
    desc: 'Laser passing through Tesla pylons diffracts into dozens of sub-beams sweeping the entire screen!',
    desc_vi: 'Tia Laser khi quét qua trụ Tesla sẽ bị khúc xạ thành hàng chục tia laser phụ quét sạch toàn màn hình!',
    color: 0xffea00
  },
  'laser+void_railgun': {
    id: 'laser+void_railgun',
    type: 'weapon_fusion',
    name: 'Dimensional Annihilation Beam',
    subtitle: 'DIMENSIONAL RIFT BEAM',
    subtitle_vi: 'TIA HỦY DIỆT CHIỀU KHÔNG GIAN',
    desc: 'Laser infuses with antimatter to form a massive dimensional rift beam vaporizing all enemy columns!',
    desc_vi: 'Laser kết hợp phản vật chất tạo thành chùm tia xé rách không gian quét sạch các hàng quái vật!',
    color: 0x9333ea
  },

  'missile+sawblade': {
    id: 'missile+sawblade',
    type: 'weapon_fusion',
    name: 'Rocket-Propelled Buzzsaws',
    subtitle: 'ROCKET BUZZSAW LAUNCHER',
    subtitle_vi: 'LƯỠI CƯA ĐỘNG CƠ PHẢN LỰC',
    desc: 'Missile launchers fire high-speed homing buzzsaws that relentlessly chase and grind foes!',
    desc_vi: 'Bắn ra các lưỡi cưa gắn động cơ tên lửa tự bay truy đuổi và cưa nát quái vật trước khi phát nổ!',
    color: 0xf97316
  },
  'missile+swarm': {
    id: 'missile+swarm',
    type: 'weapon_fusion',
    name: 'Micro-Missile Needler Hive',
    subtitle: 'MICRO-MISSILE NEEDLE HIVE',
    subtitle_vi: 'TỔ ONG TÊN LỬA KIM MINI',
    desc: 'Fires continuous swarms of hyper-agile micro-missiles tipping with exploding crystal needles!',
    desc_vi: 'Phóng liên hoàn bầy tên lửa mini siêu linh hoạt gắn đầu kim pha lê truy sát khắp màn hình!',
    color: 0xf472b6
  },
  'missile+tesla': {
    id: 'missile+tesla',
    type: 'weapon_fusion',
    name: 'Volt-Seeker EMP Torpedoes',
    subtitle: 'VOLT-SEEKER EMP TORPEDO',
    subtitle_vi: 'NGƯ LÔI TẦM SÉT',
    desc: 'Homing missiles emit lightning tethers to nearby enemies while in flight, then detonate into EMP novas!',
    desc_vi: 'Tên lửa tự hành phóng dây sét nối vào kẻ địch trên đường bay rồi nổ thành sóng xung kích EMP!',
    color: 0xfbbf24
  },
  'missile+void_railgun': {
    id: 'missile+void_railgun',
    type: 'weapon_fusion',
    name: 'Warp-Drive Void Torpedo',
    subtitle: 'WARP-DRIVE ANTIMATTER TORPEDO',
    subtitle_vi: 'NGƯ LÔI DỊCH CHUYỂN HƯ KHÔNG',
    desc: 'Rockets warp through dimensional space, bypassing defenses to detonate antimatter warheads!',
    desc_vi: 'Tên lửa nhảy vọt không gian xuyên qua phòng tuyến quái vật và kích nổ đầu đạn phản vật chất!',
    color: 0xa855f7
  },

  'sawblade+swarm': {
    id: 'sawblade+swarm',
    type: 'weapon_fusion',
    name: 'Shredder Needler Caster',
    subtitle: 'SHREDDER NEEDLE BURST',
    subtitle_vi: 'BÃO KIM LƯỠI CƯA',
    desc: 'Spinning sawblades fling out homing crystal needles whenever they slice through an enemy!',
    desc_vi: 'Lưỡi cưa mỗi khi chém trúng quái vật lập tức vung ra các phi kim pha lê tự truy sát mục tiêu!',
    color: 0xf43f5e
  },
  'sawblade+tesla': {
    id: 'sawblade+tesla',
    type: 'weapon_fusion',
    name: 'Induction Saw Matrix',
    subtitle: 'INDUCTION SAW MATRIX',
    subtitle_vi: 'MA TRẬN CƯA CẢM ỨNG ĐIỆN TỪ',
    desc: 'Tesla pylons channel electric arcs into spinning sawblades, creating a roaming perimeter of death!',
    desc_vi: 'Trụ Tesla phóng dòng hồ quang điện nối thẳng vào các lưỡi cưa đang xoay, tạo thành mạng lưới hủy diệt di động!',
    color: 0x00f0ff
  },
  'sawblade+void_railgun': {
    id: 'sawblade+void_railgun',
    type: 'weapon_fusion',
    name: 'Graviton Buzzsaw Orbit',
    subtitle: 'GRAVITON BUZZSAW ORBIT',
    subtitle_vi: 'VÒNG CƯA TRỌNG LỰC HƯ KHÔNG',
    desc: 'Sawblades generate localized gravitational fields, pulling nearby enemies into the rotating teeth!',
    desc_vi: 'Lưỡi cưa phát ra lực hút trọng lực mini kéo dạt quái vật vào vòng xoay để băm nát!',
    color: 0x8b5cf6
  },

  'swarm+tesla': {
    id: 'swarm+tesla',
    type: 'weapon_fusion',
    name: 'Tesla Lightning Needles',
    subtitle: 'LIGHTNING ROD NEEDLES',
    subtitle_vi: 'PHI KIM SẤM SÉT TESLA',
    desc: 'Every needle embedded in an enemy becomes a lightning rod, drawing massive thunderbolts!',
    desc_vi: 'Mỗi phi kim cắm vào kẻ địch biến mục tiêu thành cột thu lôi hút sấm sét giáng xuống liên hoàn!',
    color: 0xfbbf24
  },
  'swarm+void_railgun': {
    id: 'swarm+void_railgun',
    type: 'weapon_fusion',
    name: 'Void Needler Singularity',
    subtitle: 'VOID NEEDLE SINGULARITY',
    subtitle_vi: 'BẦY KIM HƯ KHÔNG ĐƠN ĐIỂM',
    desc: 'Crystal needles collapse into micro-singularities upon impact, crushing targets with void pressure!',
    desc_vi: 'Phi kim pha lê khi chạm đích sụp đổ thành vi lỗ đen mini nghiền nát mục tiêu bằng áp lực hư không!',
    color: 0xa855f7
  },

  'tesla+void_railgun': {
    id: 'tesla+void_railgun',
    type: 'weapon_fusion',
    name: 'Chronovolt Singularity Railgun',
    subtitle: 'DARK LIGHTNING RAILGUN',
    subtitle_vi: 'PHÁO RAY SẤM SÉT HƯ KHÔNG',
    desc: 'Antimatter slugs discharge cosmic dark lightning, stunning and devouring entire waves!',
    desc_vi: 'Đạn phản vật chất phóng ra sấm sét đen vũ trụ làm tê liệt và nuốt chửng toàn bộ đợt quái vật!',
    color: 0xc084fc
  }
};

// Handcrafted Iconic Weapon + Passive Fusions
export const HANDCRAFTED_PASSIVE_FUSIONS = {
  'laser+passive_lightning': {
    id: 'laser+passive_lightning',
    type: 'passive_fusion',
    name: 'Tesla Doomsday Storm',
    subtitle: 'TESLA DOOMSDAY STORM',
    subtitle_vi: 'BÃO SÉT TỬ THẦN TESLA',
    desc: 'Laser beams continuously discharge high-voltage chain lightning cascading through nearby enemies!',
    desc_vi: 'Laser chiếu trúng địch liên tục giật chuỗi sấm sét cao thế lan tỏa qua các quái vật xung quanh!',
    color: 0xffea00
  },
  'bomb+passive_lightning': {
    id: 'bomb+passive_lightning',
    type: 'passive_fusion',
    name: 'Ball Lightning Mortar',
    subtitle: 'BALL LIGHTNING MORTAR',
    subtitle_vi: 'CỐI SÉT CẦU HỦY DIỆT',
    desc: 'Plasma bombs detonate into 6 radial ball lightning discharges paralyzing all hit targets!',
    desc_vi: 'Bom plasma nổ phóng ra 6 luồng sét giật lan tỏa 360° làm tê liệt toàn bộ quái vật!',
    color: 0xffea00
  },
  'flame+passive_lightning': {
    id: 'flame+passive_lightning',
    type: 'passive_fusion',
    name: 'Plasma Arc Flamethrower',
    subtitle: 'PLASMA ARC FLAMETHROWER',
    subtitle_vi: 'SÚNG LỬA HỒ QUANG ĐIỆN',
    desc: 'Flames ionize targets, causing explosive electric arcs between burning enemies!',
    desc_vi: 'Lửa tích điện trường ion hóa, liên tục giật sét nổ giữa các quái vật đang bốc cháy!',
    color: 0xffea00
  },
  'kinetic+passive_lightning': {
    id: 'kinetic+passive_lightning',
    type: 'passive_fusion',
    name: 'Electromagnetic Railgun',
    subtitle: 'ELECTROMAGNETIC RAILGUN',
    subtitle_vi: 'PHÁO ĐIỆN TỪ SIÊU DẪN',
    desc: 'Railgun impacts discharge chain lightning arcing to 3 adjacent targets!',
    desc_vi: 'Đạn Crimson Railgun trúng đích phóng ra tia sét giật xích sang 3 quái vật lân cận!',
    color: 0xffea00
  },
  'missile+passive_lightning': {
    id: 'missile+passive_lightning',
    type: 'passive_fusion',
    name: 'EMP Storm Warheads',
    subtitle: 'EMP STORM WARHEADS',
    subtitle_vi: 'TÊN LỬA XUNG ĐIỆN EMP',
    desc: 'Missile explosions release EMP blastwaves that electrocute and stun enemies!',
    desc_vi: 'Tên lửa nổ phát ra sóng xung điện từ EMP giật sét và làm tê liệt kẻ địch!',
    color: 0xffea00
  },

  'laser+passive_black_hole': {
    id: 'laser+passive_black_hole',
    type: 'passive_fusion',
    name: 'Event Horizon Singularity',
    subtitle: 'EVENT HORIZON SINGULARITY',
    subtitle_vi: 'TIA CHÂN TRỜI SỰ KIỆN',
    desc: 'Laser beam exerts gravitational pull along its path, sucking enemies in to be crushed!',
    desc_vi: 'Laser tạo lực hút hấp dẫn dọc theo đường tia, hút quái vật vào đường bắn để nghiền nát!',
    color: 0x9d4edd
  },
  'bomb+passive_black_hole': {
    id: 'bomb+passive_black_hole',
    type: 'passive_fusion',
    name: 'Vortex Implosion Bomb',
    subtitle: 'VORTEX IMPLOSION BOMB',
    subtitle_vi: 'BOM TRỌNG LỰC HÚT CHÂN KHÔNG',
    desc: 'Bomb detonations create mini black holes pulling foes in before triggering a secondary implosion!',
    desc_vi: 'Bom nổ tạo ra Lỗ Đen Không Gian mini hút quái vật vào tâm rồi phát nổ lần 2!',
    color: 0x9d4edd
  },
  'flame+passive_black_hole': {
    id: 'flame+passive_black_hole',
    type: 'passive_fusion',
    name: 'Hellfire Singularity',
    subtitle: 'HELLFIRE SINGULARITY',
    subtitle_vi: 'LỖ ĐEN BÃO LỬA ĐỊA NGỤC',
    desc: 'Black holes become infernal singularities both pulling and incinerating foes with 2x damage!',
    desc_vi: 'Lỗ Đen Không Gian hóa thành Lỗ Đen Lửa Địa Ngục vừa hút vừa thiêu đốt x2 sát thương!',
    color: 0x9d4edd
  },
  'kinetic+passive_black_hole': {
    id: 'kinetic+passive_black_hole',
    type: 'passive_fusion',
    name: 'Gravity Siphon Railgun',
    subtitle: 'GRAVITY SIPHON RAILGUN',
    subtitle_vi: 'ĐẠN RAY HÚT TRỌNG LỰC',
    desc: 'Railgun projectiles create vacuum vortex wakes drawing enemies directly into the line of fire!',
    desc_vi: 'Đạn Railgun tạo luồng gió xoáy chân không mini kéo dạt quái vật lại gần đường đạn!',
    color: 0x9d4edd
  },
  'missile+passive_black_hole': {
    id: 'missile+passive_black_hole',
    type: 'passive_fusion',
    name: 'Dark Matter Warheads',
    subtitle: 'DARK MATTER WARHEADS',
    subtitle_vi: 'ĐẦU ĐẠN VẬT CHẤT TỐI',
    desc: 'Missile detonations create micro-singularities collapsing enemies together prior to the blast!',
    desc_vi: 'Tên lửa phát nổ sinh vi lỗ đen hút các kẻ địch lại gần nhau trước khi nổ!',
    color: 0x9d4edd
  },

  'flame+passive_shield': {
    id: 'flame+passive_shield',
    type: 'passive_fusion',
    name: 'Blazing Aegis Barrier',
    subtitle: 'BLAZING AEGIS BARRIER',
    subtitle_vi: 'KHIÊN NĂNG LƯỢNG RỰC LỬA',
    desc: 'Energy barrier ignites into a roaring flaming perimeter incinerating encroaching invaders!',
    desc_vi: 'Vành đai khiên bốc cháy rực lửa thiêu đốt bất kỳ quái vật nào áp sát trụ!',
    color: 0x00e5ff
  },

  'sawblade+passive_lightning': {
    id: 'sawblade+passive_lightning',
    type: 'passive_fusion',
    name: "Thor's Charged Buzzsaw",
    subtitle: "THOR'S CHARGED BUZZSAW",
    subtitle_vi: 'LƯỠI CƯA SẤM SÉT HOÀNG KIM',
    desc: 'Sawblades generate high-voltage electric arcs leaping between blades and electrocuting all foes!',
    desc_vi: 'Lưỡi cưa tích điện trường cao thế, liên tục giật tia sét nối giữa các lưỡi cưa và quét sạch quái vật!',
    color: 0xffea00
  },
  'sawblade+passive_chrono': {
    id: 'sawblade+passive_chrono',
    type: 'passive_fusion',
    name: 'Chrono Meatgrinder',
    subtitle: 'CHRONO MEATGRINDER',
    subtitle_vi: 'CỐI XAY THỜI GIAN',
    desc: 'Orbiting saws create localized stasis bubbles, freezing foes in place for endless shredding!',
    desc_vi: 'Vòng cưa tạo trường ngưng đọng thời gian cục bộ, khóa chặt quái vật để lưỡi cưa xé nát liên tục!',
    color: 0x00f0ff
  },

  'cryo+passive_lightning': {
    id: 'cryo+passive_lightning',
    type: 'passive_fusion',
    name: 'Superconducting Frost',
    subtitle: 'SUPERCONDUCTING FROST',
    subtitle_vi: 'SIÊU DẪN BĂNG TUYẾT',
    desc: 'Chilled foes become superconductors, suffering 2x damage from cascading lightning bolts!',
    desc_vi: 'Kẻ địch bị làm chậm bởi pha lê băng trở thành chất siêu dẫn, chịu x2 sát thương sấm sét lan tỏa!',
    color: 0xa5f3fc
  },

  'tesla+passive_lightning': {
    id: 'tesla+passive_lightning',
    type: 'passive_fusion',
    name: "Thunder God's Supergrid",
    subtitle: "THUNDER GOD'S SUPERGRID",
    subtitle_vi: 'LƯỚI ĐIỆN THẦN SẤM THOR',
    desc: 'Tesla grid summons continuous divine lightning strikes raining down upon all trapped invaders!',
    desc_vi: 'Lưới điện Tesla triệu hồi sấm sét liên hoàn từ trời giáng xuống mọi kẻ địch mắc kẹt trong lưới!',
    color: 0xffea00
  },

  'void_railgun+passive_black_hole': {
    id: 'void_railgun+passive_black_hole',
    type: 'passive_fusion',
    name: 'Event Horizon Collapse',
    subtitle: 'EVENT HORIZON COLLAPSE',
    subtitle_vi: 'SỤP ĐỔ CHÂN TRỜI SỰ KIỆN',
    desc: 'Void railgun creates a trail of micro black holes devouring all enemies along its path!',
    desc_vi: 'Pháo ray Hư Không để lại chuỗi vi lỗ đen dọc theo đường đạn, nuốt chửng toàn bộ quái vật trên đường bay!',
    color: 0x9333ea
  },
  'void_railgun+passive_chrono': {
    id: 'void_railgun+passive_chrono',
    type: 'passive_fusion',
    name: 'Tachyon Time Breaker',
    subtitle: 'TACHYON TIME BREAKER',
    subtitle_vi: 'PHÁ VỠ THỜI GIAN TACHYON',
    desc: 'Antimatter slugs shatter timeline flow, completely freezing pierced enemies for 3 seconds!',
    desc_vi: 'Đạn phản vật chất xé toạc dòng thời gian, đóng băng vĩnh viễn mọi kẻ địch bị xuyên qua trong 3 giây!',
    color: 0x38bdf8
  },

  'swarm+passive_overcharge': {
    id: 'swarm+passive_overcharge',
    type: 'passive_fusion',
    name: 'Critical Crystal Detonation',
    subtitle: 'CRITICAL CRYSTAL DETONATION',
    subtitle_vi: 'KÍCH NỔ PHA LÊ CHÍ MẠNG',
    desc: 'Neon-pink needles always trigger Critical crystal bursts dealing 3.5x screen-shaking damage!',
    desc_vi: 'Phi kim Hồng Neon luôn kích hoạt nổ pha lê Chí Mạng gây x3.5 sát thương và chấn động màn hình!',
    color: 0xec4899
  },
  'swarm+passive_nanite': {
    id: 'swarm+passive_nanite',
    type: 'passive_fusion',
    name: 'Bio-Corrosive Swarm',
    subtitle: 'BIO-CORROSIVE SWARM',
    subtitle_vi: 'BẦY ĐÀN ĂN MÒN SINH HỌC',
    desc: 'Needles embed nanite larvae into enemies, turning targets into continuous shield recharge conduits!',
    desc_vi: 'Phi kim cấy ấu trùng Nanite vào cơ thể quái vật, biến chúng thành nguồn sạc Khiên liên tục cho trụ!',
    color: 0x10b981
  }
};

// Procedural Theme Matrix for all other Weapon + Passive fusions
export const PASSIVE_THEMES = {
  [PASSIVE_TYPES.LIGHTNING]: {
    nameSuffix: 'Thunderstorm',
    nameSuffix_vi: 'Lôi Đình',
    subtitle: 'CHAIN LIGHTNING RESONANCE',
    subtitle_vi: 'CỘNG HƯỞNG SẤM SÉT',
    color: 0xffea00,
    desc: (w) => `${w.name} discharges high-voltage chain lightning cascading through nearby enemies!`,
    desc_vi: (w) => `${w.name} liên tục phóng luồng sấm sét cao thế liên hoàn quét sạch quái vật xung quanh!`
  },
  [PASSIVE_TYPES.BLACK_HOLE]: {
    nameSuffix: 'Singularity',
    nameSuffix_vi: 'Hố Đen Không Gian',
    subtitle: 'GRAVITATIONAL COLLAPSE',
    subtitle_vi: 'SỤP ĐỔ TRỌNG LỰC',
    color: 0x9d4edd,
    desc: (w) => `${w.name} generates gravitational singularities pulling enemies together to be crushed!`,
    desc_vi: (w) => `${w.name} tạo hố đen trọng lực hút dạt kẻ địch lại gần nhau để nghiền nát!`
  },
  [PASSIVE_TYPES.SHIELD]: {
    nameSuffix: 'Aegis Bastion',
    nameSuffix_vi: 'Khiên Hộ Thể',
    subtitle: 'BARRIER RESONANCE',
    subtitle_vi: 'CỘNG HƯỞNG KHIÊN NĂNG LƯỢNG',
    color: 0x00e5ff,
    desc: (w) => `${w.name} hits continuously restore Shield HP and pulse a defensive repelling barrier!`,
    desc_vi: (w) => `${w.name} đánh trúng quái liên tục hồi Máu Khiên và phát xung lực đẩy lùi phòng thủ!`
  },
  [PASSIVE_TYPES.CHRONO]: {
    nameSuffix: 'Temporal Stasis',
    nameSuffix_vi: 'Ngưng Đọng Thời Gian',
    subtitle: 'TIMELINE BREAKER',
    subtitle_vi: 'BÓP MÉO THỜI GIAN',
    color: 0x38bdf8,
    desc: (w) => `${w.name} creates localized temporal distortions freezing pierced foes for 2.5 seconds!`,
    desc_vi: (w) => `${w.name} bóp méo dòng thời gian cục bộ, đóng băng hoàn toàn kẻ địch trúng đòn trong 2.5 giây!`
  },
  [PASSIVE_TYPES.NANITE]: {
    nameSuffix: 'Nanite Swarm Hive',
    nameSuffix_vi: 'Tổ Robot Nano',
    subtitle: 'ACID SHREDDER',
    subtitle_vi: 'ĂN MÒN NANO',
    color: 0x10b981,
    desc: (w) => `${w.name} injects acid nanites that shred -40% enemy armor and turn targets into shield recharge nodes!`,
    desc_vi: (w) => `${w.name} cấy đàn robot nano ăn mòn -40% giáp kẻ địch và biến chúng thành trạm sạc khiên!`
  },
  [PASSIVE_TYPES.OVERCHARGE]: {
    nameSuffix: 'Cataclysmic Core',
    nameSuffix_vi: 'Lõi Siêu Chí Mạng',
    subtitle: 'HYPER CRITICAL NOVA',
    subtitle_vi: 'NỔ CHÍ MẠNG CỰC ĐẠI',
    color: 0xffea00,
    desc: (w) => `${w.name} gains +35% Critical Strike Chance; critical hits trigger radial screen-shaking shockwaves!`,
    desc_vi: (w) => `${w.name} tăng +35% Tỉ lệ Chí Mạng; đòn chí mạng kích nổ sóng chấn động rung chuyển màn hình!`
  },
  [PASSIVE_TYPES.REPULSOR]: {
    nameSuffix: 'Kinetic Shockwave',
    nameSuffix_vi: 'Sóng Đẩy Lùi',
    subtitle: 'ZERO-POINT IMPACT',
    subtitle_vi: 'CHẤN ĐỘNG ĐẨY LÙI',
    color: 0x0284c7,
    desc: (w) => `${w.name} unleashes violent kinetic repulsion waves hurling encroaching invaders far away from turret!`,
    desc_vi: (w) => `${w.name} giải phóng sóng chấn động cực mạnh hất văng quái vật ra xa khỏi ụ súng!`
  },
  [PASSIVE_TYPES.VAMPIRIC]: {
    nameSuffix: 'Soul Harvester',
    nameSuffix_vi: 'Đoạt Hồn Huyết Tế',
    subtitle: 'CRIMSON ESSENCE',
    subtitle_vi: 'HÚT LINH HỒN CƯỜNG HÓA',
    color: 0xef4444,
    desc: (w) => `${w.name} reaps Soul Motes from struck foes, stacking up to +80% bonus damage and repairing turret!`,
    desc_vi: (w) => `${w.name} hút linh hồn từ kẻ địch, cộng dồn tới +80% sát thương và tự động hồi máu cho ụ súng!`
  },
  [PASSIVE_TYPES.QUANTUM]: {
    nameSuffix: 'Quantum Hyper-Extractor',
    nameSuffix_vi: 'Đại Thu Hoạch Lượng Tử',
    subtitle: 'COSMIC HARVEST',
    subtitle_vi: 'SIÊU THU HOẠCH LƯỢNG TỬ',
    color: 0x10b981,
    desc: (w) => `${w.name} converts defeated foes into Green Mega Gems and releases cosmic sparks granting +60% EXP!`,
    desc_vi: (w) => `${w.name} biến quái vật bị hạ thành Đại Ngọc Lục Bảo và phóng tia sáng vũ trụ tăng +60% Kinh Nghiệm!`
  }
};

// Combined ALL_SYNERGIES master registry
export const ALL_SYNERGIES = {
  ...WEAPON_FUSIONS,
  ...HANDCRAFTED_PASSIVE_FUSIONS
};

// Register bidirectional aliases for weapon fusions so order of arguments never fails
for (const [key, syn] of Object.entries(WEAPON_FUSIONS)) {
  const [a, b] = key.split('+');
  const revKey = `${b}+${a}`;
  if (!ALL_SYNERGIES[revKey]) {
    ALL_SYNERGIES[revKey] = syn;
  }
}

// Check for synergy when two weapons hit max tier (Tier 5)
export function getSynergy(weapon1, weapon2) {
  if (!weapon1 || !weapon2) return null;
  const ids = [weapon1, weapon2].sort();
  const key = `${ids[0]}+${ids[1]}`;
  const revKey = `${ids[1]}+${ids[0]}`;
  return ALL_SYNERGIES[key] || ALL_SYNERGIES[revKey] || null;
}

// Check for synergy between a weapon (Tier 5) and an active passive
export function getPassiveSynergy(weaponId, passiveId) {
  if (!weaponId || !passiveId) return null;
  const key = `${weaponId}+${passiveId}`;
  if (ALL_SYNERGIES[key]) {
    return ALL_SYNERGIES[key];
  }
  const wDef = WEAPON_DEFINITIONS[weaponId];
  const pTheme = PASSIVE_THEMES[passiveId];
  if (wDef && pTheme) {
    return {
      id: key,
      type: 'passive_fusion',
      name: `${wDef.name} ${pTheme.nameSuffix}`,
      subtitle: pTheme.subtitle,
      subtitle_vi: pTheme.subtitle_vi,
      desc: pTheme.desc(wDef),
      desc_vi: pTheme.desc_vi(wDef),
      color: pTheme.color || wDef.color || 0xffd700
    };
  }
  return null;
}

export function isWeaponFusion(syn) {
  if (!syn) return false;
  return syn.type === 'weapon_fusion' || (!syn.id.includes('passive_') && syn.id.includes('+'));
}

export function isPassiveFusion(syn) {
  if (!syn) return false;
  return syn.type === 'passive_fusion' || syn.id.includes('passive_');
}

export function getUpgradeDesc(item) {
  if (!item) return '';
  const lang = i18n.getLanguage();
  if (lang === 'vi') {
    return item.desc_vi || item.desc || '';
  }
  return item.desc || item.desc_vi || '';
}

export function getUpgradeSubtitle(item) {
  if (!item) return '';
  const lang = i18n.getLanguage();
  if (lang === 'vi') {
    return item.subtitle_vi || item.subtitle || '';
  }
  return item.subtitle || item.subtitle_vi || '';
}

