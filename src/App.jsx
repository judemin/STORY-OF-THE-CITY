import React, { useEffect, useRef, useState } from 'react';
import AuthModal from './components/AuthModal.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import { getSession, onAuthStateChange, signOut } from './lib/auth.js';
import { loadTodayFocus } from './lib/db.js';
import { state } from './state.js';
import { mergeRemoteFocus } from './storage.js';

export default function App() {
  const hasInit = useRef(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    getSession().then(session => {
      if (session?.user) handleLogin(session.user);
      setAuthReady(true);
    });

    const { data: { subscription } } = onAuthStateChange(session => {
      if (session?.user) {
        handleLogin(session.user);
      } else {
        state.userId = null;
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(authUser) {
    state.userId = authUser.id;
    setUser(authUser);
    setAuthReady(true);

    const remoteSecs = await loadTodayFocus(authUser.id);
    mergeRemoteFocus(remoteSecs);

    // main.js가 동적 import 이후에 이벤트를 받으므로 DOM 타이밍 안전
    window.dispatchEvent(new CustomEvent('sotc:login'));
  }

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    import('./main.js').catch(console.error);
  }, []);

  return (
    <>
      <div id="hud">
        <span id="timer-display">00:00:00</span>
        <button id="btn-start" className="hud-btn">START</button>
        <button id="btn-pause" className="hud-btn">PAUSE</button>
        {user && (
          <>
            <button className="hud-btn" onClick={() => setShowStats(v => !v)}>STATS</button>
            <button className="hud-btn" onClick={() => signOut()}>LOGOUT</button>
          </>
        )}
      </div>

      <canvas id="city-canvas"></canvas>

      <div id="pause-overlay">
        <div id="pause-card">
          <h1 id="pause-title">STORY OF THE CITY</h1>
          <p id="pause-tagline">집중할수록, 도시가 자란다</p>
          <button id="pause-action-btn" className="hud-btn">START</button>
        </div>
      </div>

      {authReady && !user && <AuthModal />}

      {showStats && user && (
        <StatsPanel userId={user.id} onClose={() => setShowStats(false)} />
      )}
    </>
  );
}
