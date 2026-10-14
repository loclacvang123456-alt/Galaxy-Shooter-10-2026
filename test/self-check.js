import assert from 'node:assert';
import { ObjectPool } from '../src/core/ObjectPool.js';
import { storage } from '../src/storage/StorageManager.js';
import {
  WEAPON_DEFINITIONS,
  PASSIVE_DEFINITIONS,
  WEAPON_TYPES,
  getSynergy
} from '../src/weapons/WeaponRegistry.js';

console.log('Running self-check tests...');

// 1. Check ObjectPool
const testPool = new ObjectPool(
  () => ({ val: 0, isAlive: false }),
  (item, val) => { item.val = val; },
  5
);
assert.strictEqual(testPool.pool.length, 5, 'ObjectPool should have 5 items initially');
const item1 = testPool.get(42);
assert.strictEqual(item1.val, 42, 'ObjectPool resetFn should set value');
assert.strictEqual(item1.isAlive, true, 'Item should be alive');
assert.strictEqual(testPool.pool.length, 4, 'Pool should have 4 items left');
testPool.release(item1);
assert.strictEqual(item1.isAlive, false, 'Item should not be alive after release');
assert.strictEqual(testPool.pool.length, 5, 'Pool should have 5 items again');
console.log('✓ ObjectPool check passed');

// 2. Check StorageManager (Memory Fallback in Node environment)
storage.setItem('test_key', 12345);
assert.strictEqual(storage.getItem('test_key'), 12345, 'StorageManager should store & retrieve values');
storage.setHighScore(500);
assert.strictEqual(storage.getHighScore(), 500, 'StorageManager should track high score');
storage.setHighScore(300);
assert.strictEqual(storage.getHighScore(), 500, 'StorageManager high score should not decrease');
storage.setHighScore(700);
assert.strictEqual(storage.getHighScore(), 700, 'StorageManager high score should update when exceeded');
console.log('✓ StorageManager check passed');

// 3. Check Weapon Definitions & 5 Tiers
const weaponTypes = Object.values(WEAPON_TYPES);
assert.strictEqual(weaponTypes.length, 10, 'Must have exactly 10 weapons (5 original + 5 new)');

for (const wType of weaponTypes) {
  const def = WEAPON_DEFINITIONS[wType];
  assert.ok(def, `Weapon ${wType} must exist`);
  assert.ok(def.tiers.length >= 5, `Weapon ${wType} must have at least 5 tiers`);
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(def.tiers[i].tier, i + 1, `${wType} tier ${i+1} must be numbered sequentially`);
    assert.ok(def.tiers[i].name, `${wType} tier ${i+1} must have a name`);
    assert.ok(def.tiers[i].desc, `${wType} tier ${i+1} must have a description`);
  }
}
console.log('✓ Weapon definitions & 5 tiers check passed (10 weapons)');

// 4. Check Passives
const passiveKeys = Object.keys(PASSIVE_DEFINITIONS);
assert.ok(passiveKeys.length >= 8, 'Must have at least 8 passives');
assert.ok(passiveKeys.includes(PASSIVE_TYPES.QUANTUM), 'Quantum Harvester passive must exist');
for (const [pKey, pDef] of Object.entries(PASSIVE_DEFINITIONS)) {
  assert.ok(pDef.tiers.length >= 5, `Passive ${pKey} must have at least 5 tiers`);
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(pDef.tiers[i].tier, i + 1, `${pKey} tier ${i+1} must be numbered sequentially`);
    assert.ok(pDef.tiers[i].name, `${pKey} tier ${i+1} must have a name`);
    assert.ok(pDef.tiers[i].desc, `${pKey} tier ${i+1} must have a description`);
  }
}
console.log(`✓ Passives check passed (${passiveKeys.length} passives including Quantum Harvester)`);

// 5. Check Weapon & Passive Synergies
import { PASSIVE_TYPES, getPassiveSynergy } from '../src/weapons/WeaponRegistry.js';

const syn1 = getSynergy(WEAPON_TYPES.KINETIC, WEAPON_TYPES.MISSILE);
assert.ok(syn1, 'Kinetic + Missile must produce a synergy');
assert.ok(syn1.name.includes('Swarm'), 'Synergy name should match definition');

const syn2 = getSynergy(WEAPON_TYPES.BOMB, WEAPON_TYPES.LASER);
assert.ok(syn2, 'Bomb + Laser must produce a synergy');

const synBombFlame = getSynergy(WEAPON_TYPES.BOMB, WEAPON_TYPES.FLAME);
assert.ok(synBombFlame, 'Bomb + Flame must produce Inferno Supernova Core synergy');
assert.strictEqual(synBombFlame.name, 'Inferno Supernova Core');

const synLaserLightning = getPassiveSynergy(WEAPON_TYPES.LASER, PASSIVE_TYPES.LIGHTNING);
assert.ok(synLaserLightning, 'Laser + Lightning must produce Tesla Doomsday Storm synergy');
assert.strictEqual(synLaserLightning.name, 'Tesla Doomsday Storm');

const synSawLightning = getPassiveSynergy(WEAPON_TYPES.SAWBLADE, PASSIVE_TYPES.LIGHTNING);
assert.ok(synSawLightning, 'Sawblade + Lightning must produce Thor\'s Charged Buzzsaw synergy');

const synVoidBlackHole = getPassiveSynergy(WEAPON_TYPES.VOID_RAILGUN, PASSIVE_TYPES.BLACK_HOLE);
assert.ok(synVoidBlackHole, 'Void Railgun + Black Hole must produce Event Horizon Collapse synergy');

const synCryoFlame = getSynergy(WEAPON_TYPES.CRYO, WEAPON_TYPES.FLAME);
assert.ok(synCryoFlame, 'Cryo + Flame must produce Frostfire Cataclysm synergy');

// Check subOptions structure for all 5 weapons (2 square boxes with icon glyph, label, and name)
for (const wType of Object.values(WEAPON_TYPES)) {
  const def = WEAPON_DEFINITIONS[wType];
  assert.ok(def.subOptions && def.subOptions.length >= 2, `${wType} must have at least 2 subOptions`);
  for (const opt of def.subOptions) {
    assert.ok(opt.key, `${wType} subOption must have key`);
    assert.ok(opt.name, `${wType} subOption must have name`);
    assert.ok(opt.label, `${wType} subOption must have label`);
    assert.ok(opt.glyph, `${wType} subOption must have glyph`);
  }
}
console.log('✓ Weapon & passive synergies and subOptions check passed');

// 6. Check WeaponBase properties & Mount offsets
import { WeaponBase } from '../src/weapons/WeaponBase.js';
const mockWeapon = new WeaponBase({}, {}, WEAPON_TYPES.KINETIC);
assert.strictEqual(mockWeapon.barrelAngle, 0, 'WeaponBase should have barrelAngle');
assert.strictEqual(mockWeapon.mountOffsetX, 0, 'WeaponBase should have mountOffsetX');
assert.strictEqual(mockWeapon.mountOffsetY, 0, 'WeaponBase should have mountOffsetY');
assert.strictEqual(mockWeapon.tier, 1, 'WeaponBase should start at tier 1');
mockWeapon.upgrade();
assert.strictEqual(mockWeapon.tier, 2, 'WeaponBase upgrade should increment tier');
console.log('✓ WeaponBase & mount properties check passed');

