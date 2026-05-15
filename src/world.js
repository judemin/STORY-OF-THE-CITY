import { PALETTES, GRID_W, GRID_H } from './constants.js';
import { state } from './state.js';

export let cityBuildings = [];
export let cityLights = [];
export let cityLamps = [];
export let cityTrees = [];
export let cityDecos = [];
export let cityTiles = [];
export let cityElevated = [];
export let cityTraffic = [];
export let cityProps = [];
export let cityRoofProps = [];
export let cityBackdrop = [];

export function seededRand(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = Math.imul(s, 16807) >>> 0;
    s = (s + 0x9e3779b9) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

export function posHash(tx, ty, mod) {
  return (((tx * 374761393 + ty * 668265263) >>> 0) % mod);
}

// ── Tile system ─────────────────────────────────────────────────────────────

const MX = Math.floor(GRID_W / 2);
const MY = Math.floor(GRID_H / 2);

// Road positions relative to center
const H_ROADS = new Set([MY, MY - 7, MY + 7, MY - 14, MY + 14, 2, GRID_H - 3]);
const V_ROADS = new Set([MX, MX - 7, MX + 7, MX - 14, MX + 14, 2, GRID_W - 3]);

function roadAxis(x, y) {
  if (H_ROADS.has(y)) return 'h';
  if (V_ROADS.has(x)) return 'v';
  return '';
}

function tileType(x, y) {
  if (roadAxis(x, y)) return 'road';
  const rx = Math.abs(x - MX);
  const ry = Math.abs(y - MY);
  if (rx <= 2 && ry <= 2) return 'plaza';
  if ((rx === 3 && ry <= 4) || (ry === 3 && rx <= 4)) return 'walk';
  if ((x <= 5 && y <= 5) || (x >= GRID_W - 6 && y >= GRID_H - 6)) return 'park';
  if ((x <= 5 && y >= GRID_H - 6) || (x >= GRID_W - 6 && y <= 5)) return 'park';
  if ((x >= 6 && x <= 9 && y >= GRID_H - 7) || (y >= 6 && y <= 9 && x >= GRID_W - 7)) return 'service';
  return 'lot';
}

function district(x, y) {
  const r = Math.max(Math.abs(x - MX), Math.abs(y - MY));
  if (r <= 6) return 'core';
  if (r <= 13) return 'inner';
  return 'edge';
}

// ── Grid helpers ─────────────────────────────────────────────────────────────

function canPlace(types, occ, x, y, w, d) {
  if (x < 0 || y < 0 || x + w > GRID_W || y + d > GRID_H) return false;
  for (let dy = 0; dy < d; dy++)
    for (let dx = 0; dx < w; dx++)
      if (types[y + dy][x + dx] !== 'lot' || occ[y + dy][x + dx]) return false;
  return true;
}

function markOcc(occ, x, y, w, d) {
  for (let dy = 0; dy < d; dy++)
    for (let dx = 0; dx < w; dx++)
      occ[y + dy][x + dx] = true;
}

// ── Window / roof helpers ────────────────────────────────────────────────────

function addWindowLights(b, rand, pal) {
  for (let dy = 0; dy < b.d; dy++)
    for (let dx = 0; dx < b.w; dx++)
      for (let z = 1; z < b.h; z++) {
        if (rand() > 0.22) {
          cityLights.push({
            x: b.x + dx, y: b.y + dy, z,
            color: pal.win,
            seed: Math.floor(rand() * 9999),
            pattern: b.facadeId || 0,
            role: b.archetype,
          });
        }
      }
}

function addRoofProps(b, rand, count) {
  const types = ['ac', 'tank', 'antenna', 'duct', 'panel', 'sat', 'garden', 'crown', 'mast'];
  for (let i = 0; i < count; i++) {
    cityRoofProps.push({
      x: b.x + Math.min(b.w - 1, Math.floor(rand() * b.w)),
      y: b.y + Math.min(b.d - 1, Math.floor(rand() * b.d)),
      z: b.h,
      type: types[Math.floor(rand() * types.length)],
      seed: Math.floor(rand() * 9999),
    });
  }
}

// ── Building placement ───────────────────────────────────────────────────────

function pushBuilding(spec, occ, rand, pal) {
  markOcc(occ, spec.x, spec.y, spec.w, spec.d);
  cityBuildings.push(spec);
  const roofCount = Math.max(2, Math.floor(spec.detail * 5));
  addRoofProps(spec, rand, roofCount);
  addWindowLights(spec, rand, pal);
}

function tryPlaceDesigned(spec, types, occ, rand, pal) {
  if (!canPlace(types, occ, spec.x, spec.y, spec.w, spec.d)) return false;
  pushBuilding({ z: 0, ...spec }, occ, rand, pal);
  return true;
}

// ── Building archetypes ──────────────────────────────────────────────────────
// archetype IDs: 0=cornerCommercial 1=verticalTower 2=rooftopMidrise
//               3=lowCommercialBlock 4=steppedMass 5=landmarkTower
//               6=hubBuilding 7=backdropSimple

const ARCHETYPE_NAMES = [
  'cornerCommercial', 'verticalTower', 'rooftopMidrise',
  'lowCommercialBlock', 'steppedMass', 'landmarkTower',
  'hubBuilding', 'backdropSimple',
];

// Archetype pools per stage × district — define "how the city looks as it grows"
const STAGE_ARCHETYPE = [
  // stage 0: sparse, low-rise, mostly simple blocks + backdrops
  { core: [3, 3, 0, 7, 3], inner: [7, 7, 3, 0, 7], edge: [7, 7, 7, 3, 7] },
  // stage 1: commercial corners + mid-rise starts appearing
  { core: [0, 3, 2, 0, 3, 0], inner: [3, 0, 2, 7, 0, 3], edge: [7, 3, 0, 7, 7] },
  // stage 2: hub + vertical towers + mid-rise density
  { core: [6, 1, 2, 2, 0, 4], inner: [2, 1, 0, 3, 4, 2], edge: [7, 3, 0, 2, 7] },
  // stage 3: stepped mass + full mid-rise
  { core: [6, 4, 6, 1, 2, 4], inner: [2, 1, 4, 0, 3, 2, 1], edge: [3, 0, 2, 7, 3, 0] },
  // stage 4: full city — all archetypes in play
  { core: [4, 6, 6, 1, 2, 2, 4, 0], inner: [2, 2, 1, 4, 0, 3, 3, 0, 1], edge: [7, 7, 3, 0, 2, 7, 3] },
];

// ── Hero block (fixed designed scene) ────────────────────────────────────────

function buildHeroBlock(types, occ, rand, pal, s) {
  const stage = state.stage;
  const heroH = [4, 6, 8, 10, 13][s];
  const ci = (n) => n % pal.bld.length;
  const ri = (n) => n % pal.roof.length;
  const detail = 1.0;

  if (stage < 5) return;

  // stage 5: first tall building appears
  tryPlaceDesigned({
    x: MX - 6, y: MY - 6, w: 2, d: 2, h: heroH + 2,
    archetype: 'verticalTower', archetypeId: 1, facadeId: 0,
    color: pal.bld[ci(3)], roofColor: pal.roof[ri(1)],
    landmark: false, detail,
    roofSet: 'crown', signType: 'vertical', massing: 'cap',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 1, y: MY - 6, w: 2, d: 2, h: heroH + 2,
    archetype: 'steppedMass', archetypeId: 4, facadeId: 2,
    color: pal.bld[ci(0)], roofColor: pal.roof[ri(0)],
    landmark: false, detail,
    roofSet: 'deck', signType: 'vertical', massing: 'stepped',
  }, types, occ, rand, pal);

  if (stage < 10) return;

  tryPlaceDesigned({
    x: MX - 3, y: MY - 6, w: 2, d: 2, h: Math.max(4, heroH + 1),
    archetype: 'verticalTower', archetypeId: 1, facadeId: 2,
    color: pal.bld[ci(0)], roofColor: pal.roof[ri(0)],
    landmark: false, detail: 0.95,
    roofSet: 'antenna', signType: 'vertical', massing: 'cap',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 3, y: MY - 6, w: 2, d: 2, h: Math.max(3, heroH - 1),
    archetype: 'rooftopMidrise', archetypeId: 2, facadeId: 3,
    color: pal.bld[ci(2)], roofColor: pal.roof[ri(1)],
    landmark: false, detail: 0.9,
    roofSet: 'mix', signType: 'none', massing: 'cap',
  }, types, occ, rand, pal);

  if (stage < 18) return;

  tryPlaceDesigned({
    x: MX - 6, y: MY - 3, w: 2, d: 2, h: Math.max(4, heroH - 1),
    archetype: 'cornerCommercial', archetypeId: 0, facadeId: 1,
    color: pal.bld[ci(1)], roofColor: pal.roof[ri(1)],
    landmark: false, detail,
    roofSet: 'hvac', signType: 'corner', massing: 'recess',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 5, y: MY - 3, w: 2, d: 2, h: heroH + 1,
    archetype: 'hubBuilding', archetypeId: 6, facadeId: 3,
    color: pal.bld[ci(2)], roofColor: pal.roof[ri(0)],
    landmark: false, detail,
    roofSet: 'deck', signType: 'corner', massing: 'cornerBand',
  }, types, occ, rand, pal);

  if (stage < 26) return;

  tryPlaceDesigned({
    x: MX - 6, y: MY + 1, w: 2, d: 2, h: Math.max(3, heroH - 1),
    archetype: 'cornerCommercial', archetypeId: 0, facadeId: 4,
    color: pal.bld[ci(1)], roofColor: pal.roof[ri(0)],
    landmark: false, detail: 0.9,
    roofSet: 'hvac', signType: 'horizontal', massing: 'cap',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 5, y: MY + 1, w: 2, d: 2, h: Math.max(3, heroH - 2),
    archetype: 'hubBuilding', archetypeId: 6, facadeId: 5,
    color: pal.bld[ci(3)], roofColor: pal.roof[ri(1)],
    landmark: false, detail: 0.9,
    roofSet: 'deck', signType: 'panel', massing: 'recess',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 1, y: MY + 4, w: 2, d: 2, h: Math.max(3, heroH - 2),
    archetype: 'rooftopMidrise', archetypeId: 2, facadeId: 4,
    color: pal.bld[ci(2)], roofColor: pal.roof[ri(1)],
    landmark: false, detail: 0.88,
    roofSet: 'tank', signType: 'panel', massing: 'recess',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX - 6, y: MY + 4, w: 2, d: 2, h: Math.max(3, heroH - 3),
    archetype: 'rooftopMidrise', archetypeId: 2, facadeId: 0,
    color: pal.bld[ci(0)], roofColor: pal.roof[ri(0)],
    landmark: false, detail: 0.85,
    roofSet: 'hvac', signType: 'horizontal', massing: 'cutout',
  }, types, occ, rand, pal);

  if (stage < 36) return;

  tryPlaceDesigned({
    x: MX - 3, y: MY + 5, w: 3, d: 1, h: 3,
    archetype: 'lowCommercialBlock', archetypeId: 3, facadeId: 0,
    color: pal.bld[ci(0)], roofColor: pal.roof[ri(0)],
    landmark: false, detail: 0.8,
    roofSet: 'flat', signType: 'horizontal', massing: 'cutout',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 1, y: MY + 6, w: 3, d: 1, h: 3,
    archetype: 'lowCommercialBlock', archetypeId: 3, facadeId: 1,
    color: pal.bld[ci(3)], roofColor: pal.roof[ri(1)],
    landmark: false, detail: 0.8,
    roofSet: 'flat', signType: 'blade', massing: 'cutout',
  }, types, occ, rand, pal);

  tryPlaceDesigned({
    x: MX + 5, y: MY + 4, w: 2, d: 2, h: Math.max(3, heroH - 2),
    archetype: 'rooftopMidrise', archetypeId: 2, facadeId: 5,
    color: pal.bld[ci(1)], roofColor: pal.roof[ri(0)],
    landmark: false, detail: 0.88,
    roofSet: 'solar', signType: 'none', massing: 'cap',
  }, types, occ, rand, pal);
}

// ── Hero infrastructure (bridges, plazas) ─────────────────────────────────────

function addHeroInfrastructure(s) {
  if (state.stage >= 15) {
    for (let bx = MX - 1; bx <= MX + 1; bx++) {
      cityElevated.push({ x: bx, y: MY - 4, z: 5, type: 'heroBridge' });
    }
  }
  // Short bridge at lower hero zone (stage 3+)
  if (s >= 3) {
    for (let bx = MX - 6; bx <= MX - 3; bx++) {
      cityElevated.push({ x: bx, y: MY + 8, z: 2, type: 'bridge' });
    }
  }
}

// ── Hero plaza area ───────────────────────────────────────────────────────────

function addHeroPlaza() {
  // Plaza tiles around center cross
  const plazaCenters = [
    [MX - 2, MY - 2], [MX - 1, MY - 2], [MX, MY - 2],
    [MX - 2, MY - 1], [MX - 1, MY - 1], [MX, MY - 1],
    [MX - 2, MY],     [MX - 1, MY],     [MX, MY],
  ];
  for (const [px, py] of plazaCenters) {
    cityProps.push({ x: px, y: py, z: 0, type: 'laneMark' });
    if ((px + py) % 2 === 0) cityDecos.push({ x: px, y: py, z: 0, type: 'planter' });
  }
  // Trees along roads and walkways (clear of hero building footprints)
  for (const [tx, ty] of [
    [MX - 8, MY + 1], [MX - 8, MY + 2], [MX - 8, MY + 3],
    [MX + 8, MY - 4], [MX + 8, MY - 3], [MX + 8, MY - 2],
    [MX - 1, MY + 8], [MX, MY + 8], [MX + 1, MY + 8],
  ]) {
    cityTrees.push({ x: tx, y: ty, z: 0, variant: Math.abs(tx + ty) % 3 });
    if ((tx + ty) % 3 === 0) cityDecos.push({ x: tx, y: ty, z: 0, type: 'bench' });
  }
  // Pocket park: between outer roads
  for (const [tx, ty] of [
    [MX - 10, MY - 10], [MX - 9, MY - 10], [MX - 10, MY - 9],
    [MX - 9, MY - 9],  [MX - 10, MY - 11], [MX - 11, MY - 10],
  ]) {
    cityTrees.push({ x: tx, y: ty, z: 0, variant: (tx + ty) % 3 });
  }
}

// ── Perimeter fill — guarantees no empty sky/ground at screen edges ───────────

function addPerimeterFill(types, occ, rand, pal, s, cfg) {
  // With zoom=2.8, tiles with x+y in [26-32] appear in top ~20% of screen
  // Tiles with x+y in [50-56] appear in bottom ~15% of screen
  // Force-fill all lot tiles in these bands so no bare ground shows at edges
  const topMin = 22, topMax = 33;
  const botMin = 49, botMax = 57;
  for (let sum = topMin; sum <= botMax; sum++) {
    if (sum > topMax && sum < botMin) continue;
    const isTop = sum <= topMax;
    for (let x = Math.max(1, sum - GRID_H + 2); x < Math.min(GRID_W - 1, sum); x++) {
      const y = sum - x;
      if (y < 1 || y >= GRID_H - 1 || types[y][x] !== 'lot' || occ[y][x]) continue;
      if (rand() > cfg.fill) continue;
      // Height: top gets taller (they stretch into view from off-screen),
      // bottom gets shorter (just a framing sliver)
      const maxH = isTop ? (2 + s * 2) : (1 + s);
      const h = 1 + Math.floor(rand() * Math.max(1, maxH));
      const ai = isTop ? [7, 7, 3, 0][x % 4] : [3, 7, 0, 7][x % 4];
      cityBackdrop.push({
        x, y, z: 0, w: 1, d: 1, h,
        archetype: ARCHETYPE_NAMES[ai], archetypeId: ai,
        facadeId: (x * 3 + y) % 6,
        color: pal.bld[(x + y * 2) % pal.bld.length],
        roofColor: pal.roof[(x * 2 + y) % pal.roof.length],
        landmark: false, detail: cfg.detail * 0.55,
        roofSet: ['hvac', 'antenna', 'flat', 'cap', 'tank'][x % 5],
        signType: !isTop && s >= 2 ? 'horizontal' : 'none',
        massing: 'cap',
      });
      markOcc(occ, x, y, 1, 1);
    }
  }
}

// ── Procedural block fill ────────────────────────────────────────────────────

function fillBlocks(types, occ, rand, pal, s, cfg) {
  const isRoad = (x, y) => x >= 0 && y >= 0 && x < GRID_W && y < GRID_H && types[y][x] === 'road';
  const nearRoad = (x, y) =>
    isRoad(x + 1, y) || isRoad(x - 1, y) || isRoad(x, y + 1) || isRoad(x, y - 1);

  const stageArch = STAGE_ARCHETYPE[s];

  for (let y = 1; y < GRID_H - 1; y++) {
    for (let x = 1; x < GRID_W - 1; x++) {
      if (types[y][x] !== 'lot' || occ[y][x]) continue;
      const dist = district(x, y);
      const inHeroZone = Math.abs(x - MX) <= 7 && Math.abs(y - MY) <= 7;
      const densityFactor = dist === 'core' ? 1.30 : dist === 'inner' ? 1.05 : 0.78;
      const roadBonus = nearRoad(x, y) ? 1.18 : 0.80;
      // Stage 0: hero zone is nearly empty (hero block only), grows each stage
      const heroPenalty = inHeroZone
        ? [0.30, 0.45, 0.60, 0.75, 0.90][s]
        : 1;
      const density = Math.min(0.97, cfg.fill * densityFactor * roadBonus * heroPenalty);

      if (rand() > density) continue;

      // Footprint size by district + stage (later stages allow wider footprints)
      const wideP = (dist === 'core' ? 0.50 : dist === 'inner' ? 0.32 : 0.16) + s * 0.04;
      let w = rand() < wideP && canPlace(types, occ, x, y, 2, 1) ? 2 : 1;
      let d = rand() < wideP && canPlace(types, occ, x, y, w, 2) ? 2 : 1;
      if (!canPlace(types, occ, x, y, w, d)) {
        w = 1; d = 1;
        if (!canPlace(types, occ, x, y, 1, 1)) continue;
      }

      const archetypePool = stageArch[dist];
      const archetypeId = archetypePool[Math.floor(rand() * archetypePool.length)];
      const archetype = ARCHETYPE_NAMES[archetypeId];

      const [minH, maxH] = cfg.h;
      const boost = dist === 'core' ? 3 : dist === 'inner' ? 1 : 0;
      let h = Math.max(1, minH + Math.floor(rand() * (maxH - minH + 1)) + boost);
      // Archetype height adjustments
      if (archetypeId === 1) h = Math.max(h, minH + 2);
      if (archetypeId === 3) h = Math.min(h, 3);
      if (archetypeId === 7) h = Math.min(h, Math.max(2, maxH - 2));

      const b = {
        x, y, z: 0, w, d, h,
        archetype, archetypeId,
        facadeId: Math.floor(rand() * 6),
        landmark: false,
        color: pal.bld[Math.floor(rand() * pal.bld.length)],
        roofColor: pal.roof[Math.floor(rand() * pal.roof.length)],
        district: dist,
        detail: cfg.detail,
        roofSet: ['hvac', 'antenna', 'tank', 'solar', 'garden', 'mix'][Math.floor(rand() * 6)],
        signType: ['none', 'vertical', 'horizontal', 'panel', 'blade', 'corner'][Math.floor(rand() * 6)],
        massing: ['cap', 'recess', 'cornerBand', 'stepped', 'cutout', 'cap'][Math.floor(rand() * 6)],
      };

      if (!canPlace(types, occ, x, y, w, d)) continue;
      pushBuilding(b, occ, rand, pal);
    }
  }
}

// ── Lamps, props, decos ───────────────────────────────────────────────────────

function addStreetFurniture(types, occ, rand, s, cfg) {
  const isRoad = (x, y) => x >= 0 && y >= 0 && x < GRID_W && y < GRID_H && types[y][x] === 'road';

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const type = types[y][x];
      const axis = roadAxis(x, y);

      if (type === 'road') {
        const edge = !isRoad(x + 1, y) || !isRoad(x - 1, y) || !isRoad(x, y + 1) || !isRoad(x, y - 1);
        if (edge && (x + y) % 3 === 0) cityLamps.push({ x, y, z: 0 });
        if (rand() < 0.18 + cfg.props * 0.14)
          cityProps.push({ x, y, z: 0, type: ['laneMark', 'barrier', 'cone', 'cabinet', 'hydrant'][Math.floor(rand() * 5)] });
      }
      if (type === 'plaza' || type === 'walk') {
        if ((x + y) % 3 === 0) cityLamps.push({ x, y, z: 0 });
        if (rand() < 0.40 + cfg.props * 0.22)
          cityDecos.push({ x, y, z: 0, type: ['bench', 'planter', 'sign', 'bollard'][Math.floor(rand() * 4)] });
        if (rand() < 0.30 + cfg.props * 0.20)
          cityProps.push({ x, y, z: 0, type: ['kiosk', 'booth', 'stall', 'box', 'vent', 'utility'][Math.floor(rand() * 6)] });
      }
      if (type === 'park' || (type === 'walk' && rand() < 0.25)) {
        if (rand() < 0.82) cityTrees.push({ x, y, z: 0, variant: Math.floor(rand() * 3) });
        if (rand() < 0.35) cityProps.push({ x, y, z: 0, type: 'treePit' });
      }
      if (type === 'service' && rand() < 0.55)
        cityProps.push({ x, y, z: 0, type: ['box', 'vent', 'cabinet', 'utility', 'barrier'][Math.floor(rand() * 5)] });
    }
  }
}

