import { state } from './state.js';

const timerEl   = document.getElementById('timer-display');
const btnStart  = document.getElementById('btn-start');
const btnPause  = document.getElementById('btn-pause');
const overlay   = document.getElementById('pause-overlay');
const actionBtn = document.getElementById('pause-action-btn');

function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function updateTimerDisplay() {
  timerEl.textContent = fmtTime(state.totalSecs);
}

function syncUI() {
  btnStart.style.display = state.running ? 'none' : 'block';
  btnPause.style.display = state.running ? 'block' : 'none';
  if (state.running) {
    overlay.classList.add('hidden');
  } else {
    actionBtn.textContent = state.totalSecs === 0 ? 'START' : 'RESUME';
    overlay.classList.remove('hidden');
  }
}

export function bindControls() {
  syncUI();

  btnStart.addEventListener('click', () => {
    state.running = true;
    state.lastTick = null;
    syncUI();
  });

  btnPause.addEventListener('click', () => {
    state.running = false;
    state.lastTick = null;
    syncUI();
  });

  actionBtn.addEventListener('click', () => {
    state.running = true;
    state.lastTick = null;
    syncUI();
  });
}