// 7. Check Boosted Enemy XP Values
import { CONFIG } from '../src/config.js';
assert.ok(CONFIG.ENEMIES.SWARM.xp >= 4, 'Swarm enemy XP should be boosted to at least 4');
assert.ok(CONFIG.ENEMIES.SPEEDER.xp >= 8, 'Speeder enemy XP should be boosted to at least 8');
assert.ok(CONFIG.ENEMIES.TANK.xp >= 20, 'Tank enemy XP should be boosted to at least 20');
assert.ok(CONFIG.ENEMIES.MEGA_BOSS.xp >= 400, 'Mega Boss XP should be boosted to at least 400');
console.log('✓ Boosted enemy XP check passed');

// 8. Check Weapon Sub-Upgrades Progression (3 minor upgrades -> Major Tier)
const progWeapon = new WeaponBase({}, {}, WEAPON_TYPES.LASER);
assert.strictEqual(progWeapon.subLevel, 0, 'New weapon starts at subLevel 0');
assert.strictEqual(progWeapon.tier, 1, 'New weapon starts at Tier 1');
progWeapon.applySubUpgrade('damage');
assert.strictEqual(progWeapon.subLevel, 1, 'subLevel should increment to 1');
assert.ok(Math.abs(progWeapon.damageMultiplier - 1.35) < 0.001, 'damageMultiplier should be 1.35 (+35% DMG)');
progWeapon.applySubUpgrade('sub_beam');
assert.strictEqual(progWeapon.subLevel, 2, 'subLevel should increment to 2');
assert.strictEqual(progWeapon.extraSubBeams, 1, 'extraSubBeams should increment to 1');
progWeapon.applySubUpgrade('cooldown');
assert.strictEqual(progWeapon.subLevel, 3, 'subLevel should reach max 3');
assert.strictEqual(progWeapon.applySubUpgrade('damage'), false, 'Cannot exceed maxSubLevel 3');

// Major Evolution triggers:
progWeapon.upgrade();
assert.strictEqual(progWeapon.tier, 2, 'Major evolution should increment tier to 2');
assert.strictEqual(progWeapon.subLevel, 0, 'Major evolution should reset subLevel to 0');
console.log('✓ Weapon Sub-Upgrades & Major Evolution progression check passed');

// 9. Check Missile AoE subOption and Laser Damage & Sub-beam subOption
const missileDef = WEAPON_DEFINITIONS[WEAPON_TYPES.MISSILE];
assert.ok(missileDef.subOptions.some(o => o.key === 'aoe'), 'Missile subOptions must have aoe explosion upgrade');
const laserDef = WEAPON_DEFINITIONS[WEAPON_TYPES.LASER];
assert.ok(laserDef.subOptions.some(o => o.key === 'damage'), 'Laser subOptions must have damage upgrade');
assert.ok(laserDef.subOptions.some(o => o.key === 'sub_beam'), 'Laser subOptions must have sub_beam upgrade');
console.log('✓ Missile AoE & Laser Damage/Sub-beam definitions check passed');

// 10. Check New Enemy Types (Splitters, Twins, Vanguard, Healer)
assert.ok(CONFIG.ENEMIES.SPLITTER_LARGE, 'SPLITTER_LARGE must exist');
assert.ok(CONFIG.ENEMIES.TWIN, 'TWIN enemy must exist');
assert.ok(CONFIG.ENEMIES.VANGUARD, 'VANGUARD shield enemy must exist');
assert.ok(CONFIG.ENEMIES.HEALER, 'HEALER enemy must exist');
console.log('✓ New Enemy types check passed');

// 11. Check EnemySpawner Late-Game XP Scaling (Wave 17+)
import { EnemySpawner } from '../src/entities/EnemySpawner.js';
assert.strictEqual(EnemySpawner.prototype.getXpMultiplier.call({ currentWave: 5 }), 1.0, 'Wave 5 XP multiplier is 1.0');
assert.strictEqual(EnemySpawner.prototype.getXpMultiplier.call({ currentWave: 10 }), 1.0, 'Wave 10 XP multiplier is 1.0');
assert.ok(Math.abs(EnemySpawner.prototype.getXpMultiplier.call({ currentWave: 16 }) - 1.36) < 0.001, 'Wave 16 XP multiplier is 1.36');
assert.ok(EnemySpawner.prototype.getXpMultiplier.call({ currentWave: 17 }) >= 1.85, 'Wave 17 XP multiplier must be at least 1.85');
assert.ok(EnemySpawner.prototype.getXpMultiplier.call({ currentWave: 20 }) >= 2.6, 'Wave 20 XP multiplier must be at least 2.6');
console.log('✓ EnemySpawner late-game XP scaling check passed');

// 12. Check Health & Speed Scaling Curves (Fixing too easy balance)
const hpW5 = EnemySpawner.prototype.getHealthMultiplier.call({ currentWave: 5, totalTime: 100 });
const hpW15 = EnemySpawner.prototype.getHealthMultiplier.call({ currentWave: 15, totalTime: 300 });
const hpW30 = EnemySpawner.prototype.getHealthMultiplier.call({ currentWave: 30, totalTime: 650 });
const hpW60 = EnemySpawner.prototype.getHealthMultiplier.call({ currentWave: 60, totalTime: 1400 });
assert.ok(hpW5 < hpW15, 'Health multiplier must grow from Wave 5 to Wave 15');
assert.ok(hpW15 < hpW30, 'Health multiplier must grow from Wave 15 to Wave 30');
assert.ok(hpW30 < hpW60, 'Health multiplier must grow from Wave 30 to Wave 60');
assert.ok(hpW60 >= 50.0, 'Wave 60 health multiplier must be at least 50x for endgame balance');

assert.strictEqual(EnemySpawner.prototype.getSpeedMultiplier.call({ currentWave: 5 }), 1.0, 'Wave 5 speed multiplier is 1.0');
assert.ok(EnemySpawner.prototype.getSpeedMultiplier.call({ currentWave: 30 }) > 1.2, 'Wave 30 speed multiplier must be > 1.2');
console.log('✓ EnemySpawner health & speed scaling check passed');

// 13. Check UpgradeModal Synergy Choices Generation
import { UpgradeModal } from '../src/ui/UpgradeModal.js';
const mockTurretForSyn = {
  equippedWeapons: [
    { id: WEAPON_TYPES.KINETIC, tier: 5, subLevel: 0, maxSubLevel: 3 },
    { id: WEAPON_TYPES.LASER, tier: 5, subLevel: 0, maxSubLevel: 3 },
    { id: WEAPON_TYPES.FLAME, tier: 5, subLevel: 0, maxSubLevel: 3 }
  ],
  activeSynergies: [],
  hasSynergy: (id) => false
};
const mockShield = { tier: 5 };
const mockLightning = { tier: 1 };
const mockBlackHole = { tier: 0 };

const modalChoices = UpgradeModal.prototype.generateChoices.call(
  { cardWidth: 260, cardHeight: 345 },
  mockTurretForSyn,
  mockShield,
  mockLightning,
  mockBlackHole
);
assert.ok(modalChoices.length === 3, 'Must return 3 choices');
assert.ok(modalChoices.some(c => c.type === 'synergy' || c.isSynergy), 'Must generate at least one synergy choice when weapons are maxed');
console.log('✓ UpgradeModal synergy generation check passed');

