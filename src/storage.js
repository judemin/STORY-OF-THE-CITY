import { state } from './state.js';
import { MAX_H } from './constants.js';
import { saveDailyFocus } from './lib/db.js';

const LS_KEY = 'sotc_v1';

function todayStr() {
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
  if (state.userId) {
    saveDailyFocus(state.userId, state.totalSecs);
  }
}

// 로그인 후 DB 값과 로컬 값을 비교해 더 큰 쪽 사용
export function mergeRemoteFocus(remoteSecs) {
  if (remoteSecs > state.totalSecs) {
    state.totalSecs = Math.min(remoteSecs, MAX_H);
  }
}
