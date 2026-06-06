import { useState, useEffect } from 'react';

const TERMINAL_LINES = [
  '> Initializing RepoFit AI engine...',
  '> Loading semantic analysis model...',
  '> Scanning repository architecture...',
  '> Parsing job description keywords...',
  '> Calculating compatibility vectors...',
  '> Generating resume bullet points...',
  '> Analysis complete. Ready.',
];

const FULL_TEXT = TERMINAL_LINES.join('\n');
const CHAR_DELAY = 22;

function TerminalBoot() {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timer;
    let pauseTimer;

    const startTyping = () => {
      let idx = 0;
      setDisplayed('');
      setDone(false);

      timer = setInterval(() => {
        idx++;
        setDisplayed(FULL_TEXT.slice(0, idx));
        if (idx >= FULL_TEXT.length) {
          clearInterval(timer);
          setDone(true);
          pauseTimer = setTimeout(() => {
            startTyping();
          }, 3000);
        }
      }, CHAR_DELAY);
    };

    startTyping();

    return () => {
      clearInterval(timer);
      clearTimeout(pauseTimer);
    };
  }, []);

  const renderedLines = displayed.split('\n');

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      background: '#0a0a0a',
      border: '1px solid #1a3a1a',
      borderRadius: 8,
      padding: '16px 20px',
      fontSize: 13,
      color: '#22c55e',
      minHeight: 148,
      lineHeight: 1.9,
      boxShadow: '0 0 24px rgba(34,197,94,0.08)',
    }}>
      <div style={{ color: '#333', marginBottom: 8, fontSize: 10 }}>// repofit-engine v2.4.1</div>
      {renderedLines.map((line, i) => {
        if (!line) return <div key={i} style={{height: '1.9em'}} />;
        const parts = line.split(' ');
        const prefix = parts[0] || '';
        const rest = parts.slice(1).join(' ');
        return (
          <div key={i}>
            <span style={{ color: '#16a34a' }}>{prefix}</span>
            {rest && <span style={{ color: '#86efac' }}> {rest}</span>}
          </div>
        );
      })}
      {!done && (
        <span style={{ color: '#22c55e', animation: 'blink 1s step-end infinite', marginLeft: 1 }}>█</span>
      )}
    </div>
  );
}

export default TerminalBoot;