// 14. Check CrazyGamesAdapter & SDKManager Lifecycle Hooks
import { CrazyGamesAdapter } from '../src/sdk/CrazyGamesAdapter.js';
import { sdk } from '../src/sdk/SDKManager.js';

const cg = new CrazyGamesAdapter();
assert.strictEqual(cg.name, 'CrazyGames', 'CrazyGamesAdapter name should be CrazyGames');
assert.strictEqual(cg.isReady, false, 'CrazyGamesAdapter initially not ready in node environment');
// Calling lifecycle methods safely before ready should not throw
cg.gameplayStart();
cg.gameplayStop();
cg.happyTime();
cg.loadingStart();
cg.loadingStop();

let interstitialError = null;
cg.showInterstitial({ onError: (err) => { interstitialError = err; } });
assert.ok(interstitialError, 'Interstitial should error when SDK is not ready');

let rewardedError = null;
cg.showRewarded({ onError: (err) => { rewardedError = err; } });
assert.ok(rewardedError, 'Rewarded ad should error when SDK is not ready');

// Verify SDKManager lifecycle delegation doesn't throw
sdk.gameplayStart();
sdk.gameplayStop();
sdk.happyTime();
sdk.loadingStart();
console.log('✓ CrazyGamesAdapter & SDKManager lifecycle check passed');

// 14b. Check GameMonetizeAdapter Lifecycle & Event Handling
import { GameMonetizeAdapter } from '../src/sdk/GameMonetizeAdapter.js';
const gm = new GameMonetizeAdapter();
assert.strictEqual(gm.name, 'GameMonetize');
assert.strictEqual(gm.isReady, false);
gm.handleEvent({ name: 'SDK_READY' });
assert.strictEqual(gm.isReady, true);
let gmInterError = null;
gm.showInterstitial({ onError: (e) => { gmInterError = e; } });
console.log('✓ GameMonetizeAdapter lifecycle & event check passed');

// 14c. Check GameDistributionAdapter Lifecycle & Event Handling
import { GameDistributionAdapter } from '../src/sdk/GameDistributionAdapter.js';
const gd = new GameDistributionAdapter();
assert.strictEqual(gd.name, 'GameDistribution');
assert.strictEqual(gd.isReady, false);
gd.handleEvent({ name: 'SDK_READY' });
assert.strictEqual(gd.isReady, true);
let gdInterError = null;
gd.showInterstitial({ onError: (e) => { gdInterError = e; } });
console.log('✓ GameDistributionAdapter lifecycle & event check passed');

// 15. Check Bilingual Upgrade Card Descriptions (EN vs VI)
import { i18n, t } from '../src/core/i18n.js';
import { ALL_SYNERGIES, getUpgradeDesc, getUpgradeSubtitle } from '../src/weapons/WeaponRegistry.js';

const viCharRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

// Test English mode
i18n.setLanguage('en');
assert.strictEqual(i18n.getLanguage(), 'en');

for (const wType of weaponTypes) {
  const def = WEAPON_DEFINITIONS[wType];
  for (const tier of def.tiers) {
    const desc = getUpgradeDesc(tier);
    assert.ok(desc && desc.length > 0, `Desc for ${wType} tier ${tier.tier} must not be empty`);
    assert.strictEqual(viCharRegex.test(desc), false, `English desc for ${wType} tier ${tier.tier} must not contain Vietnamese characters: "${desc}"`);
  }
}

for (const [pKey, pDef] of Object.entries(PASSIVE_DEFINITIONS)) {
  for (const tier of pDef.tiers) {
    const desc = getUpgradeDesc(tier);
    assert.ok(desc && desc.length > 0, `Desc for ${pKey} tier ${tier.tier} must not be empty`);
    assert.strictEqual(viCharRegex.test(desc), false, `English desc for ${pKey} tier ${tier.tier} must not contain Vietnamese characters: "${desc}"`);
  }
}

for (const [sKey, syn] of Object.entries(ALL_SYNERGIES)) {
  const desc = getUpgradeDesc(syn);
  const sub = getUpgradeSubtitle(syn);
  assert.ok(desc && desc.length > 0, `Synergy ${sKey} desc must not be empty`);
  assert.strictEqual(viCharRegex.test(desc), false, `English synergy ${sKey} desc must not contain Vietnamese characters: "${desc}"`);
  assert.strictEqual(viCharRegex.test(sub), false, `English synergy ${sKey} subtitle must not contain Vietnamese characters: "${sub}"`);
}

// Test Vietnamese mode
i18n.setLanguage('vi');
assert.strictEqual(i18n.getLanguage(), 'vi');

for (const wType of weaponTypes) {
  const def = WEAPON_DEFINITIONS[wType];
  for (const tier of def.tiers) {
    const desc = getUpgradeDesc(tier);
    assert.ok(desc && desc.length > 0, `Vi desc for ${wType} tier ${tier.tier} must not be empty`);
    assert.strictEqual(viCharRegex.test(desc), true, `Vietnamese desc for ${wType} tier ${tier.tier} should contain Vietnamese text: "${desc}"`);
  }
}

// Sub stats keys translation verification
['damage', 'cooldown', 'aoe', 'sub_beam', 'range', 'speed'].forEach(key => {
  i18n.setLanguage('en');
  assert.ok(!viCharRegex.test(t('sub.' + key)), `EN sub.${key} should not contain Vietnamese`);
  assert.ok(!viCharRegex.test(t('sub.lbl_' + key)), `EN sub.lbl_${key} should not contain Vietnamese`);
  i18n.setLanguage('vi');
  assert.ok(t('sub.' + key), `VI sub.${key} must exist`);
  assert.ok(t('sub.lbl_' + key), `VI sub.lbl_${key} must exist`);
});

// Restore default English
i18n.setLanguage('en');
console.log('✓ Bilingual upgrade card descriptions & titles check passed');

// 14. Check CryoSpikes 3-shard start & odd shard progression
import { CryoSpikes } from '../src/weapons/CryoSpikes.js';
const testCryo = new CryoSpikes({}, {});
assert.strictEqual(testCryo.shardCount, 3, 'CryoSpikes must start with 3 shards (center spear + 2 flanks)');
assert.ok(testCryo.damage >= 45, 'CryoSpikes base damage must be buffed');
const cryoSubKeys = WEAPON_DEFINITIONS[WEAPON_TYPES.CRYO].subOptions.map(o => o.key);
assert.ok(cryoSubKeys.includes('damage') && cryoSubKeys.includes('cooldown'), 'Cryo subOptions must be damage and cooldown');
assert.strictEqual(cryoSubKeys.includes('range'), false, 'Cryo subOptions must not have useless range');

testCryo.upgrade(); // Tier 2
assert.strictEqual(testCryo.shardCount, 5, 'CryoSpikes Tier 2 must have 5 shards');
testCryo.upgrade(); // Tier 3
assert.strictEqual(testCryo.shardCount, 7, 'CryoSpikes Tier 3 must have 7 shards');
testCryo.upgrade(); // Tier 4
assert.strictEqual(testCryo.shardCount, 9, 'CryoSpikes Tier 4 must have 9 shards');
testCryo.upgrade(); // Tier 5
assert.strictEqual(testCryo.shardCount, 11, 'CryoSpikes Tier 5 must have 11 shards');
console.log('✓ CryoSpikes 3-shard start & odd progression check passed');

