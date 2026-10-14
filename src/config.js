// Galaxy Shooter Configuration & Balancing
export const CONFIG = {
  ENABLE_CHEATS: false, // Set to false when publishing to GameDistribution. Can be enabled via ?debug=1 or DEV mode
  CANVAS: {
    WIDTH: 1280,
    HEIGHT: 720,
    BG_COLOR: 0x040612
  },
  WAVE: {
    DURATION: 25, // seconds per wave before next wave begins
    BOSS_INTERVAL: 5 // Every 5 waves (5, 10, 15, 20...) is a Mega Boss Wave
  },
  TURRET: {
    MAX_HP: 100,
    RADIUS: 32,
    MAX_WEAPONS: 3
  },
  SHIELD: {
    BASE_HP: 70,
    BASE_RADIUS: 95,
    REGEN_DELAY: 4.5,
    REGEN_RATE: 18,
    KNOCKBACK: 140
  },
  COLORS: {
    CYAN: 0x00f0ff,
    MAGENTA: 0xff007f,
    YELLOW: 0xffd700,
    ORANGE: 0xff6600,
    GREEN: 0x00ff66,
    PURPLE: 0x9d4edd,
    RED: 0xff1144,
    WHITE: 0xffffff,
    DARK_BG: 0x040612
  },
  ENEMIES: {
    SWARM: {
      type: 'swarm',
      name: 'Drone Swarm',
      hp: 16, // One-shot by basic kinetic cannon (20 dmg) in wave 1
      speed: 110,
      damage: 6,
      xp: 4, // Boosted from 1 -> 4 (4x EXP!)
      color: 0xff2a55,
      size: 13
    },
    SPEEDER: {
      type: 'speeder',
      name: 'Phantom Speeder',
      hp: 28,
      speed: 160,
      damage: 10,
      xp: 8, // Boosted from 2 -> 8 (4x EXP!)
      color: 0xffd000,
      size: 15
    },
    TANK: {
      type: 'tank',
      name: 'Goliath Tank',
      hp: 140,
      speed: 45,
      damage: 25,
      xp: 25, // Boosted from 8 -> 25 (over 3x EXP!)
      color: 0xaa44ff,
      size: 28
    },
    MINION: {
      type: 'minion',
      name: 'Elite Minion',
      hp: 20,
      speed: 130,
      damage: 8,
      xp: 6, // Boosted from 2 -> 6 (3x EXP!)
      color: 0xff4488,
      size: 12
    },
    MEGA_BOSS: {
      type: 'mega_boss',
      name: 'Titan Dreadnought',
      hp: 1800, // Balanced for first boss encounter
      speed: 16, // Slow dreadnought
      damage: 50,
      xp: 400, // Boosted from 180 -> 400!
      color: 0xff0033,
      size: 80,
      isBoss: true
    },
    BOSS_TITAN: {
      type: 'boss_titan',
      name: 'Titan Dreadnought',
      hp: 1800,
      speed: 16,
      damage: 50,
      xp: 400,
      color: 0xff0033,
      size: 80,
      isBoss: true
    },
    BOSS_PHANTOM: {
      type: 'boss_phantom',
      name: 'Shadow Phantom Infiltrator',
      hp: 1400,
      speed: 26,
      damage: 40,
      xp: 440,
      color: 0xa855f7,
      size: 72,
      isBoss: true
    },
    BOSS_CRYO: {
      type: 'boss_cryo',
      name: 'Absolute Zero Stasis Cruiser',
      hp: 1600,
      speed: 18,
      damage: 35,
      xp: 460,
      color: 0x00f0ff,
      size: 75,
      isBoss: true
    },
    BOSS_SINGULARITY: {
      type: 'boss_singularity',
      name: 'Cosmic Event Horizon Carrier',
      hp: 1900,
      speed: 14,
      damage: 45,
      xp: 490,
      color: 0x6366f1,
      size: 85,
      isBoss: true
    },
    BOSS_SOLAR: {
      type: 'boss_solar',
      name: 'Solar Prominence Dreadnought',
      hp: 1750,
      speed: 17,
      damage: 55,
      xp: 500,
      color: 0xff6600,
      size: 78,
      isBoss: true
    },
    BOSS_AEGIS: {
      type: 'boss_aegis',
      name: 'Aegis Prism Bastion',
      hp: 2200,
      speed: 13,
      damage: 30,
      xp: 520,
      color: 0x06b6d4,
      size: 82,
      isBoss: true
    },
    BOSS_CHRONO: {
      type: 'boss_chrono',
      name: 'Aeon Chrono Manipulator',
      hp: 1550,
      speed: 21,
      damage: 38,
      xp: 520,
      color: 0x14b8a6,
      size: 74,
      isBoss: true
    },
    BOSS_BROODMOTHER: {
      type: 'boss_broodmother',
      name: 'Hydra Broodmother Carrier',
      hp: 1650,
      speed: 15,
      damage: 40,
      xp: 540,
      color: 0x84cc16,
      size: 80,
      isBoss: true
    },
    BOSS_VAMPIRE: {
      type: 'boss_vampire',
      name: 'Crimson Blood Reaper',
      hp: 1700,
      speed: 19,
      damage: 42,
      xp: 550,
      color: 0xe11d48,
      size: 76,
      isBoss: true
    },
    BOSS_JUGGERNAUT: {
      type: 'boss_juggernaut',
      name: 'Hyperion Battering Juggernaut',
      hp: 2050,
      speed: 18,
      damage: 65,
      xp: 580,
      color: 0xf59e0b,
      size: 84,
      isBoss: true
    },
    BOSS_MIRAGE: {
      type: 'boss_mirage',
      name: 'Mirage Holographic Overlord',
      hp: 1500,
      speed: 23,
      damage: 35,
      xp: 600,
      color: 0xd946ef,
      size: 72,
      isBoss: true
    },
    SPLITTER_LARGE: {
      type: 'splitter_large',
      name: 'Amalgam Titan',
      hp: 110,
      speed: 65,
      damage: 18,
      xp: 22,
      color: 0x84cc16,
      size: 26
    },
    SPLITTER_MED: {
      type: 'splitter_med',
      name: 'Amalgam Shard',
      hp: 45,
      speed: 95,
      damage: 10,
      xp: 8,
      color: 0xa3e635,
      size: 18
    },
    SPLITTER_SMALL: {
      type: 'splitter_small',
      name: 'Amalgam Mini',
      hp: 18,
      speed: 135,
      damage: 6,
      xp: 3,
      color: 0xd9f99d,
      size: 11
    },
    TWIN: {
      type: 'twin',
      name: 'Magnetic Twin',
      hp: 60,
      speed: 85,
      damage: 12,
      xp: 14,
      color: 0x06b6d4,
      size: 16
    },
    VANGUARD: {
      type: 'vanguard',
      name: 'Vanguard Shield',
      hp: 100,
      speed: 70,
      damage: 16,
      xp: 18,
      color: 0x3b82f6,
      size: 22
    },
    HEALER: {
      type: 'healer',
      name: 'Nanite Healer',
      hp: 65,
      speed: 75,
      damage: 8,
      xp: 18,
      color: 0x10b981,
      size: 17
    },
    STEALTH_STALKER: {
      type: 'stealth_stalker',
      name: 'Stealth Stalker',
      hp: 55,
      speed: 125,
      damage: 14,
      xp: 16,
      color: 0x94a3b8,
      size: 16
    },
    GRAVITY_ANCHOR: {
      type: 'gravity_anchor',
      name: 'Gravity Anchor',
      hp: 120,
      speed: 48,
      damage: 15,
      xp: 26,
      color: 0x8b5cf6,
      size: 24
    },
    PARASITIC_SPORE: {
      type: 'parasite_spore',
      name: 'Parasitic Spore',
      hp: 35,
      speed: 135,
      damage: 8,
      xp: 12,
      color: 0xd946ef,
      size: 13
    },
    MIRROR_REFLECTOR: {
      type: 'mirror_reflector',
      name: 'Mirror Reflector',
      hp: 85,
      speed: 65,
      damage: 14,
      xp: 20,
      color: 0x38bdf8,
      size: 20
    },
    CHRONO_WEAVER: {
      type: 'chrono_weaver',
      name: 'Chrono Weaver',
      hp: 75,
      speed: 60,
      damage: 10,
      xp: 22,
      color: 0x14b8a6,
      size: 18
    },
    BIO_DEVOURER: {
      type: 'bio_devourer',
      name: 'Bio Devourer',
      hp: 95,
      speed: 70,
      damage: 18,
      xp: 28,
      color: 0xef4444,
      size: 22
    }
  }
};
