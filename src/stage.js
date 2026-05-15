// Changed: extracted from game.js – converts totalSecs → stage id
import { STAGES } from './constants.js';

export function calcStage(secs) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (secs >= STAGES[i].min) return STAGES[i].id;
  }
  return 0;
}

// Maps stage 0-47 to visual tier 0-4 (used by world/render arrays)
export function calcTier(stage) {
  return Math.min(4, Math.floor(stage / 10));
}