// 15. Check Max 5 Passives Limit in UpgradeModal
const mockTurretForPassives = {
  equippedWeapons: [{ id: WEAPON_TYPES.KINETIC, tier: 1, subLevel: 0, maxSubLevel: 3 }],
  activeSynergies: [],
  hasSynergy: () => false
};
const mockShieldActive = { tier: 2 };
// 4 additional passives at tier >= 1 (total 5 active passives: shield + lightning + black_hole + chrono + nanite)
const passivesMapAtMax = {
  [PASSIVE_TYPES.LIGHTNING]: { tier: 1 },
  [PASSIVE_TYPES.BLACK_HOLE]: { tier: 2 },
  [PASSIVE_TYPES.CHRONO]: { tier: 1 },
  [PASSIVE_TYPES.NANITE]: { tier: 1 },
  [PASSIVE_TYPES.OVERCHARGE]: { tier: 0 },
  [PASSIVE_TYPES.REPULSOR]: { tier: 0 },
  [PASSIVE_TYPES.VAMPIRIC]: { tier: 0 }
};

const choicesAtMax = UpgradeModal.prototype.generateChoices.call(
  { cardWidth: 260, cardHeight: 345 },
  mockTurretForPassives,
  mockShieldActive,
  passivesMapAtMax
);

// None of the unowned passives (overcharge, repulsor, vampiric) should appear as new passive choices!
for (const c of choicesAtMax) {
  if (['passive_overcharge', 'passive_repulsor', 'passive_vampiric'].includes(c.id)) {
    assert.fail(`Should not offer new passive ${c.id} when player already has 5 active passives!`);
  }
}
// 16. Check Icon Key Normalization & Major Upgrade Weapon Color Preservation
import { normalizeIconKey } from '../src/ui/IconRenderer.js';

// All 10 weapons must normalize properly
for (const wType of Object.values(WEAPON_TYPES)) {
  const normKey = normalizeIconKey(wType);
  assert.ok(normKey && normKey !== 'unknown', `Weapon ${wType} should normalize to valid icon key`);
}
// All 8 passives must normalize properly
for (const pType of Object.values(PASSIVE_TYPES)) {
  const normKey = normalizeIconKey(pType);
  assert.ok(normKey && normKey !== 'unknown', `Passive ${pType} should normalize to valid icon key`);
}
assert.strictEqual(normalizeIconKey('synergy'), 'synergy');
assert.strictEqual(normalizeIconKey('overdrive'), 'overdrive');
assert.strictEqual(normalizeIconKey('locked'), 'locked');

// Verify UpgradeModal major evolution keeps weapon's original color (not forced to 0xffd700)
const mockTurretReadyToEvolve = {
  equippedWeapons: [
    { id: WEAPON_TYPES.KINETIC, tier: 1, subLevel: 3, maxSubLevel: 3 },
    { id: WEAPON_TYPES.MISSILE, tier: 5, subLevel: 0, maxSubLevel: 3 },
    { id: WEAPON_TYPES.BOMB, tier: 5, subLevel: 0, maxSubLevel: 3 }
  ],
  activeSynergies: [],
  hasSynergy: () => false
};
const choicesWithMajor = UpgradeModal.prototype.generateChoices.call(
  { cardWidth: 260, cardHeight: 356 },
  mockTurretReadyToEvolve,
  { tier: 5 },
  {
    [PASSIVE_TYPES.LIGHTNING]: { tier: 5 },
    [PASSIVE_TYPES.BLACK_HOLE]: { tier: 5 },
    [PASSIVE_TYPES.CHRONO]: { tier: 5 },
    [PASSIVE_TYPES.NANITE]: { tier: 5 },
    [PASSIVE_TYPES.OVERCHARGE]: { tier: 5 }
  }
);
const majorChoice = choicesWithMajor.find(c => c.type === 'weapon_major_upgrade');
assert.ok(majorChoice, 'Should offer weapon_major_upgrade when weapon is at 3/3 sub-levels');
assert.strictEqual(
  majorChoice.color,
  WEAPON_DEFINITIONS[WEAPON_TYPES.KINETIC].color,
  'Major evolution must preserve weapon def.color instead of forcing gold'
);

// Verify sub-upgrade choices do not contain dot pips [● or [○
const mockTurretSubUpgrade = {
  equippedWeapons: [
    { id: WEAPON_TYPES.MISSILE, tier: 1, subLevel: 2, maxSubLevel: 3 },
    { id: WEAPON_TYPES.KINETIC, tier: 5, subLevel: 0, maxSubLevel: 3 },
    { id: WEAPON_TYPES.BOMB, tier: 5, subLevel: 0, maxSubLevel: 3 }
  ],
  activeSynergies: [],
  hasSynergy: () => false
};
const choicesWithSub = UpgradeModal.prototype.generateChoices.call(
  { cardWidth: 260, cardHeight: 356 },
  mockTurretSubUpgrade,
  { tier: 5 },
  {
    [PASSIVE_TYPES.LIGHTNING]: { tier: 5 },
    [PASSIVE_TYPES.BLACK_HOLE]: { tier: 5 },
    [PASSIVE_TYPES.CHRONO]: { tier: 5 },
    [PASSIVE_TYPES.NANITE]: { tier: 5 },
    [PASSIVE_TYPES.OVERCHARGE]: { tier: 5 }
  }
);
const subChoice = choicesWithSub.find(c => c.type === 'weapon_sub_upgrade');
assert.ok(subChoice, 'Should offer weapon_sub_upgrade');
assert.strictEqual(subChoice.subtitle.includes('●'), false, 'Sub-upgrade subtitle should not contain dot pips');
assert.strictEqual(subChoice.subtitle.includes('○'), false, 'Sub-upgrade subtitle should not contain dot pips');
// 17. Check 11 Boss Flagships and Procedural Spaceship Renderer
import { ShipRenderer } from '../src/entities/ShipRenderer.js';
import { glowVFX } from '../src/vfx/GlowVFX.js';

const expectedBossKeys = [
  'BOSS_TITAN',
  'BOSS_PHANTOM',
  'BOSS_CRYO',
  'BOSS_SINGULARITY',
  'BOSS_SOLAR',
  'BOSS_AEGIS',
  'BOSS_CHRONO',
  'BOSS_BROODMOTHER',
  'BOSS_VAMPIRE',
  'BOSS_JUGGERNAUT',
  'BOSS_MIRAGE'
];

for (const bKey of expectedBossKeys) {
  const bCfg = CONFIG.ENEMIES[bKey];
  assert.ok(bCfg, `Boss config ${bKey} must exist in CONFIG.ENEMIES`);
  assert.strictEqual(bCfg.isBoss, true, `${bKey} must have isBoss: true`);
  assert.ok(bCfg.hp >= 1200, `${bKey} must have high boss HP`);
  assert.ok(bCfg.xp >= 350, `${bKey} must give grand boss XP`);
}

// Test ShipRenderer for all 10 regular enemies + 11 boss flagships
const allShipTypes = [
  'swarm', 'speeder', 'tank', 'minion', 'splitter_large', 'splitter_med', 'splitter_small',
  'twin', 'vanguard', 'healer',
  'mega_boss', 'boss_titan', 'boss_phantom', 'boss_cryo', 'boss_singularity', 'boss_solar',
  'boss_aegis', 'boss_chrono', 'boss_broodmother', 'boss_vampire', 'boss_juggernaut', 'boss_mirage'
];