// ── Traffic (actual car data) ─────────────────────────────────────────────────

const CAR_COLORS_DAY = [
  '#4a5a82', '#6a7a9a', '#8a6a4a', '#5a7a5a', '#9a5050', '#7a7a8a',
  '#4a6a7a', '#8a8a6a', '#6a4a7a', '#7a5a4a', '#5a6a9a', '#9a6a5a',
];
const CAR_TYPES = ['sedan', 'sedan', 'van', 'van', 'truck', 'bus'];

function addTraffic(types, rand, s) {
  const spacing = [18, 15, 12, 10, 8][s];
  const carMix = [
    ['sedan'],
    ['sedan', 'sedan', 'van'],
    ['sedan', 'van', 'bus'],
    ['sedan', 'van', 'truck', 'bus'],
    CAR_TYPES,
  ][s];
  const speedBase = [0.0016, 0.0018, 0.0022, 0.0026, 0.0030][s];

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const axis = roadAxis(x, y);
      if (!axis) continue;
      if ((x + y) % spacing !== 0) continue;
      const carType = carMix[Math.floor(rand() * carMix.length)];
      const carColor = CAR_COLORS_DAY[Math.floor(rand() * CAR_COLORS_DAY.length)];
      cityTraffic.push({
        axis,
        lane: axis === 'h' ? y : x,
        dir: axis === 'h' ? (y <= MY ? 1 : -1) : (x <= MX ? -1 : 1),
        speed: (speedBase + ((x + y) % 5) * 0.00015) / 24,
        offset: ((x * 41 + y * 23) % 100) / 100,
        carType,
        carColor,
        carId: x * 100 + y,
      });
    }
  }
}

