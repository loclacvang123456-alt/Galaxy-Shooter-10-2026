// Standard Vector Icon Renderer for Galaxy Shooter Weapons & Passives
// Crisp, recognizable, high-contrast procedural icons scaling cleanly to any size.

export function normalizeIconKey(id) {
  if (!id) return 'unknown';
  const str = String(id).toLowerCase();
  if (str.includes('kinetic')) return 'kinetic';
  if (str.includes('missile')) return 'missile';
  if (str.includes('bomb')) return 'bomb';
  if (str.includes('laser')) return 'laser';
  if (str.includes('flame')) return 'flame';
  if (str.includes('sawblade')) return 'sawblade';
  if (str.includes('cryo')) return 'cryo';
  if (str.includes('swarm')) return 'swarm';
  if (str.includes('tesla')) return 'tesla';
  if (str.includes('railgun') || str.includes('void')) return 'void_railgun';

  if (str.includes('shield')) return 'shield';
  if (str.includes('lightning')) return 'lightning';
  if (str.includes('black_hole')) return 'black_hole';
  if (str.includes('chrono')) return 'chrono';
  if (str.includes('nanite')) return 'nanite';
  if (str.includes('overcharge')) return 'overcharge';
  if (str.includes('repulsor')) return 'repulsor';
  if (str.includes('vampiric')) return 'vampiric';
  if (str.includes('quantum')) return 'quantum';
  if (str.includes('exp')) return 'exp';

  if (str.includes('synergy') || str.includes('fusion') || str.includes('+')) return 'synergy';
  if (str.includes('overdrive')) return 'overdrive';
  if (str.includes('locked')) return 'locked';

  return str;
}