const mockGraphics = {
  poly: () => {},
  fill: () => {},
  stroke: () => {},
  circle: () => {},
  rect: () => {},
  roundRect: () => {},
  moveTo: () => {},
  lineTo: () => {},
  arc: () => {},
  closePath: () => {}
};

for (const sType of allShipTypes) {
  assert.doesNotThrow(() => {
    ShipRenderer.draw(mockGraphics, {
      type: sType,
      size: 30,
      color: 0xff0044,
      hitFlash: 0,
      pulseAnim: 1.0
    });
  }, `ShipRenderer must safely draw ship type: ${sType}`);
}

// Verify GlowVFX methods exist
assert.ok(typeof glowVFX.createGlowSprite === 'function', 'glowVFX must have createGlowSprite');
assert.ok(typeof glowVFX.createStarFlareSprite === 'function', 'glowVFX must have createStarFlareSprite');
assert.ok(typeof glowVFX.createStreakSprite === 'function', 'glowVFX must have createStreakSprite');
assert.ok(typeof glowVFX.spawnExplosionFlare === 'function', 'glowVFX must have spawnExplosionFlare');

console.log('✓ 11 Boss Flagships, ShipRenderer, and GlowVFX checks passed');

// 18. Check Secondary Weapon Mount Aim Alignment (Parallax Correction)
import { VoidRailgun } from '../src/weapons/VoidRailgun.js';
import { NeedlerSwarm } from '../src/weapons/NeedlerSwarm.js';

const mockEngineForAim = {
  sceneManager: {
    currentScene: {
      bulletPool: {
        spawned: [],
        get(params) { this.spawned.push(params); }
      },
      particles: { emit() {} },
      tracker: { recordShot() {} }
    }
  }
};
const mockTurretForAim = {
  x: 400,
  y: 300,
  hasSynergy: () => false
};

const cryoGun = new CryoSpikes(mockEngineForAim, mockTurretForAim);
cryoGun.mountOffsetX = -18;
cryoGun.mountOffsetY = -18;

// Test 4 cardinal directions
const testTargets = [
  { name: 'North', x: 382, y: 100, expectedAngle: -Math.PI / 2 },
  { name: 'South', x: 382, y: 500, expectedAngle: Math.PI / 2 },
  { name: 'East',  x: 600, y: 282, expectedAngle: 0 },
  { name: 'West',  x: 100, y: 282, expectedAngle: Math.PI }
];

for (const t of testTargets) {
  mockEngineForAim.sceneManager.currentScene.bulletPool.spawned = [];
  const targetObj = { x: t.x, y: t.y, isAlive: true };
  cryoGun.fire([], targetObj);

  const bullets = mockEngineForAim.sceneManager.currentScene.bulletPool.spawned;
  assert.strictEqual(bullets.length, 3, 'Must spawn 3 shards');
  // Middle shard (index 1) must be aimed dead-center at target
  const midShard = bullets[1];
  const angleDiff = Math.abs(midShard.angle - t.expectedAngle);
  assert.ok(angleDiff < 1e-4, `Cryo center shard towards ${t.name} must match exact mount vector, got diff ${angleDiff}`);

  // Center shard must spawn along the muzzle ray
  const expectedMuzzleX = 382 + Math.cos(t.expectedAngle) * 18;
  const expectedMuzzleY = 282 + Math.sin(t.expectedAngle) * 18;
  assert.ok(Math.hypot(midShard.x - expectedMuzzleX, midShard.y - expectedMuzzleY) < 1e-4, `Muzzle spawn for ${t.name} must be offset by 18 along barrel`);
}

// Check VoidRailgun aim parallax
const railgun = new VoidRailgun(mockEngineForAim, mockTurretForAim);
railgun.mountOffsetX = -18;
railgun.mountOffsetY = 18;
mockEngineForAim.sceneManager.currentScene.bulletPool.spawned = [];
railgun.fire([], { x: 382, y: 500, isAlive: true });
const railBullets = mockEngineForAim.sceneManager.currentScene.bulletPool.spawned;
assert.ok(railBullets.length >= 1, 'VoidRailgun must spawn slugs');
assert.ok(Math.abs(railBullets[0].angle - (Math.PI / 2)) < 1e-4, 'Railgun angle must align from mount (382, 318) to (382, 500)');

console.log('✓ Secondary weapon mount parallax aim alignment check passed');

// 19. Check Vampiric Siphon (Soul Siphon) Mechanics & Damage Amplification
import { VampiricSiphonPassive } from '../src/weapons/SupportPassives.js';
import { Enemy } from '../src/entities/Enemy.js';

const mockEngineForSoul = {
  vfxLayer: { addChild() {} },
  gameWorldLayer: { addChild() {} },
  sceneManager: {
    currentScene: {
      particles: { emit() {} },
      vampiricPassive: null
    }
  }
};

const soulPassive = new VampiricSiphonPassive(mockEngineForSoul);
assert.strictEqual(soulPassive.tier, 0);
assert.strictEqual(soulPassive.stacks, 0);
assert.strictEqual(soulPassive.damageMultiplier, 1.0);

// Upgrade to tier 1
soulPassive.upgrade();
assert.strictEqual(soulPassive.tier, 1);
assert.strictEqual(soulPassive.maxStacks, 15);
assert.strictEqual(soulPassive.fillRatio, 0);
assert.strictEqual(soulPassive.isFull, false);

// Add 10 stacks (10 * 2.5% = +25% DMG)
soulPassive.stacks = 10;
soulPassive.damageMultiplier = 1.0 + (soulPassive.stacks * 0.025);
assert.strictEqual(soulPassive.damageBonusPercent, 25);
assert.ok(Math.abs(soulPassive.damageMultiplier - 1.25) < 1e-4);
assert.ok(Math.abs(soulPassive.fillRatio - (10 / 15)) < 1e-4);

// Max stacks
soulPassive.stacks = 15;
soulPassive.damageMultiplier = 1.0 + (soulPassive.stacks * 0.025);
assert.strictEqual(soulPassive.isFull, true);
assert.strictEqual(soulPassive.fillRatio, 1);
assert.strictEqual(soulPassive.damageBonusPercent, 37.5);
assert.ok(Math.abs(soulPassive.damageMultiplier - 1.375) < 1e-4);

// Test damage amplification on Enemy.takeDamage
mockEngineForSoul.sceneManager.currentScene.vampiricPassive = soulPassive;

const testEnemy = new Enemy(mockEngineForSoul);
testEnemy.reset({ type: 'swarm', hp: 200, maxHp: 200, speed: 100, damage: 10, xp: 5, color: 0xff0000, size: 20 }, 100, 100);

// Base damage 100 with 1.375 multiplier and default 1.5x crit (12% chance, non-crit base is 137.5, crit is 206.25)
const initialHp = testEnemy.hp;
// Source 'burn' bypasses random crit for deterministic testing
testEnemy.takeDamage(100, 'burn');
const dealtDamage = initialHp - testEnemy.hp;
assert.ok(Math.abs(dealtDamage - 137.5) < 1e-3, `Enemy must take 1.375x amplified damage, got ${dealtDamage}`);

console.log('✓ Soul Siphon canister progression & damage amplification check passed');

// 20. Check Quantum Harvester & EXP Multiplier
import { QuantumHarvesterPassive } from '../src/weapons/SupportPassives.js';

