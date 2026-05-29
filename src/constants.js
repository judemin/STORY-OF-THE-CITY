// Changed: extracted from game.js – all fixed config lives here
export const TILE  = 8;
export const MAX_H = 999 * 3600;
export const ISO_TILE_W = 30; // Changed: isometric tile width
export const ISO_TILE_H = 14; // Changed: isometric tile height
export const FLOOR_H = 12; // Changed: building floor height in pixels
export const LOGICAL_W = 960; // Changed: fixed logical canvas width
export const LOGICAL_H = 540; // Changed: fixed logical canvas height

export const STAGES = Array.from({ length: 48 }, (_, i) => ({
  min: i * 600,
  max: i < 47 ? (i + 1) * 600 : Infinity,
  id: i,
}));

export const PALETTES = [
  { ground: '#1c1a18', road: '#343840', bld: ['#3a2e24','#2e2620'],                     win: '#4a5868', roof: ['#28201a','#221a14'] },
  { ground: '#1e1c1a', road: '#363a42', bld: ['#3e3228','#342a20','#443830'],           win: '#4e6278', roof: ['#2c221c','#261c18'] },
  { ground: '#1c1e1c', road: '#383c44', bld: ['#3c3428','#48403a','#3a382e','#302c24'], win: '#567080', roof: ['#2a2820','#242018'] },
  { ground: '#1a1c1a', road: '#3a3e46', bld: ['#404040','#484840','#383c38','#303430'], win: '#607888', roof: ['#282a28','#222422'] },
  { ground: '#181a18', road: '#3c4048', bld: ['#424240','#484844','#3e4040','#383a38'], win: '#6a8490', roof: ['#262826','#202220'] },
];

export const GROUND_TILES = [
  ['#231608','#1e120a','#271a08','#1b0f06','#2a1810'], // stage 0: muddy earth / dirt
  ['#1b1a10','#1d1c12','#191810','#201e12','#17160e'], // stage 1: packed soil / scrub
  ['#161820','#181a22','#141620','#1a1c24','#131520'], // stage 2: gravel
  ['#141620','#161820','#12141e','#181a22','#13151f'], // stage 3: concrete
  ['#12141c','#14161e','#10121a','#161820','#111319'], // stage 4: dark asphalt
];

export const GRID_W = 42;
export const GRID_H = 42;
export const GROUND_START_Y = Math.floor(GRID_H * 0.38);

export const ROAD_Y1 = Math.floor(GRID_H * 0.55);
export const ROAD_Y2 = Math.floor(GRID_H * 0.72);
