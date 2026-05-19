import React, { useEffect, useRef } from 'react';

export default function App() {
  const hasInit = useRef(false);

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
      </div>

      <canvas id="city-canvas"></canvas>

      <div id="pause-overlay">
        <div id="pause-card">
          <h1 id="pause-title">STORY OF THE CITY</h1>
          <p id="pause-tagline">집중할수록, 도시가 자란다</p>
          <button id="pause-action-btn" className="hud-btn">START</button>
        </div>
      </div>
    </>
  );
}