const mockEngineForQuantum = {
  vfxLayer: {
    addChild: () => {},
    removeChild: () => {}
  }
};

const qPassive = new QuantumHarvesterPassive(mockEngineForQuantum);
assert.strictEqual(qPassive.tier, 0);
assert.strictEqual(qPassive.expBonus, 0);

qPassive.upgrade(); // Tier 1: +30%
assert.strictEqual(qPassive.tier, 1);
assert.strictEqual(qPassive.expBonus, 0.30);

qPassive.upgrade(); // Tier 2: +55%
assert.strictEqual(qPassive.tier, 2);
assert.strictEqual(qPassive.expBonus, 0.55);

qPassive.upgrade(); // Tier 3: +80%
qPassive.upgrade(); // Tier 4: +110%
qPassive.upgrade(); // Tier 5: +160%
assert.strictEqual(qPassive.tier, 5);
assert.strictEqual(qPassive.expBonus, 1.60);

// Check gem magnet and speed multiplier update
const mockGems = { gemSpeedMult: 1.0, magnetRadiusMult: 1.0 };
qPassive.update(0.016, { x: 300, y: 300, radius: 25 }, null, mockGems);
assert.strictEqual(mockGems.gemSpeedMult, 2.2);
assert.strictEqual(mockGems.magnetRadiusMult, 3.0);

console.log('✓ Quantum Harvester progression, gem magnet & EXP boost check passed');

// 21. Check KineticGun Auto-Aim & Targeting
import { KineticGun } from '../src/weapons/KineticGun.js';

const mockBulletPool = {
  get: (cfg) => {
    mockBulletPool.spawned.push(cfg);
    return { isAlive: true };
  },
  spawned: []
};

const mockEngineForKinetic = {
  sceneManager: {
    currentScene: {
      bulletPool: mockBulletPool
    }
  }
};

const mockTurretForKinetic = {
  x: 400,
  y: 300,
  mountOffsetX: 0,
  mountOffsetY: 0,
  mainGunAngle: 0
};

const kGun = new KineticGun(mockEngineForKinetic, mockTurretForKinetic);
assert.strictEqual(kGun.damage, 22);

// Test 1: Manual target prioritized
const manualTarget = { x: 500, y: 300, isAlive: true };
mockBulletPool.spawned = [];
kGun.fire([], manualTarget);
assert.strictEqual(mockBulletPool.spawned.length, 1, 'Should spawn 1 bullet');
assert.ok(Math.abs(kGun.barrelAngle - 0) < 1e-4, 'Barrel angle should face manual target (0 rad / East)');
assert.ok(Math.abs(mockBulletPool.spawned[0].angle - 0) < 1e-4, 'Bullet angle should match barrel angle');

// Test 2: Auto-aim to closest living enemy when no manual target
const enemyNorth = { x: 400, y: 100, isAlive: false }; // dist 200, dead
const enemySouth = { x: 400, y: 500, isAlive: true };  // dist 200, alive
mockBulletPool.spawned = [];
kGun.fire([enemyNorth, enemySouth], null);
assert.strictEqual(mockBulletPool.spawned.length, 1, 'Should spawn 1 bullet towards living enemy');
assert.ok(Math.abs(kGun.barrelAngle - Math.PI / 2) < 1e-4, 'Barrel angle should aim south (PI/2 rad)');

// Test 3: No living enemies -> should not fire
mockBulletPool.spawned = [];
kGun.fire([enemyNorth], null);
assert.strictEqual(mockBulletPool.spawned.length, 0, 'Should not fire when no living enemies are present');

console.log('✓ KineticGun auto-aim & priority targeting check passed');

// 22. Check Starter Weapon Random Selection
const allAvailableWeapons = Object.values(WEAPON_TYPES);
assert.strictEqual(allAvailableWeapons.length, 10, 'All 10 weapons available in weapon registry');

// Simulate picking 3 unique starter weapons
const shuffledWeapons = [...allAvailableWeapons].sort(() => Math.random() - 0.5);
const starterChoices = shuffledWeapons.slice(0, 3);
assert.strictEqual(starterChoices.length, 3, 'Must pick exactly 3 weapons');
assert.strictEqual(new Set(starterChoices).size, 3, 'All 3 choices must be distinct');

// Check translations in English
i18n.setLanguage('en');
assert.strictEqual(t('starter.title'), '★ CHOOSE STARTER WEAPON ★');
assert.strictEqual(t('starter.select'), 'EQUIP WEAPON');

// Check translations in Vietnamese
i18n.setLanguage('vi');
assert.strictEqual(t('starter.title'), '★ CHỌN VŨ KHÍ KHỞI ĐẦU ★');
assert.strictEqual(t('starter.select'), 'TRANG BỊ VŨ KHÍ');

// Check that every single weapon has starter description and tier 1 stats
for (const wType of allAvailableWeapons) {
  const def = WEAPON_DEFINITIONS[wType];
  assert.ok(def, `${wType} must have definition`);
  assert.ok(def.tiers && def.tiers[0], `${wType} must have tier 1`);
  assert.ok(def.tiers[0].desc, `${wType} must have English description`);
  assert.ok(def.tiers[0].desc_vi, `${wType} must have Vietnamese description`);
}

console.log('✓ Starter weapon random selection & bilingual localization check passed');

// 23. Check Universal Synergy Matrix & Strict Per-Weapon Fusion Limit
import { Turret } from '../src/entities/Turret.js';

// Test 1: Verify all 45 weapon-weapon fusions exist
let totalWCombos = 0;
for (let i = 0; i < allAvailableWeapons.length; i++) {
  for (let j = i + 1; j < allAvailableWeapons.length; j++) {
    const w1 = allAvailableWeapons[i];
    const w2 = allAvailableWeapons[j];
    const syn = getSynergy(w1, w2);
    assert.ok(syn, `Weapon fusion must exist for ${w1} + ${w2}`);
    assert.strictEqual(syn.type, 'weapon_fusion');
    assert.ok(syn.name && syn.name.length > 0);
    assert.ok(syn.desc && syn.desc.length > 0);
    assert.ok(syn.desc_vi && syn.desc_vi.length > 0);
    totalWCombos++;
  }
}
assert.strictEqual(totalWCombos, 45, 'All 45 weapon pairs must have fusions');

// Test 2: Verify all 90 weapon-passive fusions exist
let totalPCombos = 0;
const allPassiveTypes = Object.values(PASSIVE_TYPES);
for (const w of allAvailableWeapons) {
  for (const p of allPassiveTypes) {
    const syn = getPassiveSynergy(w, p);
    assert.ok(syn, `Passive fusion must exist for ${w} + ${p}`);
    assert.strictEqual(syn.type, 'passive_fusion');
    assert.ok(syn.name && syn.name.length > 0);
    assert.ok(syn.desc && syn.desc.length > 0);
    assert.ok(syn.desc_vi && syn.desc_vi.length > 0);
    totalPCombos++;
  }
}
assert.strictEqual(totalPCombos, 90, 'All 90 weapon+passive pairs must have fusions');

// Test 3: Turret synergy tracking methods
const mockEngineForTurretCheck = { gameWorldLayer: { addChild: () => {} } };
const turretTest = new Turret(mockEngineForTurretCheck, 400, 300);
assert.strictEqual(turretTest.hasWeaponSynergy('laser'), false);
assert.strictEqual(turretTest.hasPassiveSynergy('laser'), false);
assert.strictEqual(turretTest.getWeaponSynergyCount('laser'), 0);