// ── Main buildCity ────────────────────────────────────────────────────────────

export function buildCity() {
  const s = state.tier;
  // Fresh random seed every call: new city on every refresh
  const seed = ((Date.now() & 0x7fffffff) ^ (Math.random() * 0x7fffffff | 0)) >>> 0 || 1;
  const rand = seededRand(seed);
  const pal = PALETTES[s];
  const p = state.stage / 47;
  const cfg = {
    fill:   0.02 + p * 0.94,
    h:      [1 + Math.floor(p * 3), 2 + Math.floor(p * 10)],
    detail: 0.04 + p * 0.92,
    infra:  0.02 + p * 0.98,
    props:  0.04 + p * 0.90,
  };

  cityBuildings  = []; cityLights   = []; cityLamps  = [];
  cityTrees      = []; cityDecos    = []; cityTiles  = [];
  cityElevated   = []; cityTraffic  = []; cityProps  = [];
  cityRoofProps  = []; cityBackdrop = [];

  // Build tile type grid
  const types = Array.from({ length: GRID_H }, (_, y) =>
    Array.from({ length: GRID_W }, (_, x) => tileType(x, y))
  );
  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++)
      cityTiles.push({ x, y, type: types[y][x], district: district(x, y), v: posHash(x, y, 7) });

  const occ = Array.from({ length: GRID_H }, () => new Array(GRID_W).fill(false));

  // 1. Hero block first (always designed)
  buildHeroBlock(types, occ, rand, pal, s);

  // 2. Plaza and trees around hero
  addHeroPlaza();

  // 3. Infrastructure (stage-gated)
  addHeroInfrastructure(s);

  // 4. Perimeter fill — ensure screen edges have buildings before random fill
  addPerimeterFill(types, occ, rand, pal, s, cfg);

  // 5. Fill surrounding blocks by stage density + archetype
  fillBlocks(types, occ, rand, pal, s, cfg);

  // 6. Street furniture
  addStreetFurniture(types, occ, rand, s, cfg);

  // 7. Traffic (stage-based density)
  addTraffic(types, rand, s);

  // Sort for painter's order
  cityBuildings.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.h - b.h);
  cityTrees.sort((a, b) => (a.x + a.y) - (b.x + b.y));
}
