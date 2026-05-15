// Changed: extracted from game.js – localStorage read/write only
import { state } from './state.js';
import { MAX_H } from './constants.js';

const LS_KEY = 'sotc_v1';

function todayStr() {
  // Day boundary = 06:00. Shift back 6h so midnight~5:59 still belongs to previous day.
  const d = new Date(Date.now() - 6 * 3600 * 1000);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function loadStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.date !== todayStr()) { localStorage.removeItem(LS_KEY); return; }
    state.totalSecs = Math.min(data.totalSecs || 0, MAX_H);
  } catch (_) {}
}

export function saveStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify({ date: todayStr(), totalSecs: state.totalSecs }));
}
