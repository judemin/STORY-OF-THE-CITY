import React, { useState } from 'react';
import { signIn, signUp } from '../lib/auth.js';

export default function AuthModal() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setDone(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) {
    setTab(t);
    setError('');
    setDone(false);
  }

  return (
    <div id="auth-overlay">
      <div id="auth-card">
        <h1 id="auth-title">STORY OF THE CITY</h1>

        {done ? (
          <>
            <p className="auth-notice">확인 이메일을 보냈습니다</p>
            <p className="auth-notice">메일함을 확인해 주세요</p>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                onClick={() => switchTab('login')}
              >LOGIN</button>
              <span className="auth-tab-sep">/</span>
              <button
                className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
                onClick={() => switchTab('signup')}
              >SIGN UP</button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                className="auth-input"
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                className="auth-input"
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-submit hud-btn" type="submit" disabled={loading}>
                {loading ? '···' : tab === 'login' ? 'LOGIN' : 'SIGN UP'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