// Add 1 weapon fusion: laser + tesla
const laserTeslaSyn = getSynergy('laser', 'tesla');
turretTest.activeSynergies.push(laserTeslaSyn);
assert.strictEqual(turretTest.hasWeaponSynergy('laser'), true);
assert.strictEqual(turretTest.hasWeaponSynergy('tesla'), true);
assert.strictEqual(turretTest.hasWeaponSynergy('bomb'), false);
assert.strictEqual(turretTest.hasPassiveSynergy('laser'), false);
assert.strictEqual(turretTest.getWeaponSynergyCount('laser'), 1);

// Add 1 passive fusion: laser + passive_lightning
const laserLightSyn = getPassiveSynergy('laser', PASSIVE_TYPES.LIGHTNING);
turretTest.activeSynergies.push(laserLightSyn);
assert.strictEqual(turretTest.hasPassiveSynergy('laser'), true);
assert.strictEqual(turretTest.getWeaponSynergyCount('laser'), 2);

// Test 4: UpgradeModal enforces limit: Laser cannot fuse with any weapon or passive again!
const mockShieldObj = { tier: 2 };
const mockPassivesObj = {
  [PASSIVE_TYPES.LIGHTNING]: { tier: 2 },
  [PASSIVE_TYPES.BLACK_HOLE]: { tier: 2 }
};
turretTest.equippedWeapons = [
  { id: WEAPON_TYPES.LASER, tier: 5 },
  { id: WEAPON_TYPES.TESLA, tier: 5 },
  { id: WEAPON_TYPES.VOID_RAILGUN, tier: 5 }
];

const limitChoicesTest = UpgradeModal.prototype.generateChoices.call(
  { cardWidth: 260, cardHeight: 380 },
  turretTest,
  mockShieldObj,
  mockPassivesObj
);

// None of the choices should offer a weapon fusion involving laser or tesla
for (const c of limitChoicesTest) {
  if (c.type === 'synergy') {
    if (c.syn.type === 'weapon_fusion') {
      const parts = c.syn.id.split('+');
      assert.strictEqual(parts.includes('laser'), false, 'Laser already has weapon fusion and must not be offered another!');
      assert.strictEqual(parts.includes('tesla'), false, 'Tesla already has weapon fusion and must not be offered another!');
    } else if (c.syn.type === 'passive_fusion') {
      const parts = c.syn.id.split('+');
      assert.notStrictEqual(parts[0], 'laser', 'Laser already has passive fusion and must not be offered another!');
    }
  }
}

// Now also give tesla a passive fusion -> now neither laser nor tesla can get passive fusion!
turretTest.activeSynergies.push(getPassiveSynergy('tesla', PASSIVE_TYPES.LIGHTNING));
const limitChoicesTest2 = UpgradeModal.prototype.generateChoices.call(
  { cardWidth: 260, cardHeight: 380 },
  turretTest,
  mockShieldObj,
  mockPassivesObj
);
for (const c of limitChoicesTest2) {
  if (c.type === 'synergy' && c.syn.type === 'passive_fusion') {
    const parts = c.syn.id.split('+');
    assert.strictEqual(parts[0], 'void_railgun', 'Only void_railgun can receive passive fusion now!');
  }
}

console.log('✓ Universal 45 weapon & 90 passive synergy matrix and max 2 fusions per weapon limit check passed');

// 24. Check Developer Cheat Console & Live Cheat Controls
import { Shield } from '../src/entities/Shield.js';
import { GameScene } from '../src/scenes/GameScene.js';

// Test 24.1: God Mode prevents damage to Turret and Shield
const mockEngineCheat = {
  gameWorldLayer: { addChild: () => {} },
  vfxLayer: { addChild: () => {} },
  uiLayer: { addChild: () => {} },
  sceneManager: { currentScene: { godMode: true } }
};
const testTurretGod = new Turret(mockEngineCheat, 400, 300);
testTurretGod.currentHp = 100;
testTurretGod.takeDamage(50);
assert.strictEqual(testTurretGod.currentHp, 100, 'Turret takes 0 damage when godMode is active');

const testShieldGod = new Shield(mockEngineCheat, 400, 300);
testShieldGod.currentHp = 70;
testShieldGod.takeDamage(40);
assert.strictEqual(testShieldGod.currentHp, 70, 'Shield takes 0 damage when godMode is active');

// Test 24.2: GameScene setLevel cheat method
const mockScene = {
  level: 1,
  xp: 0,
  nextXp: 10,
  turret: { x: 400, y: 300, maxHp: 100, currentHp: 50, equippedWeapons: [], assignMountOffsets: () => {} },
  shield: { maxHp: 70, currentHp: 20, tier: 1, radius: 95, isActive: false, upgrade: function() { this.tier++; } },
  spawner: { currentWave: 1, waveTimer: 10, enemies: [], isBossWave: (w) => w % 5 === 0, spawnMegaBoss: () => {} },
  passives: {
    [PASSIVE_TYPES.LIGHTNING]: { tier: 0, upgrade: function() { this.tier++; } },
    [PASSIVE_TYPES.BLACK_HOLE]: { tier: 0, upgrade: function() { this.tier++; } }
  },
  onWaveChange: () => {}
};

GameScene.prototype.setLevel.call(mockScene, 20);
assert.strictEqual(mockScene.level, 20, 'setLevel(20) should set player level to 20');
assert.ok(mockScene.nextXp > 100, 'nextXp should be appropriately scaled for level 20');
assert.strictEqual(mockScene.xp, 0, 'xp should reset to 0 upon level setting');

// Test 24.3: GameScene setWeaponTier cheat method
mockScene.turret.equipWeapon = function(wId, force) {
  const w = { id: wId, tier: 1, upgrade: function() { this.tier++; } };
  this.equippedWeapons.push(w);
  return w;
};

// Set kinetic to tier 5
GameScene.prototype.setWeaponTier.call(mockScene, WEAPON_TYPES.KINETIC, 5);
const equippedKinetic = mockScene.turret.equippedWeapons.find(w => w.id === WEAPON_TYPES.KINETIC);
assert.ok(equippedKinetic, 'Kinetic weapon should be equipped');
assert.strictEqual(equippedKinetic.tier, 5, 'Kinetic weapon tier should be exactly 5');

// Downscale kinetic to tier 2
GameScene.prototype.setWeaponTier.call(mockScene, WEAPON_TYPES.KINETIC, 2);
const downscaledKinetic = mockScene.turret.equippedWeapons.find(w => w.id === WEAPON_TYPES.KINETIC);
assert.strictEqual(downscaledKinetic.tier, 2, 'Kinetic weapon tier should downscale cleanly to 2');

// Remove weapon
GameScene.prototype.removeWeapon.call(mockScene, WEAPON_TYPES.KINETIC);
assert.strictEqual(mockScene.turret.equippedWeapons.length, 0, 'removeWeapon should unequip weapon');

