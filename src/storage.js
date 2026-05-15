// Changed: extracted from game.js – localStorage read/write only
import { state } from './state.js';
import { MAX_H } from './constants.js';

const LS_KEY = 'sotc_v1';

function todayStr() {
  const d = new Date();
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
