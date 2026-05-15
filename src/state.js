// Changed: extracted from game.js – single source of runtime state
export const state = {
  running:     false,
  sessionSecs: 0,
  totalSecs:   0,
  lastTick:    null,
  stage:       0,
  tier:        0,
  animFrame:   null,
};
