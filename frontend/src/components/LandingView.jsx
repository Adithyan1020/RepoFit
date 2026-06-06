import React, { useState, useEffect, useRef } from 'react';
import TerminalBoot from './TerminalBoot';

const LandingView = ({ onAnalyze, loading }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({ jobDescription: false, username: false });
  const [btnState, setBtnState] = useState('idle'); // idle | running | done
  const btnTimerRef = useRef(null);

  const handleAnalyzeClick = () => {
    const newErrors = {
      jobDescription: !jobDescription.trim(),
      username: !username.trim(),
    };
    setErrors(newErrors);
    if (newErrors.jobDescription || newErrors.username) return;

    // Animate button: running → done → trigger
    setBtnState('running');
    btnTimerRef.current = setTimeout(() => {
      setBtnState('done');
      btnTimerRef.current = setTimeout(() => {
        setBtnState('idle');
        onAnalyze(username, jobDescription);
      }, 700);
    }, 1200);
  };

  // Clear timers on unmount
  useEffect(() => () => clearTimeout(btnTimerRef.current), []);

  const btnLabel = {
    idle: '$ run analyze',
    running: '> running...',
    done: '> done ✓',
  }[btnState];

  const isBusy = loading || btnState !== 'idle';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; }

        body {
          background: #050505;
          margin: 0;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          95% { opacity: 0.9; }
          96% { opacity: 1; }
        }

        /* Dot-matrix grid background for hero */
        @keyframes gridFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .rf-root {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: #050505;
          min-height: 100vh;
          color: #e2e8e2;
          position: relative;
          overflow-x: hidden;
        }

        .rf-root::before {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 9999;
          animation: flicker 8s infinite;
        }

        .rf-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(5,5,5,0.95);
          border-bottom: 1px solid #1a2a1a;
          backdrop-filter: blur(8px);
        }

        .rf-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 32px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .rf-logo {
          font-family: 'Space Mono', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #22c55e;
          letter-spacing: -0.5px;
          text-shadow: 0 0 20px rgba(34,197,94,0.5);
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: text-shadow 0.2s;
        }

        .rf-logo:hover {
          text-shadow: 0 0 32px rgba(34,197,94,0.8);
        }

        .rf-logo span { color: #555; }

        .rf-badge {
          font-size: 10px;
          color: #22c55e;
          border: 1px solid #1a3a1a;
          background: rgba(34,197,94,0.05);
          padding: 4px 10px;
          border-radius: 2px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .rf-badge::before { content: '[ '; }
        .rf-badge::after { content: ' ]'; }

        /* Hero with dot-matrix background */
        .rf-hero-wrap {
          position: relative;
          overflow: hidden;
        }

        .rf-hero-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(34,197,94,0.12) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
          animation: gridFade 1s ease 0.3s both;
          mask-image: radial-gradient(ellipse 80% 60% at 70% 50%, black 20%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 70% 50%, black 20%, transparent 80%);
        }

        .rf-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 900px) {
          .rf-main { grid-template-columns: 1fr; gap: 40px; }
        }

        .rf-eyebrow {
          font-size: 10px;
          color: #22c55e;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rf-eyebrow::before {
          content: '//';
          color: #333;
        }

        .rf-h1 {
          font-family: 'Space Mono', monospace;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700;
          line-height: 1.15;
          color: #f0f4f0;
          margin: 0 0 20px 0;
          letter-spacing: -1px;
        }

        .rf-h1 .accent {
          color: #22c55e;
          text-shadow: 0 0 30px rgba(34,197,94,0.4);
        }

        .rf-body {
          font-size: 13px;
          color: #6b7a6b;
          line-height: 1.8;
          margin: 0 0 32px 0;
          max-width: 420px;
        }

        .rf-stats {
          display: flex;
          gap: 0;
          border: 1px solid #1a2a1a;
          border-radius: 4px;
          overflow: hidden;
          width: fit-content;
        }

        .rf-stat {
          padding: 16px 24px;
          border-right: 1px solid #1a2a1a;
          text-align: center;
        }

        .rf-stat:last-child { border-right: none; }

        .rf-stat-val {
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #22c55e;
          display: block;
          text-shadow: 0 0 16px rgba(34,197,94,0.4);
        }

        .rf-stat-label {
          font-size: 9px;
          color: #444;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 4px;
          display: block;
        }

        .rf-panel {
          background: #0a0a0a;
          border: 1px solid #1a2a1a;
          border-radius: 6px;
          overflow: hidden;
        }

        .rf-panel-titlebar {
          background: #0f0f0f;
          border-bottom: 1px solid #1a2a1a;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rf-dot { width: 10px; height: 10px; border-radius: 50%; }
        .rf-dot-red { background: #3a1a1a; border: 1px solid #5a2a2a; }
        .rf-dot-yellow { background: #2a2a1a; border: 1px solid #4a4a1a; }
        .rf-dot-green { background: #1a3a1a; border: 1px solid #2a5a2a; }

        .rf-panel-title {
          font-size: 11px;
          color: #444;
          margin-left: 4px;
          letter-spacing: 0.5px;
        }

        .rf-panel-body { padding: 24px; }

        .rf-field { margin-bottom: 20px; }

        .rf-label {
          display: block;
          font-size: 10px;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .rf-label .comment { color: #2a4a2a; }

        .rf-textarea {
          width: 100%;
          min-height: 180px;
          background: #050505;
          border: 1px solid #1a2a1a;
          border-radius: 4px;
          color: #86efac;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.7;
          padding: 14px 16px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          caret-color: #22c55e;
        }

        .rf-textarea::placeholder { color: #2a3a2a; }

        .rf-textarea:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 1px rgba(34,197,94,0.2), 0 0 16px rgba(34,197,94,0.05);
        }

        .rf-textarea.rf-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 1px rgba(239,68,68,0.2);
        }

        .rf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: end;
        }

        @media (max-width: 600px) { .rf-row { grid-template-columns: 1fr; } }

        .rf-input-wrap {
          position: relative;
        }

        .rf-input-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #2a5a2a;
          font-family: 'JetBrains Mono', monospace;
          pointer-events: none;
          white-space: nowrap;
        }

        .rf-input {
          width: 100%;
          background: #050505;
          border: 1px solid #1a2a1a;
          border-radius: 4px;
          color: #86efac;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          padding: 12px 14px 12px 110px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          caret-color: #22c55e;
        }

        .rf-input::placeholder { color: #2a3a2a; }

        .rf-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 1px rgba(34,197,94,0.2), 0 0 12px rgba(34,197,94,0.05);
        }

        .rf-input.rf-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 1px rgba(239,68,68,0.2);
        }

        .rf-field-error {
          font-size: 10px;
          color: #ef4444;
          margin-top: 5px;
          letter-spacing: 0.5px;
          display: block;
        }

        .rf-btn {
          width: 100%;
          background: #22c55e;
          color: #050505;
          border: none;
          border-radius: 4px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 13px;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .rf-btn.rf-btn-running {
          background: #0a0a0a;
          color: #22c55e;
          border: 1px solid #22c55e;
          letter-spacing: 2px;
        }

        .rf-btn.rf-btn-done {
          background: #0a0a0a;
          color: #22c55e;
          border: 1px solid #22c55e;
        }

        .rf-btn:hover:not(:disabled) {
          background: #16a34a;
          box-shadow: 0 0 24px rgba(34,197,94,0.3);
        }

        .rf-btn.rf-btn-running:hover, .rf-btn.rf-btn-done:hover {
          background: #0a0a0a;
          box-shadow: none;
        }

        .rf-btn:active:not(:disabled) { transform: scale(0.98); }
        .rf-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .rf-btn-icon { font-size: 16px; }

        .rf-panel-footer {
          border-top: 1px solid #1a2a1a;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #080808;
          font-size: 11px;
          color: #2d4a2d;
          letter-spacing: 0.5px;
        }

        .rf-trust-signal {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #4ade80;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .rf-trust-icon {
          font-size: 14px;
          color: #22c55e;
        }

        .rf-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          margin-right: 6px;
          animation: pulse-green 2s ease-in-out infinite;
        }

        .rf-features {
          border-top: 1px solid #0f1a0f;
          padding: 60px 32px;
          background: #070707;
        }

        .rf-features-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .rf-section-comment {
          font-size: 11px;
          color: #1f3f1f;
          margin-bottom: 32px;
          font-family: 'JetBrains Mono', monospace;
        }

        .rf-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #111a11;
          border: 1px solid #111a11;
          border-radius: 6px;
          overflow: hidden;
        }

        @media (max-width: 700px) { .rf-features-grid { grid-template-columns: 1fr; } }

        .rf-feature {
          background: #070707;
          padding: 32px 28px;
          transition: background 0.2s;
        }

        .rf-feature:hover { background: #0a0f0a; }

        .rf-feature-num {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: #1f4a1f;
          letter-spacing: 2px;
          margin-bottom: 16px;
          display: block;
        }

        .rf-feature-title {
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #c4e8c4;
          margin: 0 0 10px 0;
        }

        .rf-feature-body {
          font-size: 12px;
          color: #3a5a3a;
          line-height: 1.8;
          margin: 0;
        }

        .rf-footer {
          border-top: 1px solid #0f1a0f;
          padding: 24px 32px;
          background: #050505;
        }

        .rf-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #2a3a2a;
        }

        .rf-cursor {
          display: inline-block;
          width: 8px; height: 14px;
          background: #22c55e;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
      `}</style>

      <div className="rf-root">
        {/* Nav */}
        <header className="rf-nav">
          <div className="rf-nav-inner">
            <div
              className="rf-logo"
              onClick={() => window.location.href = '/'}
              role="link"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && (window.location.href = '/')}
            >
              Repo<span>/</span>Fit
              <div className="rf-cursor" style={{display:'inline-block',width:8,height:16,verticalAlign:'middle',marginLeft:3}}></div>
            </div>
          </div>
        </header>

        {/* Hero with dot-matrix background */}
        <div className="rf-hero-wrap">
          <main className="rf-main">
            {/* Left */}
            <div>
              <div className="rf-eyebrow">Career Intelligence Tool</div>
              <h1 className="rf-h1">
                Match your code<br/>to your <span className="accent">next_role();</span>
              </h1>
              <p className="rf-body">
                RepoFit scans your GitHub repositories against live job descriptions, returns a compatibility score, and generates ATS-optimized resume bullets. No fluff.
              </p>

              <div style={{marginTop: 32}}>
                <TerminalBoot />
              </div>
            </div>

            {/* Right: Panel */}
            <div className="rf-panel">
              <div className="rf-panel-titlebar">
                <div className="rf-dot rf-dot-red"></div>
                <div className="rf-dot rf-dot-yellow"></div>
                <div className="rf-dot rf-dot-green"></div>
                <span className="rf-panel-title">repofit — analyze.sh</span>
              </div>
              <div className="rf-panel-body">
                <div className="rf-field">
                  <label className="rf-label">
                    <span className="comment">// </span>job_description.txt
                  </label>
                  <textarea
                    className={`rf-textarea${errors.jobDescription ? ' rf-error' : ''}`}
                    placeholder="# Paste full job description here...&#10;# e.g. Senior Frontend Engineer at Vercel&#10;#&#10;# Required: React, TypeScript, Node.js"
                    value={jobDescription}
                    onChange={e => {
                      setJobDescription(e.target.value);
                      if (errors.jobDescription) setErrors(prev => ({...prev, jobDescription: false}));
                    }}
                    disabled={isBusy}
                  />
                  {errors.jobDescription && (
                    <span className="rf-field-error">// field required</span>
                  )}
                </div>

                <div className="rf-row">
                  <div className="rf-field" style={{marginBottom: 0}}>
                    <label className="rf-label">
                      <span className="comment">// </span>github_username
                    </label>
                    <div className="rf-input-wrap">
                      <span className="rf-input-prefix">github.com/</span>
                      <input
                        className={`rf-input${errors.username ? ' rf-error' : ''}`}
                        placeholder="octocat"
                        type="text"
                        value={username}
                        onChange={e => {
                          setUsername(e.target.value);
                          if (errors.username) setErrors(prev => ({...prev, username: false}));
                        }}
                        disabled={isBusy}
                      />
                    </div>
                    {errors.username && (
                      <span className="rf-field-error">// field required</span>
                    )}
                  </div>

                  <div className="rf-field" style={{marginBottom: 0}}>
                    <label className="rf-label" style={{opacity:0}}>run</label>
                    <button
                      className={`rf-btn${btnState === 'running' ? ' rf-btn-running' : btnState === 'done' ? ' rf-btn-done' : ''}`}
                      onClick={handleAnalyzeClick}
                      disabled={isBusy && btnState === 'idle'}
                    >
                      <span className="material-symbols-outlined rf-btn-icon" style={{fontVariationSettings:"'FILL' 1"}}>
                        {btnState === 'done' ? 'check_circle' : btnState === 'running' ? 'sync' : 'terminal'}
                      </span>
                      {btnLabel}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rf-panel-footer">
                <span><span className="rf-status-dot"></span>ENGINE ONLINE</span>
                <span className="rf-trust-signal">
                  <span className="material-symbols-outlined rf-trust-icon" style={{fontVariationSettings:"'FILL' 1", fontSize: 15}}>lock</span>
                  Code analyzed, never stored.
                </span>
              </div>
            </div>
          </main>
        </div>

        {/* Features */}
        <section className="rf-features">
          <div className="rf-features-inner">
            <div className="rf-section-comment">
              {'/**'}<br/>
              {' * How RepoFit works'}<br/>
              {' * @version 2.4.1'}<br/>
              {' */'}
            </div>
            <div className="rf-features-grid">
              <div className="rf-feature">
                <span className="rf-feature-num">01 / PARSE</span>
                <h4 className="rf-feature-title">Semantic Matching</h4>
                <p className="rf-feature-body">Beyond keywords — the model reads intent, seniority signals, and tech stack context within the job post.</p>
              </div>
              <div className="rf-feature">
                <span className="rf-feature-num">02 / SCAN</span>
                <h4 className="rf-feature-title">Repo Synthesis</h4>
                <p className="rf-feature-body">Your GitHub profile is indexed for architectural patterns, language proficiency, and documentation quality.</p>
              </div>
              <div className="rf-feature">
                <span className="rf-feature-num">03 / OUTPUT</span>
                <h4 className="rf-feature-title">Compatibility Score</h4>
                <p className="rf-feature-body">Returns a ranked list of your best-fit repos, missing skills, and ATS-ready bullet points per project.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="rf-footer">
          <div className="rf-footer-inner">
            <span>// RepoFit AI © 2026</span>
            <span>MIT Licensed</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingView;