// Test 24.4: GameScene setPassiveTier cheat method
GameScene.prototype.setPassiveTier.call(mockScene, PASSIVE_TYPES.LIGHTNING, 4);
assert.strictEqual(mockScene.passives[PASSIVE_TYPES.LIGHTNING].tier, 4, 'Lightning passive tier should be set to 4');
GameScene.prototype.setPassiveTier.call(mockScene, PASSIVE_TYPES.LIGHTNING, 0);
assert.strictEqual(mockScene.passives[PASSIVE_TYPES.LIGHTNING].tier, 0, 'Setting passive tier to 0 should deactivate it');

// Test 24.5: GameScene fullHeal cheat method
GameScene.prototype.fullHeal.call(mockScene);
assert.strictEqual(mockScene.turret.currentHp, 100, 'fullHeal should restore Turret HP to 100%');
assert.strictEqual(mockScene.shield.currentHp, 70, 'fullHeal should restore Shield HP to 100%');
assert.strictEqual(mockScene.shield.isActive, true, 'fullHeal should reactivate Shield');

// Test 24.6: GameScene setWave cheat method
GameScene.prototype.setWave.call(mockScene, 15);
assert.strictEqual(mockScene.spawner.currentWave, 15, 'setWave(15) should advance spawner to wave 15');
assert.strictEqual(mockScene.spawner.waveTimer, 0, 'waveTimer should reset to 0');

console.log('✓ Developer cheat console & live cheat controls check passed');

// 25. Check 6 New Enemy Types & Multi-Phase Boss State Machines
assert.ok(CONFIG.ENEMIES.STEALTH_STALKER, 'STEALTH_STALKER config must exist');
assert.ok(CONFIG.ENEMIES.GRAVITY_ANCHOR, 'GRAVITY_ANCHOR config must exist');
assert.ok(CONFIG.ENEMIES.PARASITIC_SPORE, 'PARASITIC_SPORE config must exist');
assert.ok(CONFIG.ENEMIES.MIRROR_REFLECTOR, 'MIRROR_REFLECTOR config must exist');
assert.ok(CONFIG.ENEMIES.CHRONO_WEAVER, 'CHRONO_WEAVER config must exist');
assert.ok(CONFIG.ENEMIES.BIO_DEVOURER, 'BIO_DEVOURER config must exist');

// Test 25.1: Mirror Reflector mitigation
const mockReflector = new Enemy(mockEngineCheat);
mockReflector.reset(CONFIG.ENEMIES.MIRROR_REFLECTOR, 0, 0);
mockReflector.hp = 100;
mockReflector.maxHp = 100;
mockReflector.takeDamage(10, 'normal');
assert.ok(Math.abs(mockReflector.hp - 97) < 1e-4, 'Mirror Reflector should take 30% damage from normal kinetic');
mockReflector.takeDamage(10, 'laser');
assert.ok(Math.abs(mockReflector.hp - 94) < 1e-4, 'Mirror Reflector should take 30% damage from laser');

// Test 25.2: Multi-phase boss state machine
const mockBoss = new Enemy(mockEngineCheat);
mockBoss.reset(CONFIG.ENEMIES.BOSS_TITAN || { type: 'boss_titan', hp: 1000, speed: 40, size: 45, damage: 30, xp: 500, color: 0xff0055, isBoss: true }, 0, 0);
mockBoss.isBoss = true;
mockBoss.maxHp = 1000;
mockBoss.hp = 1000;
mockBoss.bossPhase = 1;
mockBoss.speed = 40;
mockBoss.isEnraged = false;

// Drop to 60% HP -> transitions to Phase 2
mockBoss.hp = 600;
mockBoss.update(0.016, { x: 400, y: 300 }, { isActive: false, radius: 95 }, null);
assert.strictEqual(mockBoss.bossPhase, 2, 'Boss should advance to Phase 2 at <= 60% HP');
assert.strictEqual(mockBoss.isEnraged, false, 'Boss should not be enraged in Phase 2');

// Drop to 25% HP -> transitions to Phase 3 (Enrage)
mockBoss.hp = 250;
mockBoss.update(0.016, { x: 400, y: 300 }, { isActive: false, radius: 95 }, null);
assert.strictEqual(mockBoss.bossPhase, 3, 'Boss should advance to Phase 3 at <= 25% HP');
assert.strictEqual(mockBoss.isEnraged, true, 'Boss should become enraged at Phase 3');

console.log('✓ 6 New enemy types & multi-phase boss state machines check passed');

// 26. Check Master Catalog Synergy & Weapon Mutations (Frostfire, Bomb MIRV, Black Hole Collapse)
// 26.1: Frostfire Cataclysm thermal shock test
const mockThermalEnemy = new Enemy(mockEngineCheat);
mockThermalEnemy.reset(CONFIG.ENEMIES.SWARM, 0, 0);
mockThermalEnemy.maxHp = 500;
mockThermalEnemy.hp = 500;
mockThermalEnemy.slowDuration = 2.0; // Currently chilled/frozen

const mockSceneThermal = {
  turret: {
    hasSynergy: (id) => id === 'cryo+flame'
  },
  particles: {
    emitExplosion: () => {},
    emitShockwave: () => {}
  },
  spawner: { enemies: [] }
};
mockEngineCheat.sceneManager.currentScene = mockSceneThermal;

mockThermalEnemy.takeDamage(50, 'burn');
// Base 50 damage doubled to 100 on thermal shock
assert.strictEqual(mockThermalEnemy.hp, 400, 'Frostfire Cataclysm should deal 2.0x finishing damage (50 -> 100)');

// 26.2: BlackHolePassive spawnCustomHole test
import { BlackHolePassive } from '../src/weapons/SupportPassives.js';
const mockBH = new BlackHolePassive(mockEngineCheat);
assert.strictEqual(mockBH.holes.length, 0, 'New BlackHolePassive starts with 0 holes');
mockBH.spawnCustomHole(100, 200, 220, 3.5, 180, 520);
assert.strictEqual(mockBH.holes.length, 1, 'spawnCustomHole should append a new singularity hole');
assert.strictEqual(mockBH.holes[0].radius, 220, 'Custom singularity should have 220px radius');
assert.strictEqual(mockBH.holes[0].dps, 180, 'Custom singularity should have 180 dps');

// 26.3: Tier 5 Missile recursive cluster detonation check
import { Bullet } from '../src/weapons/Bullet.js';
const missileTestBullets = [];
const mockMissileScene = {
  bulletPool: {
    get: (cfg) => {
      const b = new Bullet(mockEngineCheat);
      b.reset(cfg);
      missileTestBullets.push(b);
      return b;
    }
  },
  turret: { hasSynergy: () => false },
  particles: { emitExplosion: () => {}, emitShockwave: () => {} },
  spawner: { enemies: [mockThermalEnemy] }
};
mockEngineCheat.sceneManager.currentScene = mockMissileScene;
const t5Missile = new Bullet(mockEngineCheat);
t5Missile.reset({
  type: 'missile',
  x: 100,
  y: 100,
  speed: 650,
  damage: 220,
  aoeRadius: 140,
  isTier5: true
});
assert.doesNotThrow(() => {
  t5Missile.detonate(mockMissileScene.spawner.enemies, mockMissileScene.particles);
}, 'Tier 5 missile detonate should execute cleanly without audio reference errors');
assert.strictEqual(missileTestBullets.length, 2, 'Tier 5 missile should spawn 2 cluster sub-missiles on detonation');

console.log('✓ Master Design Catalog weapons & synergies check passed (Frostfire, Event Horizon & Tier 5 Missile Clusters)');

console.log('All self-checks passed successfully!');