export function renderIcon(g, id, cx, cy, size = 16, overrideColor = null) {
  const key = normalizeIconKey(id);
  const s = size / 16;
  const color = overrideColor != null ? overrideColor : 0x00f0ff;

  switch (key) {
    case 'kinetic': {
      // Kinetic Bullet: 3-round piercing kinetic ammunition
      g.moveTo(cx, cy - 13 * s);
      g.lineTo(cx + 4.5 * s, cy - 4 * s);
      g.lineTo(cx + 4.5 * s, cy + 9 * s);
      g.lineTo(cx - 4.5 * s, cy + 9 * s);
      g.lineTo(cx - 4.5 * s, cy - 4 * s);
      g.lineTo(cx, cy - 13 * s);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 1.5 * s, color });

      g.rect(cx - 5.5 * s, cy + 9 * s, 11 * s, 2.5 * s);
      g.fill({ color });

      // Left flank
      g.moveTo(cx - 8 * s, cy - 5 * s);
      g.lineTo(cx - 6 * s, cy - 1 * s);
      g.lineTo(cx - 6 * s, cy + 8 * s);
      g.lineTo(cx - 10 * s, cy + 8 * s);
      g.lineTo(cx - 10 * s, cy - 1 * s);
      g.lineTo(cx - 8 * s, cy - 5 * s);
      g.fill({ color, alpha: 0.85 });

      // Right flank
      g.moveTo(cx + 8 * s, cy - 5 * s);
      g.lineTo(cx + 10 * s, cy - 1 * s);
      g.lineTo(cx + 10 * s, cy + 8 * s);
      g.lineTo(cx + 6 * s, cy + 8 * s);
      g.lineTo(cx + 6 * s, cy - 1 * s);
      g.lineTo(cx + 8 * s, cy - 5 * s);
      g.fill({ color, alpha: 0.85 });
      break;
    }

    case 'missile': {
      // Aerodynamic guided rocket with fins and fiery exhaust
      g.moveTo(cx, cy - 14 * s);
      g.lineTo(cx + 4 * s, cy - 5 * s);
      g.lineTo(cx - 4 * s, cy - 5 * s);
      g.lineTo(cx, cy - 14 * s);
      g.fill({ color: 0xffffff });

      g.rect(cx - 4 * s, cy - 5 * s, 8 * s, 11 * s);
      g.fill({ color });
      g.stroke({ width: 1.2 * s, color: 0xffffff });

      // Fins
      g.moveTo(cx - 4 * s, cy + 1 * s);
      g.lineTo(cx - 10 * s, cy + 7 * s);
      g.lineTo(cx - 4 * s, cy + 6 * s);
      g.lineTo(cx - 4 * s, cy + 1 * s);
      g.fill({ color });

      g.moveTo(cx + 4 * s, cy + 1 * s);
      g.lineTo(cx + 10 * s, cy + 7 * s);
      g.lineTo(cx + 4 * s, cy + 6 * s);
      g.lineTo(cx + 4 * s, cy + 1 * s);
      g.fill({ color });

      // Nozzle & flame
      g.rect(cx - 2.5 * s, cy + 6 * s, 5 * s, 2.5 * s);
      g.fill({ color: 0x334155 });

      g.moveTo(cx, cy + 14 * s);
      g.lineTo(cx - 3 * s, cy + 8.5 * s);
      g.lineTo(cx + 3 * s, cy + 8.5 * s);
      g.lineTo(cx, cy + 14 * s);
      g.fill({ color: 0xffea00 });
      break;
    }

    case 'bomb': {
      // Spherical artillery bomb with lit fuse & spark
      g.circle(cx, cy + 2 * s, 8.5 * s);
      g.fill({ color });
      g.stroke({ width: 1.5 * s, color: 0xffffff, alpha: 0.9 });

      // Reflection
      g.circle(cx - 2.5 * s, cy - 0.5 * s, 2.2 * s);
      g.fill({ color: 0xffffff, alpha: 0.6 });

      // Cap
      g.rect(cx - 3 * s, cy - 9 * s, 6 * s, 3.5 * s);
      g.fill({ color: 0x475569 });
      g.stroke({ width: 1 * s, color: 0xffffff });

      // Fuse & spark
      g.moveTo(cx, cy - 9 * s);
      g.lineTo(cx + 5 * s, cy - 13 * s);
      g.stroke({ width: 1.8 * s, color: 0xffea00 });

      g.circle(cx + 5 * s, cy - 13 * s, 2.8 * s);
      g.fill({ color: 0xff3300 });
      g.circle(cx + 5 * s, cy - 13 * s, 1.3 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'laser': {
      // Piercing laser beam & optical flare
      g.rect(cx - 14 * s, cy - 2.5 * s, 28 * s, 5 * s);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 1.5 * s, color });

      g.rect(cx - 1.5 * s, cy - 13 * s, 3 * s, 26 * s);
      g.fill({ color, alpha: 0.85 });

      // Center prism
      g.moveTo(cx, cy - 7 * s);
      g.lineTo(cx + 7 * s, cy);
      g.lineTo(cx, cy + 7 * s);
      g.lineTo(cx - 7 * s, cy);
      g.lineTo(cx, cy - 7 * s);
      g.fill({ color });
      g.stroke({ width: 1.5 * s, color: 0xffffff });

      g.circle(cx, cy, 2.5 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'flame': {
      // Roaring 3-tongued fire flame
      g.moveTo(cx, cy - 14 * s);
      g.lineTo(cx + 5 * s, cy - 6 * s);
      g.lineTo(cx + 9 * s, cy - 2 * s);
      g.lineTo(cx + 7 * s, cy + 6 * s);
      g.lineTo(cx + 3 * s, cy + 11 * s);
      g.lineTo(cx - 3 * s, cy + 11 * s);
      g.lineTo(cx - 7 * s, cy + 6 * s);
      g.lineTo(cx - 9 * s, cy - 2 * s);
      g.lineTo(cx - 5 * s, cy - 6 * s);
      g.lineTo(cx, cy - 14 * s);
      g.fill({ color });
      g.stroke({ width: 1.2 * s, color: 0xffffff, alpha: 0.85 });

      // Inner flame
      g.moveTo(cx, cy - 5 * s);
      g.lineTo(cx + 4 * s, cy + 1 * s);
      g.lineTo(cx + 2 * s, cy + 8 * s);
      g.lineTo(cx - 2 * s, cy + 8 * s);
      g.lineTo(cx - 4 * s, cy + 1 * s);
      g.lineTo(cx, cy - 5 * s);
      g.fill({ color: 0xffea00 });

      g.circle(cx, cy + 4 * s, 1.8 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'sawblade': {
      // Rotating 8-toothed industrial buzzsaw blade
      const toothCount = 8;
      const outerR = 12 * s;
      const innerR = 7.5 * s;
      for (let i = 0; i < toothCount; i++) {
        const a1 = (i * 2 * Math.PI) / toothCount;
        const a2 = a1 + (Math.PI / toothCount);
        const a3 = a1 + (2 * Math.PI / toothCount);
        if (i === 0) g.moveTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
        g.lineTo(cx + Math.cos(a2) * innerR, cy + Math.sin(a2) * innerR);
        g.lineTo(cx + Math.cos(a3) * outerR, cy + Math.sin(a3) * outerR);
      }
      g.fill({ color });
      g.stroke({ width: 1.2 * s, color: 0xffffff });

      // Hub hole
      g.circle(cx, cy, 3.8 * s);
      g.fill({ color: 0x0f172a });
      g.stroke({ width: 1.2 * s, color: 0xffffff });

      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        g.circle(cx + Math.cos(ang) * 6.2 * s, cy + Math.sin(ang) * 6.2 * s, 1.1 * s);
        g.fill({ color: 0x0f172a });
      }
      break;
    }

    case 'cryo': {
      // 6-pointed hexagonal crystal snowflake / frost ice shard
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const xEnd = cx + Math.cos(ang) * 12 * s;
        const yEnd = cy + Math.sin(ang) * 12 * s;
        g.moveTo(cx, cy);
        g.lineTo(xEnd, yEnd);
        g.stroke({ width: 2.2 * s, color: 0xffffff });

        const midX = cx + Math.cos(ang) * 7.5 * s;
        const midY = cy + Math.sin(ang) * 7.5 * s;
        const perpAng = ang + Math.PI / 2;
        const p1X = midX + Math.cos(ang) * 2.5 * s + Math.cos(perpAng) * 3 * s;
        const p1Y = midY + Math.sin(ang) * 2.5 * s + Math.sin(perpAng) * 3 * s;
        const p2X = midX + Math.cos(ang) * 2.5 * s - Math.cos(perpAng) * 3 * s;
        const p2Y = midY + Math.sin(ang) * 2.5 * s - Math.sin(perpAng) * 3 * s;
        g.moveTo(midX, midY);
        g.lineTo(p1X, p1Y);
        g.moveTo(midX, midY);
        g.lineTo(p2X, p2Y);
        g.stroke({ width: 1.5 * s, color });
      }

      g.moveTo(cx, cy - 3.5 * s);
      g.lineTo(cx + 3.5 * s, cy);
      g.lineTo(cx, cy + 3.5 * s);
      g.lineTo(cx - 3.5 * s, cy);
      g.lineTo(cx, cy - 3.5 * s);
      g.fill({ color: 0xa5f3fc });
      g.stroke({ width: 1 * s, color: 0xffffff });
      break;
    }

    case 'swarm': {
      // Clustered triple crystal needles / flechettes
      // Center needle
      g.moveTo(cx, cy - 14 * s);
      g.lineTo(cx + 2.2 * s, cy - 4 * s);
      g.lineTo(cx + 1.8 * s, cy + 9 * s);
      g.lineTo(cx - 1.8 * s, cy + 9 * s);
      g.lineTo(cx - 2.2 * s, cy - 4 * s);
      g.lineTo(cx, cy - 14 * s);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 1 * s, color });

      // Left needle
      g.moveTo(cx - 7 * s, cy - 10 * s);
      g.lineTo(cx - 5 * s, cy - 1 * s);
      g.lineTo(cx - 7 * s, cy + 7 * s);
      g.lineTo(cx - 10 * s, cy + 7 * s);
      g.lineTo(cx - 9 * s, cy - 1 * s);
      g.lineTo(cx - 7 * s, cy - 10 * s);
      g.fill({ color });
      g.stroke({ width: 1 * s, color: 0xffffff });

      // Right needle
      g.moveTo(cx + 7 * s, cy - 10 * s);
      g.lineTo(cx + 9 * s, cy - 1 * s);
      g.lineTo(cx + 10 * s, cy + 7 * s);
      g.lineTo(cx + 7 * s, cy + 7 * s);
      g.lineTo(cx + 5 * s, cy - 1 * s);
      g.lineTo(cx + 7 * s, cy - 10 * s);
      g.fill({ color });
      g.stroke({ width: 1 * s, color: 0xffffff });
      break;
    }

    case 'tesla': {
      // Tesla pylon coil with top dome and crackling lightning arcs
      g.circle(cx, cy - 8 * s, 4.5 * s);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 1.5 * s, color });

      g.rect(cx - 2 * s, cy - 3.5 * s, 4 * s, 10 * s);
      g.fill({ color });

      g.rect(cx - 4.5 * s, cy - 2 * s, 9 * s, 2 * s);
      g.fill({ color: 0xffffff });
      g.rect(cx - 4.5 * s, cy + 2 * s, 9 * s, 2 * s);
      g.fill({ color: 0xffffff });

      g.moveTo(cx - 7 * s, cy + 12 * s);
      g.lineTo(cx + 7 * s, cy + 12 * s);
      g.lineTo(cx + 3 * s, cy + 6.5 * s);
      g.lineTo(cx - 3 * s, cy + 6.5 * s);
      g.lineTo(cx - 7 * s, cy + 12 * s);
      g.fill({ color });

      // Electric arcs
      g.moveTo(cx - 4.5 * s, cy - 8 * s);
      g.lineTo(cx - 9 * s, cy - 11 * s);
      g.lineTo(cx - 8 * s, cy - 8 * s);
      g.lineTo(cx - 13 * s, cy - 9 * s);
      g.stroke({ width: 1.5 * s, color: 0xffffff });

      g.moveTo(cx + 4.5 * s, cy - 8 * s);
      g.lineTo(cx + 9 * s, cy - 11 * s);
      g.lineTo(cx + 8 * s, cy - 8 * s);
      g.lineTo(cx + 13 * s, cy - 9 * s);
      g.stroke({ width: 1.5 * s, color: 0xffffff });
      break;
    }

    case 'void_railgun': {
      // Antimatter railgun with parallel rails and black singularity core
      g.rect(cx - 8 * s, cy - 13 * s, 2.5 * s, 26 * s);
      g.fill({ color });
      g.stroke({ width: 1 * s, color: 0xffffff });

      g.rect(cx + 5.5 * s, cy - 13 * s, 2.5 * s, 26 * s);
      g.fill({ color });
      g.stroke({ width: 1 * s, color: 0xffffff });

      g.circle(cx, cy, 5.5 * s);
      g.fill({ color: 0x030308 });
      g.stroke({ width: 2 * s, color: 0xc084fc });

      g.circle(cx, cy, 2 * s);
      g.fill({ color: 0xffffff });

      g.rect(cx - 5.5 * s, cy - 8 * s, 11 * s, 1.5 * s);
      g.fill({ color: 0xffffff, alpha: 0.8 });
      g.rect(cx - 5.5 * s, cy + 6.5 * s, 11 * s, 1.5 * s);
      g.fill({ color: 0xffffff, alpha: 0.8 });
      break;
    }

    case 'shield': {
      // Heraldic energy shield
      g.moveTo(cx - 9 * s, cy - 11 * s);
      g.lineTo(cx + 9 * s, cy - 11 * s);
      g.lineTo(cx + 9 * s, cy - 1 * s);
      g.lineTo(cx, cy + 13 * s);
      g.lineTo(cx - 9 * s, cy - 1 * s);
      g.lineTo(cx - 9 * s, cy - 11 * s);
      g.fill({ color: 0x00e5ff, alpha: 0.85 });
      g.stroke({ width: 2 * s, color: 0xffffff });

      g.moveTo(cx, cy - 8 * s);
      g.lineTo(cx, cy + 8 * s);
      g.moveTo(cx - 6 * s, cy - 3 * s);
      g.lineTo(cx + 6 * s, cy - 3 * s);
      g.stroke({ width: 2 * s, color: 0xffffff });
      break;
    }

    case 'lightning': {
      // Jagged thunderbolt
      g.moveTo(cx + 2 * s, cy - 14 * s);
      g.lineTo(cx - 6 * s, cy - 1 * s);
      g.lineTo(cx - 1 * s, cy - 1 * s);
      g.lineTo(cx - 3 * s, cy + 14 * s);
      g.lineTo(cx + 6 * s, cy + 1 * s);
      g.lineTo(cx + 1 * s, cy + 1 * s);
      g.lineTo(cx + 2 * s, cy - 14 * s);
      g.fill({ color: 0xffea00 });
      g.stroke({ width: 1.5 * s, color: 0xffffff });
      break;
    }

    case 'black_hole': {
      // Cosmic black hole singularity with swirling accretion arms
      g.circle(cx, cy, 5.5 * s);
      g.fill({ color: 0x030308 });
      g.stroke({ width: 1.8 * s, color: 0xffffff });

      for (let i = 0; i < 3; i++) {
        const baseAng = (i * 2 * Math.PI) / 3;
        g.moveTo(cx + Math.cos(baseAng) * 6 * s, cy + Math.sin(baseAng) * 6 * s);
        g.lineTo(cx + Math.cos(baseAng + 0.9) * 9 * s, cy + Math.sin(baseAng + 0.9) * 9 * s);
        g.lineTo(cx + Math.cos(baseAng + 1.8) * 12.5 * s, cy + Math.sin(baseAng + 1.8) * 12.5 * s);
        g.stroke({ width: 1.8 * s, color: 0xd946ef });
      }
      break;
    }

    case 'chrono': {
      // Stopwatch dial with crown and hands
      g.circle(cx, cy + 1 * s, 10 * s);
      g.fill({ color: 0x0f172a });
      g.stroke({ width: 2 * s, color });

      g.rect(cx - 2.5 * s, cy - 12.5 * s, 5 * s, 3.5 * s);
      g.fill({ color: 0xffffff });

      g.moveTo(cx, cy - 7.5 * s); g.lineTo(cx, cy - 5.5 * s);
      g.moveTo(cx, cy + 9.5 * s); g.lineTo(cx, cy + 7.5 * s);
      g.moveTo(cx - 8.5 * s, cy + 1 * s); g.lineTo(cx - 6.5 * s, cy + 1 * s);
      g.moveTo(cx + 8.5 * s, cy + 1 * s); g.lineTo(cx + 6.5 * s, cy + 1 * s);
      g.stroke({ width: 1.2 * s, color: 0xffffff });

      g.moveTo(cx, cy + 1 * s);
      g.lineTo(cx, cy - 6 * s);
      g.stroke({ width: 2 * s, color: 0xffffff });

      g.moveTo(cx, cy + 1 * s);
      g.lineTo(cx + 4.5 * s, cy - 1.5 * s);
      g.stroke({ width: 2 * s, color });

      g.circle(cx, cy + 1 * s, 1.8 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'nanite': {
      // Cyber nanobot spider-drone
      g.circle(cx, cy, 4.8 * s);
      g.fill({ color });
      g.stroke({ width: 1.5 * s, color: 0xffffff });

      g.circle(cx, cy, 1.8 * s);
      g.fill({ color: 0xffffff });

      // 4 articulated legs
      g.moveTo(cx - 3 * s, cy - 2 * s);
      g.lineTo(cx - 7 * s, cy - 6 * s);
      g.lineTo(cx - 12 * s, cy - 5 * s);

      g.moveTo(cx + 3 * s, cy - 2 * s);
      g.lineTo(cx + 7 * s, cy - 6 * s);
      g.lineTo(cx + 12 * s, cy - 5 * s);

      g.moveTo(cx - 3 * s, cy + 2 * s);
      g.lineTo(cx - 7 * s, cy + 6 * s);
      g.lineTo(cx - 12 * s, cy + 8 * s);

      g.moveTo(cx + 3 * s, cy + 2 * s);
      g.lineTo(cx + 7 * s, cy + 6 * s);
      g.lineTo(cx + 12 * s, cy + 8 * s);
      g.stroke({ width: 1.8 * s, color: 0xffffff });
      break;
    }

    case 'overcharge': {
      // Sniper crosshair with critical core burst
      g.circle(cx, cy, 9.5 * s);
      g.stroke({ width: 1.8 * s, color });

      g.moveTo(cx, cy - 13 * s); g.lineTo(cx, cy - 6.5 * s);
      g.moveTo(cx, cy + 13 * s); g.lineTo(cx, cy + 6.5 * s);
      g.moveTo(cx - 13 * s, cy); g.lineTo(cx - 6.5 * s, cy);
      g.moveTo(cx + 13 * s, cy); g.lineTo(cx + 6.5 * s, cy);
      g.stroke({ width: 2 * s, color: 0xffffff });

      g.moveTo(cx, cy - 4 * s);
      g.lineTo(cx + 4 * s, cy);
      g.lineTo(cx, cy + 4 * s);
      g.lineTo(cx - 4 * s, cy);
      g.lineTo(cx, cy - 4 * s);
      g.fill({ color: 0xffea00 });
      g.stroke({ width: 1 * s, color: 0xffffff });
      break;
    }

    case 'repulsor': {
      // Radial shockwave repulsion burst
      g.circle(cx, cy, 3 * s);
      g.fill({ color: 0xffffff });

      g.moveTo(cx - 5 * s, cy - 5 * s);
      g.lineTo(cx - 7 * s, cy);
      g.lineTo(cx - 5 * s, cy + 5 * s);
      g.moveTo(cx + 5 * s, cy - 5 * s);
      g.lineTo(cx + 7 * s, cy);
      g.lineTo(cx + 5 * s, cy + 5 * s);
      g.stroke({ width: 1.8 * s, color });

      g.moveTo(cx - 9 * s, cy - 8 * s);
      g.lineTo(cx - 12 * s, cy);
      g.lineTo(cx - 9 * s, cy + 8 * s);
      g.moveTo(cx + 9 * s, cy - 8 * s);
      g.lineTo(cx + 12 * s, cy);
      g.lineTo(cx + 9 * s, cy + 8 * s);
      g.stroke({ width: 2 * s, color: 0xffffff });
      break;
    }

    case 'vampiric': {
      // Vampiric blood soul teardrop
      g.moveTo(cx, cy - 13 * s);
      g.lineTo(cx + 6.5 * s, cy + 2 * s);
      g.lineTo(cx + 5.5 * s, cy + 8 * s);
      g.lineTo(cx, cy + 11 * s);
      g.lineTo(cx - 5.5 * s, cy + 8 * s);
      g.lineTo(cx - 6.5 * s, cy + 2 * s);
      g.lineTo(cx, cy - 13 * s);
      g.fill({ color: 0xef4444 });
      g.stroke({ width: 1.8 * s, color: 0xffffff });

      g.circle(cx - 2 * s, cy + 3 * s, 2 * s);
      g.fill({ color: 0xffffff, alpha: 0.75 });
      break;
    }

    case 'quantum': {
      // Emerald quantum atom / nucleus with orbital rings
      g.circle(cx, cy, 9 * s);
      g.stroke({ width: 1.5 * s, color: 0x10b981, alpha: 0.65 });

      g.ellipse(cx, cy, 11 * s, 4.5 * s);
      g.stroke({ width: 1.5 * s, color: 0x34d399, alpha: 0.85 });

      g.circle(cx, cy, 4 * s);
      g.fill({ color: 0x10b981 });
      g.circle(cx, cy, 2 * s);
      g.fill({ color: 0xffffff });

      g.circle(cx + 8 * s, cy, 1.8 * s);
      g.fill({ color: 0xffffff });
      g.circle(cx - 8 * s, cy, 1.8 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'exp': {
      // Brilliant multifaceted EXP gem diamond
      const pts = [
        { x: cx, y: cy - 11 * s },
        { x: cx + 9 * s, y: cy - 2 * s },
        { x: cx, y: cy + 12 * s },
        { x: cx - 9 * s, y: cy - 2 * s }
      ];
      g.poly(pts);
      g.fill({ color: 0x10b981 });
      g.stroke({ width: 1.8 * s, color: 0x34d399 });

      const fPts = [
        { x: cx, y: cy - 11 * s },
        { x: cx + 9 * s, y: cy - 2 * s },
        { x: cx, y: cy + 1 * s }
      ];
      g.poly(fPts);
      g.fill({ color: 0x6ee7b7, alpha: 0.85 });

      g.circle(cx, cy - 2 * s, 2.5 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'synergy': {
      // Dual golden fusion stars
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        const x1 = cx + Math.cos(a1) * (13 * s);
        const y1 = cy + Math.sin(a1) * (13 * s);
        const x2 = cx + Math.cos(a2) * (5.5 * s);
        const y2 = cy + Math.sin(a2) * (5.5 * s);
        if (i === 0) g.moveTo(x1, y1);
        else g.lineTo(x1, y1);
        g.lineTo(x2, y2);
      }
      g.lineTo(cx, cy - 13 * s);
      g.fill({ color: 0xffd700 });
      g.stroke({ width: 1.5 * s, color: 0xffffff });

      g.circle(cx, cy, 3 * s);
      g.fill({ color: 0xffffff });
      break;
    }

    case 'overdrive': {
      // Double speed hyper-chevrons
      g.moveTo(cx, cy - 11 * s);
      g.lineTo(cx + 9 * s, cy - 2 * s);
      g.lineTo(cx + 5 * s, cy - 2 * s);
      g.lineTo(cx, cy - 7 * s);
      g.lineTo(cx - 5 * s, cy - 2 * s);
      g.lineTo(cx - 9 * s, cy - 2 * s);
      g.lineTo(cx, cy - 11 * s);
      g.fill({ color: 0x00f0ff });

      g.moveTo(cx, cy - 2 * s);
      g.lineTo(cx + 9 * s, cy + 7 * s);
      g.lineTo(cx + 5 * s, cy + 7 * s);
      g.lineTo(cx, cy + 2 * s);
      g.lineTo(cx - 5 * s, cy + 7 * s);
      g.lineTo(cx - 9 * s, cy + 7 * s);
      g.lineTo(cx, cy - 2 * s);
      g.fill({ color: 0xffea00 });
      break;
    }

    case 'locked': {
      // Dim padlock icon
      g.roundRect(cx - 5 * s, cy - 2 * s, 10 * s, 9 * s, 2 * s);
      g.fill({ color: 0x1e293b });
      g.stroke({ width: 1.2 * s, color: 0x475569 });

      // Shackle
      g.moveTo(cx - 3.5 * s, cy - 2 * s);
      g.lineTo(cx - 3.5 * s, cy - 6 * s);
      g.lineTo(cx + 3.5 * s, cy - 6 * s);
      g.lineTo(cx + 3.5 * s, cy - 2 * s);
      g.stroke({ width: 1.5 * s, color: 0x475569 });
      break;
    }

    default: {
      // Fallback clean hexagon badge
      g.moveTo(cx, cy - 10 * s);
      g.lineTo(cx + 9 * s, cy - 5 * s);
      g.lineTo(cx + 9 * s, cy + 5 * s);
      g.lineTo(cx, cy + 10 * s);
      g.lineTo(cx - 9 * s, cy + 5 * s);
      g.lineTo(cx - 9 * s, cy - 5 * s);
      g.lineTo(cx, cy - 10 * s);
      g.fill({ color });
      g.stroke({ width: 1.5 * s, color: 0xffffff });
      break;
    }
  }
}
