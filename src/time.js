// Changed: extracted from game.js – time-of-day / season logic and palettes
export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 4  && h <  6)  return 'dawn';
  if (h >= 6  && h <  9)  return 'morning';
  if (h >= 9  && h < 17)  return 'day';
  if (h >= 17 && h < 19)  return 'afternoon';
  if (h >= 19 && h < 21)  return 'evening';
  return 'night';
}

export function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5)  return 'spring';
  if (m >= 6 && m <= 8)  return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

export const SKY_COLORS = {
  // Changed: time-of-day palettes tuned for natural urban daylight/night transitions
  dawn:      { sky: '#7c8aa6', ambient: '#b8bfd0', fog: 'rgba(170,180,210,0.18)' },
  morning:   { sky: '#95b8de', ambient: '#d8c9a8', fog: 'rgba(215,225,245,0.10)' },
  day:       { sky: '#87b8ea', ambient: '#f2f5ff', fog: 'rgba(220,235,255,0.05)' },
  afternoon: { sky: '#7ea4cf', ambient: '#e6b27c', fog: 'rgba(235,205,170,0.10)' },
  evening:   { sky: '#4f5e86', ambient: '#c48662', fog: 'rgba(150,120,150,0.18)' },
  night:     { sky: '#131a2b', ambient: '#3b4c76', fog: 'rgba(20,28,48,0.28)'    },
};

export const SEASON_TINT = {
  spring: 'rgba(80,160,80,0.07)',
  summer: 'rgba(40,120,40,0.09)',
  autumn: 'rgba(160,80,20,0.10)',
  winter: 'rgba(180,200,230,0.12)',
};

export const TREE_PAL = {
  spring: { c1: '#2a4a18', c2: '#3a6020', trunk: '#241808' },
  summer: { c1: '#1e3c10', c2: '#2a5018', trunk: '#1c0e06' },
  autumn: { c1: '#6a3010', c2: '#8a4818', trunk: '#2a1408' },
  winter: { c1: '#303838', c2: '#3a4040', trunk: '#201a18' },
};
