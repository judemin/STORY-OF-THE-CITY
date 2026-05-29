import React, { useEffect, useState } from 'react';
import { getWeeklyStats, getMonthlyStats } from '../lib/db.js';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function fmtHM(secs) {
  if (!secs) return '-';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

function intensityColor(secs) {
  if (!secs) return '#0e0e1e';
  if (secs < 1800)  return '#1a1a32';  // < 30min
  if (secs < 3600)  return '#222248';  // < 1h
  if (secs < 7200)  return '#2e2e6a';  // < 2h
  if (secs < 14400) return '#3e3e94';  // < 4h
  return '#5050bb';                     // 4h+
}

function todayStr() {
  const d = new Date(Date.now() - 6 * 3600 * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Week View ────────────────────────────────────────────────
function WeekView({ userId }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    getWeeklyStats(userId).then(setRows);
  }, [userId]);

  if (!rows) return <p className="stats-loading">LOADING...</p>;

  const today = todayStr();
  const total = rows.reduce((s, r) => s + r.total_secs, 0);
  const maxSecs = Math.max(...rows.map(r => r.total_secs), 1);

  return (
    <div className="stats-week">
      <p className="stats-sub">THIS WEEK &nbsp;<strong>{fmtHM(total)}</strong></p>
      <div className="stats-bars">
        {rows.map(row => {
          const day = DAY_LABELS[new Date(row.date + 'T12:00:00').getDay()];
          const pct = Math.round((row.total_secs / maxSecs) * 100);
          const isToday = row.date === today;
          return (
            <div key={row.date} className="stats-bar-col">
              <span className="stats-bar-val">{row.total_secs > 0 ? fmtHM(row.total_secs) : ''}</span>
              <div className="stats-bar-track">
                <div
                  className={`stats-bar-fill${isToday ? ' today' : ''}`}
                  style={{ height: `${Math.max(pct, row.total_secs > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className={`stats-bar-label${isToday ? ' today' : ''}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Month View ───────────────────────────────────────────────
function MonthView({ userId }) {
  const now = new Date(Date.now() - 6 * 3600 * 1000);
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [data,  setData]  = useState(null);

  useEffect(() => {
    setData(null);
    getMonthlyStats(userId, year, month).then(setData);
  }, [userId, year, month]);

  function prev() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function next() {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    if (year > curYear || (year === curYear && month >= curMonth)) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === (now.getMonth() + 1);

  // Build calendar grid
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = todayStr();

  const focusMap = {};
  if (data) data.forEach(r => { focusMap[r.date] = r.total_secs; });

  const totalMonth = data ? data.reduce((s, r) => s + r.total_secs, 0) : 0;

  // cells: null = empty, number = day
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="stats-month">
      <div className="stats-month-nav">
        <button className="stats-nav-btn" onClick={prev}>{'<'}</button>
        <span className="stats-month-label">{MONTH_NAMES[month - 1]} {year}</span>
        <button className="stats-nav-btn" onClick={next} disabled={isCurrentMonth}>{'>'}</button>
      </div>

      <p className="stats-sub">TOTAL &nbsp;<strong>{fmtHM(totalMonth)}</strong></p>

      {!data ? (
        <p className="stats-loading">LOADING...</p>
      ) : (
        <div className="stats-cal">
          {DAY_LABELS.map(d => (
            <div key={d} className="stats-cal-head">{d.slice(0, 1)}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="stats-cal-cell empty" />;
            const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const secs = focusMap[dateStr] ?? 0;
            const isToday = dateStr === today;
            return (
              <div
                key={dateStr}
                className={`stats-cal-cell${isToday ? ' today' : ''}`}
                style={{ background: intensityColor(secs) }}
                title={secs ? fmtHM(secs) : ''}
              >
                <span className="stats-cal-day">{day}</span>
                {secs > 0 && <span className="stats-cal-time">{fmtHM(secs)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main StatsPanel ──────────────────────────────────────────
export default function StatsPanel({ userId, onClose }) {
  const [tab, setTab] = useState('week');

  return (
    <div id="stats-panel">
      <div id="stats-card">
        <h2 className="stats-title">FOCUS STATS</h2>

        <div className="stats-tabs">
          <button
            className={`stats-tab${tab === 'week' ? ' active' : ''}`}
            onClick={() => setTab('week')}
          >WEEK</button>
          <span className="stats-tab-sep">/</span>
          <button
            className={`stats-tab${tab === 'month' ? ' active' : ''}`}
            onClick={() => setTab('month')}
          >MONTH</button>
        </div>

        {tab === 'week'  && <WeekView  userId={userId} />}
        {tab === 'month' && <MonthView userId={userId} />}

        <button className="stats-back-btn" onClick={onClose}>← BACK</button>
      </div>
    </div>
  );
}
