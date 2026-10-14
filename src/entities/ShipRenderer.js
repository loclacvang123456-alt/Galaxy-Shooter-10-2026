// Procedural Spaceship Renderer for Galaxy Shooter
// Transforms all basic blocks into sleek, high-tech starships, interceptors, and colossal boss dreadnoughts.
// Orientation: +X axis is forward (ship nose), -X axis is rear (engines).

export class ShipRenderer {
  static draw(g, enemy) {
    const type = enemy.type;
    const size = enemy.size;
    const isHit = enemy.hitFlash > 0;
    const color = isHit ? 0xffffff : enemy.color;
    const glowAlpha = isHit ? 0.95 : 0.65;
    const pulse = enemy.pulseAnim || 0;

    switch (type) {
      // 1. SWARM: Interceptor Scout Drone (Sleek swept-forward forward-strike fighter)
      case 'swarm': {
        // Cockpit fuselage
        g.poly([
          { x: size * 1.3, y: 0 },
          { x: size * 0.4, y: -size * 0.35 },
          { x: -size * 0.7, y: -size * 0.3 },
          { x: -size * 0.8, y: 0 },
          { x: -size * 0.7, y: size * 0.3 },
          { x: size * 0.4, y: size * 0.35 }
        ]);
        g.fill({ color: 0x111827 });
        g.stroke({ width: 1.5, color: isHit ? 0xffffff : color });

        // Forward-swept assault wings
        g.poly([
          { x: size * 0.3, y: -size * 0.35 },
          { x: size * 0.8, y: -size * 1.1 },
          { x: -size * 0.3, y: -size * 0.9 },
          { x: -size * 0.6, y: -size * 0.35 }
        ]);
        g.fill({ color });
        g.stroke({ width: 1.2, color: 0xffffff, alpha: glowAlpha });

        g.poly([
          { x: size * 0.3, y: size * 0.35 },
          { x: size * 0.8, y: size * 1.1 },
          { x: -size * 0.3, y: size * 0.9 },
          { x: -size * 0.6, y: size * 0.35 }
        ]);
        g.fill({ color });
        g.stroke({ width: 1.2, color: 0xffffff, alpha: glowAlpha });

        // Glowing cockpit canopy
        g.circle(size * 0.35, 0, size * 0.22);
        g.fill({ color: isHit ? 0xffffff : 0x00f0ff });

        // Twin ion thruster exhausts
        const thrustPulse = 0.8 + Math.sin(pulse * 6) * 0.2;
        g.circle(-size * 0.75, -size * 0.2, size * 0.18 * thrustPulse);
        g.fill({ color: 0x00f0ff });
        g.circle(-size * 0.75, size * 0.2, size * 0.18 * thrustPulse);
        g.fill({ color: 0x00f0ff });
        break;
      }

      // 2. SPEEDER: Phantom Razor Delta (High-speed needle-nosed delta interceptor)
      case 'speeder': {
        // Needle-nosed aerodynamic delta hull
        g.poly([
          { x: size * 1.5, y: 0 },
          { x: -size * 0.6, y: -size * 0.9 },
          { x: -size * 0.3, y: -size * 0.4 },
          { x: -size * 0.8, y: 0 },
          { x: -size * 0.3, y: size * 0.4 },
          { x: -size * 0.6, y: size * 0.9 }
        ]);
        g.fill({ color });
        g.stroke({ width: 2, color: 0xffffff, alpha: glowAlpha });

        // Wing leading edge highlight
        g.moveTo(size * 1.5, 0);
        g.lineTo(-size * 0.6, -size * 0.9);
        g.moveTo(size * 1.5, 0);
        g.lineTo(-size * 0.6, size * 0.9);
        g.stroke({ width: 1.5, color: 0xffea00 });

        // Cockpit canopy
        g.poly([
          { x: size * 0.7, y: 0 },
          { x: size * 0.1, y: -size * 0.18 },
          { x: -size * 0.2, y: 0 },
          { x: size * 0.1, y: size * 0.18 }
        ]);
        g.fill({ color: 0xffffff });

        // Blazing center afterburner jet
        const jetLen = size * (0.6 + Math.sin(pulse * 8) * 0.25);
        g.moveTo(-size * 0.8, 0);
        g.lineTo(-size * 0.8 - jetLen, -size * 0.18);
        g.lineTo(-size * 0.8 - jetLen * 1.4, 0);
        g.lineTo(-size * 0.8 - jetLen, size * 0.18);
        g.closePath();
        g.fill({ color: 0xffea00, alpha: 0.85 });
        break;
      }

      // 3. TANK: Goliath Heavy Battleship (Armored dreadnought cruiser)
      case 'tank': {
        // Heavy armored battlecruiser hull
        g.poly([
          { x: size * 1.2, y: 0 },
          { x: size * 0.7, y: -size * 0.6 },
          { x: -size * 0.7, y: -size * 0.9 },
          { x: -size * 1.0, y: -size * 0.5 },
          { x: -size * 0.8, y: 0 },
          { x: -size * 1.0, y: size * 0.5 },
          { x: -size * 0.7, y: size * 0.9 },
          { x: size * 0.7, y: size * 0.6 }
        ]);
        g.fill({ color: 0x1f1530 });
        g.stroke({ width: 3, color: isHit ? 0xffffff : color });

        // Heavy side armor plates
        g.roundRect(-size * 0.6, -size * 0.85, size * 1.1, size * 0.35, 3);
        g.fill({ color });
        g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });

        g.roundRect(-size * 0.6, size * 0.5, size * 1.1, size * 0.35, 3);
        g.fill({ color });
        g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });

        // Armored command bridge & core
        g.circle(0, 0, size * 0.38);
        g.fill({ color: 0xff0088 });
        g.stroke({ width: 1.8, color: 0xffffff });
        g.circle(0, 0, size * 0.18);
        g.fill({ color: 0xffffff });

        // Forward heavy cannon barrels
        g.rect(size * 0.8, -size * 0.3, size * 0.45, size * 0.16);
        g.fill({ color: 0x475569 });
        g.rect(size * 0.8, size * 0.14, size * 0.45, size * 0.16);
        g.fill({ color: 0x475569 });

        // Triple heavy propulsion engines
        [-0.5, 0, 0.5].forEach(offY => {
          g.circle(-size * 0.9, size * offY, size * 0.16);
          g.fill({ color: 0xaa44ff });
        });
        break;
      }

      // 4. MINION: Assault Escort Fighter (Agile twin-fuselage starfighter)
      case 'minion': {
        g.poly([
          { x: size * 1.2, y: 0 },
          { x: 0, y: -size * 0.75 },
          { x: -size * 0.8, y: -size * 0.4 },
          { x: -size * 0.4, y: 0 },
          { x: -size * 0.8, y: size * 0.4 },
          { x: 0, y: size * 0.75 }
        ]);
        g.fill({ color });
        g.stroke({ width: 1.8, color: 0xffffff, alpha: glowAlpha });

        // Core optic
        g.circle(size * 0.2, 0, size * 0.25);
        g.fill({ color: 0xffffff });
        break;
      }

      // 5. SPLITTERS (Modular Hive Frigates)
      case 'splitter_large':
      case 'splitter_med':
      case 'splitter_small': {
        const isLg = type === 'splitter_large';
        // Modular segmented carrier hull
        g.poly([
          { x: size * 1.1, y: 0 },
          { x: size * 0.5, y: -size * 0.85 },
          { x: -size * 0.6, y: -size * 0.75 },
          { x: -size * 0.9, y: 0 },
          { x: -size * 0.6, y: size * 0.75 },
          { x: size * 0.5, y: size * 0.85 }
        ]);
        g.fill({ color });
        g.stroke({ width: isLg ? 2.5 : 1.5, color: 0xffffff, alpha: glowAlpha });

        // Bio-mechanical splitting seams
        g.moveTo(-size * 0.7, 0);
        g.lineTo(size * 0.8, 0);
        g.stroke({ width: 1.5, color: 0xfacc15 });

        g.circle(0, 0, size * 0.3);
        g.fill({ color: 0xfacc15 });
        g.circle(0, 0, size * 0.15);
        g.fill({ color: 0xffffff });
        break;
      }

      // 6. TWIN: Magnetic Twin Corvette (Catamaran dual-hull corvette)
      case 'twin': {
        g.poly([
          { x: size * 1.3, y: 0 },
          { x: size * 0.3, y: -size * 0.85 },
          { x: -size * 0.8, y: -size * 0.65 },
          { x: -size * 0.4, y: 0 },
          { x: -size * 0.8, y: size * 0.65 },
          { x: size * 0.3, y: size * 0.85 }
        ]);
        g.fill({ color });
        g.stroke({ width: 2, color: 0xffffff, alpha: glowAlpha });

        // Magnetic flux emitter antenna
        g.circle(0, 0, size * 0.35);
        g.fill({ color: 0x06b6d4 });
        g.stroke({ width: 1.5, color: 0xffffff });
        g.circle(0, 0, size * 0.15);
        g.fill({ color: 0xffffff });
        break;
      }

      // 7. VANGUARD: Aegis Shield Destroyer (Reinforced prow + energy shield arc)
      case 'vanguard': {
        g.poly([
          { x: size * 1.2, y: 0 },
          { x: size * 0.2, y: -size * 0.9 },
          { x: -size * 0.9, y: -size * 0.6 },
          { x: -size * 0.7, y: 0 },
          { x: -size * 0.9, y: size * 0.6 },
          { x: size * 0.2, y: size * 0.9 }
        ]);
        g.fill({ color: 0x1e293b });
        g.stroke({ width: 2.2, color: isHit ? 0xffffff : color });

        // Front heavy reinforced prow plate
        g.poly([
          { x: size * 1.2, y: 0 },
          { x: size * 0.4, y: -size * 0.6 },
          { x: size * 0.4, y: size * 0.6 }
        ]);
        g.fill({ color });
        g.stroke({ width: 1.5, color: 0xffffff });

        // Frontal energy shield curve
        g.arc(0, 0, size * 1.3, -Math.PI * 0.38, Math.PI * 0.38);
        g.stroke({ width: 4.5, color: 0x38bdf8, alpha: 0.6 });
        g.arc(0, 0, size * 1.3, -Math.PI * 0.38, Math.PI * 0.38);
        g.stroke({ width: 2, color: 0xffffff, alpha: 0.95 });
        break;
      }

      // 8. HEALER: Nanite Repair Cruiser (Emerald solar-sail medical cruiser)
      case 'healer': {
        // Star cruiser hull
        g.poly([
          { x: size * 1.2, y: 0 },
          { x: 0, y: -size * 0.5 },
          { x: -size * 0.8, y: -size * 0.3 },
          { x: -size * 0.8, y: size * 0.3 },
          { x: 0, y: size * 0.5 }
        ]);
        g.fill({ color: 0x064e3b });
        g.stroke({ width: 1.8, color: 0x10b981 });

        // Emerald medical cross wings
        g.rect(-size * 0.2, -size * 0.9, size * 0.4, size * 1.8);
        g.fill({ color: 0x10b981 });
        g.rect(-size * 0.6, -size * 0.25, size * 1.2, size * 0.5);
        g.fill({ color: 0x10b981 });
        g.stroke({ width: 1.5, color: 0xffffff });

        g.circle(0, 0, size * 0.25);
        g.fill({ color: 0xffffff });
        break;
      }

      // 9. STEALTH STALKER (Sleek delta-wing stealth jet)
      case 'stealth_stalker': {
        g.poly([
          { x: size * 1.4, y: 0 },
          { x: -size * 0.9, y: -size * 1.1 },
          { x: -size * 0.4, y: -size * 0.3 },
          { x: -size * 0.8, y: 0 },
          { x: -size * 0.4, y: size * 0.3 },
          { x: -size * 0.9, y: size * 1.1 }
        ]);
        g.fill({ color: 0x0f172a });
        g.stroke({ width: 1.5, color: isHit ? 0xffffff : 0x00f0ff, alpha: glowAlpha });
        g.circle(size * 0.4, 0, size * 0.2);
        g.fill({ color: 0x00f0ff });
        break;
      }

      // 10. GRAVITY ANCHOR (Cosmic diamond anchor with spinning grav-rings)
      case 'gravity_anchor': {
        g.poly([
          { x: 0, y: -size * 1.2 },
          { x: size * 1.2, y: 0 },
          { x: 0, y: size * 1.2 },
          { x: -size * 1.2, y: 0 }
        ]);
        g.fill({ color: 0x2e1065 });
        g.stroke({ width: 2.2, color: isHit ? 0xffffff : 0xa855f7 });
        g.circle(0, 0, size * 0.55 + Math.sin(pulse * 4) * 3);
        g.stroke({ width: 2, color: 0xc084fc, alpha: 0.8 });
        g.circle(0, 0, size * 0.3);
        g.fill({ color: 0xd946ef });
        break;
      }

      // 11. PARASITIC SPORE (Alien bio-pod with clawed tendrils)
      case 'parasite_spore': {
        g.circle(0, 0, size * 0.8);
        g.fill({ color: 0x701a75 });
        g.stroke({ width: 2, color: isHit ? 0xffffff : 0xd946ef });
        for (let t = 0; t < 4; t++) {
          const a = pulse * 3 + (t * Math.PI * 2) / 4;
          g.moveTo(Math.cos(a) * size * 0.7, Math.sin(a) * size * 0.7);
          g.lineTo(Math.cos(a + 0.3) * size * 1.35, Math.sin(a + 0.3) * size * 1.35);
          g.stroke({ width: 2, color: 0xf43f5e });
        }
        g.circle(0, 0, size * 0.35);
        g.fill({ color: 0xff0055 });
        break;
      }

      // 12. MIRROR REFLECTOR (Heavy corvette with curved polished frontal mirror)
      case 'mirror_reflector': {
        g.poly([
          { x: size * 0.8, y: -size * 0.7 },
          { x: -size * 0.8, y: -size * 0.5 },
          { x: -size * 0.6, y: 0 },
          { x: -size * 0.8, y: size * 0.5 },
          { x: size * 0.8, y: size * 0.7 }
        ]);
        g.fill({ color: 0x0f172a });
        g.stroke({ width: 1.8, color: 0x38bdf8 });
        g.roundRect(size * 0.7, -size * 0.85, size * 0.35, size * 1.7, 3);
        g.fill({ color: 0x38bdf8 });
        g.stroke({ width: 2, color: 0xffffff });
        break;
      }

      // 13. CHRONO WEAVER (Hourglass-winged temporal disruptor)
      case 'chrono_weaver': {
        g.poly([
          { x: size * 1.1, y: 0 },
          { x: size * 0.2, y: -size * 1.0 },
          { x: -size * 0.7, y: 0 },
          { x: size * 0.2, y: size * 1.0 }
        ]);
        g.fill({ color: 0x134e4a });
        g.stroke({ width: 2, color: isHit ? 0xffffff : 0x14b8a6 });
        g.circle(0, 0, size * 0.35);
        g.fill({ color: 0x2dd4bf });
        g.circle(0, 0, size * 0.15);
        g.fill({ color: 0xffffff });
        break;
      }

      // 14. BIO DEVOURER (Predatory red dread-beetle with gaping mandibles)
      case 'bio_devourer': {
        g.poly([
          { x: size * 1.2, y: -size * 0.4 },
          { x: size * 0.5, y: -size * 0.8 },
          { x: -size * 0.9, y: -size * 0.6 },
          { x: -size * 0.7, y: 0 },
          { x: -size * 0.9, y: size * 0.6 },
          { x: size * 0.5, y: size * 0.8 },
          { x: size * 1.2, y: size * 0.4 },
          { x: size * 0.6, y: 0 }
        ]);
        g.fill({ color: 0x450a0a });
        g.stroke({ width: 2.2, color: isHit ? 0xffffff : 0xef4444 });
        g.circle(size * 0.3, 0, size * 0.3);
        g.fill({ color: 0xff0033 });
        break;
      }

      // =====================================================================
      // THE 11 EPIC BOSS FLAGSHIPS
      // =====================================================================

      // BOSS 1: TITAN DREADNOUGHT (Colossal Command Dreadnought)
      case 'mega_boss':
      case 'boss_titan': {
        this.drawTitanDreadnought(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 2: SHADOW PHANTOM INFILTRATOR (Quantum Teleporter Starship)
      case 'boss_phantom': {
        this.drawPhantomInfiltrator(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 3: ABSOLUTE ZERO STASIS CRUISER (Cryo EMP Weapon Freeze)
      case 'boss_cryo': {
        this.drawCryoStasisCruiser(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 4: COSMIC EVENT HORIZON CARRIER (Singularity Vortex Carrier)
      case 'boss_singularity': {
        this.drawSingularityCarrier(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 5: SOLAR PROMINENCE DREADNOUGHT (Doomsday Sweeping Beam)
      case 'boss_solar': {
        this.drawSolarProminence(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 6: AEGIS PRISM BASTION (Reflective Mirror Barrier)
      case 'boss_aegis': {
        this.drawAegisBastion(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 7: AEON CHRONO MANIPULATOR (Spacetime Distortion)
      case 'boss_chrono': {
        this.drawChronoManipulator(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 8: HYDRA BROODMOTHER CARRIER (Swarm Infestation Bio-Ship)
      case 'boss_broodmother': {
        this.drawBroodmother(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 9: CRIMSON BLOOD REAPER (Soul Siphon Vampire Dreadnought)
      case 'boss_vampire': {
        this.drawBloodReaper(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 10: HYPERION BATTERING JUGGERNAUT (Hyper-Speed Ramming Charge)
      case 'boss_juggernaut': {
        this.drawHyperionJuggernaut(g, size, color, isHit, glowAlpha, pulse);
        break;
      }

      // BOSS 11: MIRAGE HOLOGRAPHIC OVERLORD (Decoy Split Prismatic Ship)
      case 'boss_mirage': {
        this.drawMirageOverlord(g, size, color, isHit, glowAlpha, pulse, enemy.isClone);
        break;
      }

      default: {
        // Fallback Starfighter
        g.poly([
          { x: size, y: 0 },
          { x: -size * 0.8, y: -size * 0.7 },
          { x: -size * 0.4, y: 0 },
          { x: -size * 0.8, y: size * 0.7 }
        ]);
        g.fill({ color });
        g.stroke({ width: 1.5, color: 0xffffff });
        break;
      }
    }
  }

  // --- BOSS DRAW HELPERS ---

  static drawTitanDreadnought(g, size, color, isHit, glowAlpha, pulse) {
    // Heavy command warship hull with reinforced prow and multi-tier armor
    g.poly([
      { x: size * 1.3, y: 0 },
      { x: size * 0.8, y: -size * 0.55 },
      { x: size * 0.2, y: -size * 0.95 },
      { x: -size * 0.9, y: -size * 0.9 },
      { x: -size * 1.2, y: -size * 0.45 },
      { x: -size * 1.0, y: 0 },
      { x: -size * 1.2, y: size * 0.45 },
      { x: -size * 0.9, y: size * 0.9 },
      { x: size * 0.2, y: size * 0.95 },
      { x: size * 0.8, y: size * 0.55 }
    ]);
    g.fill({ color: 0x1f0b24 });
    g.stroke({ width: 5, color: isHit ? 0xffffff : 0xff0055, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xffffff, alpha: 0.95 });

    // Inner Armor Wings
    g.poly([
      { x: size * 0.7, y: 0 },
      { x: size * 0.1, y: -size * 0.7 },
      { x: -size * 0.6, y: -size * 0.65 },
      { x: -size * 0.5, y: 0 },
      { x: -size * 0.6, y: size * 0.65 },
      { x: size * 0.1, y: size * 0.7 }
    ]);
    g.fill({ color });
    g.stroke({ width: 2, color: 0xffd700 });

    // Triple Heavy Prow Cannons
    g.rect(size * 0.9, -size * 0.35, size * 0.45, size * 0.15);
    g.rect(size * 1.1, -size * 0.08, size * 0.5, size * 0.16);
    g.rect(size * 0.9, size * 0.2, size * 0.45, size * 0.15);
    g.fill({ color: 0x475569 });

    // Super Core with radiant aura
    const corePulse = 0.85 + Math.sin(pulse * 3) * 0.15;
    g.circle(0, 0, size * 0.4 * corePulse);
    g.fill({ color: 0xffaa00, alpha: 0.4 });
    g.circle(0, 0, size * 0.28 * corePulse);
    g.fill({ color: 0xffdd00 });
    g.circle(0, 0, size * 0.14);
    g.fill({ color: 0xffffff });
  }

  static drawPhantomInfiltrator(g, size, color, isHit, glowAlpha, pulse) {
    // Sleek alien stealth bat-ship with shimmering phase fins
    g.poly([
      { x: size * 1.5, y: 0 },
      { x: size * 0.2, y: -size * 0.3 },
      { x: -size * 0.3, y: -size * 1.2 },
      { x: -size * 0.8, y: -size * 1.0 },
      { x: -size * 0.5, y: -size * 0.4 },
      { x: -size * 1.2, y: 0 },
      { x: -size * 0.5, y: size * 0.4 },
      { x: -size * 0.8, y: size * 1.0 },
      { x: -size * 0.3, y: size * 1.2 },
      { x: size * 0.2, y: size * 0.3 }
    ]);
    g.fill({ color: 0x0f051d });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0xa855f7, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });

    // Phase crystal core
    const pPulse = 0.8 + Math.sin(pulse * 5) * 0.2;
    g.circle(size * 0.2, 0, size * 0.32 * pPulse);
    g.fill({ color: 0xa855f7 });
    g.circle(size * 0.2, 0, size * 0.15);
    g.fill({ color: 0xffffff });

    // Wingtip void warp emitters
    g.circle(-size * 0.3, -size * 1.15, size * 0.12);
    g.fill({ color: 0x00f0ff });
    g.circle(-size * 0.3, size * 1.15, size * 0.12);
    g.fill({ color: 0x00f0ff });
  }

  static drawCryoStasisCruiser(g, size, color, isHit, glowAlpha, pulse) {
    // Crystalline frost battleship with angular ice spike wings
    g.poly([
      { x: size * 1.4, y: 0 },
      { x: size * 0.6, y: -size * 0.5 },
      { x: size * 0.2, y: -size * 1.1 },
      { x: -size * 0.6, y: -size * 0.9 },
      { x: -size * 0.4, y: -size * 0.3 },
      { x: -size * 1.1, y: 0 },
      { x: -size * 0.4, y: size * 0.3 },
      { x: -size * 0.6, y: size * 0.9 },
      { x: size * 0.2, y: size * 1.1 },
      { x: size * 0.6, y: size * 0.5 }
    ]);
    g.fill({ color: 0x082f49 });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0x38bdf8, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xa5f3fc });

    // 6 glacial spear spikes radiating outward
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + pulse * 0.5;
      g.moveTo(Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3);
      g.lineTo(Math.cos(a) * size * 0.85, Math.sin(a) * size * 0.85);
      g.stroke({ width: 2.5, color: 0xa5f3fc });
    }

    // Stasis Freeze EMP Ring
    g.circle(0, 0, size * 0.35);
    g.fill({ color: 0x0284c7 });
    g.stroke({ width: 2.5, color: 0xffffff });
    g.circle(0, 0, size * 0.16);
    g.fill({ color: 0xffffff });
  }

  static drawSingularityCarrier(g, size, color, isHit, glowAlpha, pulse) {
    // Ring-shaped cosmic vessel with swirling black hole center
    g.circle(0, 0, size * 1.15);
    g.stroke({ width: 6, color: isHit ? 0xffffff : 0x7c3aed, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xc084fc });

    // 4 magnetic stabilization pylons
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + pulse * 0.4;
      g.moveTo(Math.cos(a) * size * 0.45, Math.sin(a) * size * 0.45);
      g.lineTo(Math.cos(a) * size * 1.25, Math.sin(a) * size * 1.25);
      g.stroke({ width: 4.5, color: 0x9333ea });
    }

    // Pitch black singularity event horizon core
    g.circle(0, 0, size * 0.55);
    g.fill({ color: 0x030308 });
    g.stroke({ width: 3, color: 0xd946ef });

    // Accretion disk swirl
    g.arc(0, 0, size * 0.38, pulse * 2, pulse * 2 + Math.PI * 1.2);
    g.stroke({ width: 3, color: 0xffffff, alpha: 0.9 });
  }

  static drawSolarProminence(g, size, color, isHit, glowAlpha, pulse) {
    // Catamaran dual-prow warship with solar laser crystal
    g.poly([
      { x: size * 1.4, y: -size * 0.4 },
      { x: size * 0.5, y: -size * 0.7 },
      { x: -size * 0.9, y: -size * 0.8 },
      { x: -size * 0.7, y: -size * 0.2 },
      { x: -size * 0.7, y: size * 0.2 },
      { x: -size * 0.9, y: size * 0.8 },
      { x: size * 0.5, y: size * 0.7 },
      { x: size * 1.4, y: size * 0.4 },
      { x: size * 0.8, y: size * 0.2 },
      { x: size * 0.8, y: -size * 0.2 }
    ]);
    g.fill({ color: 0x450a0a });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0xff4500, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xfbbf24 });

    // Central Solar Prism Emitter
    g.poly([
      { x: size * 0.8, y: 0 },
      { x: size * 0.1, y: -size * 0.3 },
      { x: -size * 0.4, y: 0 },
      { x: size * 0.1, y: size * 0.3 }
    ]);
    g.fill({ color: 0xffea00 });
    g.stroke({ width: 2, color: 0xffffff });

    g.circle(size * 0.2, 0, size * 0.18);
    g.fill({ color: 0xffffff });
  }

  static drawAegisBastion(g, size, color, isHit, glowAlpha, pulse) {
    // Triangular armored bastion core
    const s = size * 0.9;
    g.poly([
      { x: s * 1.2, y: 0 },
      { x: -s * 0.7, y: -s * 0.9 },
      { x: -s * 0.4, y: 0 },
      { x: -s * 0.7, y: s * 0.9 }
    ]);
    g.fill({ color: 0x1c1917 });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0xf59e0b, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xffffff });

    // 3 revolving mirror shield plates
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3 + pulse * 1.5;
      const sx = Math.cos(a) * size * 1.2;
      const sy = Math.sin(a) * size * 1.2;
      const perpA = a + Math.PI / 2;

      g.moveTo(sx - Math.cos(perpA) * 16, sy - Math.sin(perpA) * 16);
      g.lineTo(sx + Math.cos(perpA) * 16, sy + Math.sin(perpA) * 16);
      g.stroke({ width: 5.5, color: 0xf59e0b });
      g.stroke({ width: 2.2, color: 0xffffff });
    }

    g.circle(0, 0, size * 0.28);
    g.fill({ color: 0xfbbf24 });
  }

  static drawChronoManipulator(g, size, color, isHit, glowAlpha, pulse) {
    // Temporal chronometer warship with gear dial conduits
    g.circle(0, 0, size * 0.9);
    g.fill({ color: 0x083344 });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0x06b6d4, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xffffff });

    // 8 gear teeth
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + pulse;
      g.rect(Math.cos(a) * size * 0.95 - 4, Math.sin(a) * size * 0.95 - 4, 8, 8);
      g.fill({ color: 0x06b6d4 });
    }

    // Tachyon clock hands
    g.moveTo(0, 0);
    g.lineTo(Math.cos(pulse * 3) * size * 0.6, Math.sin(pulse * 3) * size * 0.6);
    g.stroke({ width: 3.5, color: 0xffffff });

    g.circle(0, 0, size * 0.22);
    g.fill({ color: 0x00f0ff });
  }

  static drawBroodmother(g, size, color, isHit, glowAlpha, pulse) {
    // Organic-metallic bio-ship with pulsing spawning sacs
    g.poly([
      { x: size * 1.3, y: 0 },
      { x: size * 0.5, y: -size * 0.75 },
      { x: -size * 0.7, y: -size * 0.8 },
      { x: -size * 1.1, y: 0 },
      { x: -size * 0.7, y: size * 0.8 },
      { x: size * 0.5, y: size * 0.75 }
    ]);
    g.fill({ color: 0x052e16 });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0x10b981, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xec4899 });

    // 4 glowing bio-luminescent sacs
    const bPulse = 0.8 + Math.sin(pulse * 4) * 0.2;
    [
      { x: size * 0.2, y: -size * 0.4 },
      { x: size * 0.2, y: size * 0.4 },
      { x: -size * 0.4, y: -size * 0.4 },
      { x: -size * 0.4, y: size * 0.4 }
    ].forEach(pt => {
      g.circle(pt.x, pt.y, size * 0.2 * bPulse);
      g.fill({ color: 0xec4899 });
      g.circle(pt.x, pt.y, size * 0.1);
      g.fill({ color: 0xffffff });
    });
  }

  static drawBloodReaper(g, size, color, isHit, glowAlpha, pulse) {
    // Gothic bat-winged blood vessel
    g.poly([
      { x: size * 1.4, y: 0 },
      { x: size * 0.4, y: -size * 0.4 },
      { x: 0, y: -size * 1.25 },
      { x: -size * 0.6, y: -size * 0.9 },
      { x: -size * 0.4, y: -size * 0.3 },
      { x: -size * 1.1, y: 0 },
      { x: -size * 0.4, y: size * 0.3 },
      { x: -size * 0.6, y: size * 0.9 },
      { x: 0, y: size * 1.25 },
      { x: size * 0.4, y: size * 0.4 }
    ]);
    g.fill({ color: 0x450a0a });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0xdc2626, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xffffff });

    // Vampiric Blood Eye Core
    g.circle(size * 0.1, 0, size * 0.32);
    g.fill({ color: 0xef4444 });
    g.circle(size * 0.1, 0, size * 0.15);
    g.fill({ color: 0xffffff });
  }

  static drawHyperionJuggernaut(g, size, color, isHit, glowAlpha, pulse) {
    // Pointed battering ram bow + rocket booster banks
    g.poly([
      { x: size * 1.6, y: 0 },
      { x: size * 0.7, y: -size * 0.7 },
      { x: -size * 0.9, y: -size * 0.8 },
      { x: -size * 1.1, y: 0 },
      { x: -size * 0.9, y: size * 0.8 },
      { x: size * 0.7, y: size * 0.7 }
    ]);
    g.fill({ color: 0x1c1917 });
    g.stroke({ width: 5, color: isHit ? 0xffffff : 0xeab308, alpha: glowAlpha });
    g.stroke({ width: 2, color: 0xffffff });

    // Heavy reinforced ram head
    g.poly([
      { x: size * 1.6, y: 0 },
      { x: size * 0.8, y: -size * 0.45 },
      { x: size * 0.8, y: size * 0.45 }
    ]);
    g.fill({ color: 0xeab308 });
    g.stroke({ width: 2, color: 0xffffff });

    // Giant rocket afterburner banks
    [-size * 0.5, size * 0.5].forEach(offY => {
      const jet = size * (0.8 + Math.sin(pulse * 10) * 0.3);
      g.moveTo(-size * 0.9, offY);
      g.lineTo(-size * 0.9 - jet, offY - size * 0.18);
      g.lineTo(-size * 0.9 - jet * 1.3, offY);
      g.lineTo(-size * 0.9 - jet, offY + size * 0.18);
      g.closePath();
      g.fill({ color: 0xff6600, alpha: 0.9 });
    });
  }

  static drawMirageOverlord(g, size, color, isHit, glowAlpha, pulse, isClone) {
    // Prismatic crystal starship
    const alpha = isClone ? 0.65 + Math.sin(pulse * 6) * 0.2 : 1.0;
    g.poly([
      { x: size * 1.4, y: 0 },
      { x: size * 0.3, y: -size * 0.8 },
      { x: -size * 0.8, y: -size * 1.1 },
      { x: -size * 0.5, y: 0 },
      { x: -size * 0.8, y: size * 1.1 },
      { x: size * 0.3, y: size * 0.8 }
    ]);
    g.fill({ color: 0x3b0764, alpha });
    g.stroke({ width: 4.5, color: isHit ? 0xffffff : 0xec4899, alpha: glowAlpha * alpha });
    g.stroke({ width: 2, color: 0x00f0ff, alpha });

    g.circle(0, 0, size * 0.35);
    g.fill({ color: 0xec4899, alpha });
    g.circle(0, 0, size * 0.18);
    g.fill({ color: 0xffffff, alpha });
  }
}
