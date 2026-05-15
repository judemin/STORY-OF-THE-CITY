// Changed: bootstrap + app loop orchestration module
import { MAX_H } from './constants.js';
import { state } from './state.js';
import { loadStorage, saveStorage } from './storage.js';
import { calcStage, calcTier } from './stage.js';
import { buildCity } from './world.js';
import { resizeCanvas, render } from './render.js';
import { bindControls, updateTimerDisplay } from './ui.js';

function tick(now) {
  state.animFrame = requestAnimationFrame(tick);

  if (state.running && state.lastTick !== null) {
    const delta = Math.floor((now - state.lastTick) / 1000);
    if (delta >= 1) {
      state.totalSecs = Math.min(state.totalSecs + delta, MAX_H);
      state.lastTick = now - ((now - state.lastTick) % 1000);
      updateTimerDisplay();
      saveStorage();

      const newStage = calcStage(state.totalSecs);
      if (newStage !== state.stage) {
        state.stage = newStage;
        state.tier  = calcTier(newStage);
        buildCity();
      }
    }
  } else if (state.running) {
    state.lastTick = now;
  }

  render();
}

// Changed: app startup wiring
loadStorage();
resizeCanvas();
state.stage = calcStage(state.totalSecs);
state.tier  = calcTier(state.stage);
buildCity();
updateTimerDisplay();
bindControls();

window.addEventListener('resize', () => {
  resizeCanvas();
  buildCity();
});

requestAnimationFrame(tick);
