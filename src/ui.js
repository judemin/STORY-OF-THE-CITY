// Changed: UI-only module (DOM binding, timer text, button events)
import { state } from './state.js';

const timerEl = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');

function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function updateTimerDisplay() {
  timerEl.textContent = fmtTime(state.totalSecs);
}

// Changed: keep START/PAUSE visibility in sync with running state
function syncPlayButtons() {
  btnStart.style.display = state.running ? 'none' : 'block';
  btnPause.style.display = state.running ? 'block' : 'none';
}

export function bindControls() {
  // Changed: initial UI state on first load
  syncPlayButtons();

  btnStart.addEventListener('click', () => {
    state.running = true;
    state.lastTick = null;
    syncPlayButtons();
  });

  btnPause.addEventListener('click', () => {
    state.running = false;
    state.lastTick = null;
    syncPlayButtons();
  });
}
