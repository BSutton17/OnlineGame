import React, { useState } from 'react';

// Bot difficulties (the server decides what they really do; see the
// server's src/bots/levels.js). "Looks N turns ahead" = search depth.
export const BOT_LEVELS = [
  { key: 'easy', name: 'Easy', ahead: 1 },
  { key: 'medium', name: 'Medium', ahead: 3 },
  { key: 'hard', name: 'Hard', ahead: 5 },
  { key: 'impossible', name: 'Impossible', ahead: 7 },
];

function LevelPicker({ label, value, onChange }) {
  return (
    <label className="bot-picker">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {BOT_LEVELS.map((l) => (
          <option key={l.key} value={l.key}>
            {l.name} (looks {l.ahead} turn{l.ahead === 1 ? '' : 's'} ahead)
          </option>
        ))}
      </select>
    </label>
  );
}

// "Play a bot" or "watch two bots", shown inside the main menu box.
export default function BotMenu({ busy, notice, onStart, onBack }) {
  const [mode, setMode] = useState('solo');
  const [level, setLevel] = useState('medium');
  const [side, setSide] = useState('blue');
  const [blueLevel, setBlueLevel] = useState('medium');
  const [orangeLevel, setOrangeLevel] = useState('hard');

  const start = () => onStart(mode === 'solo' ? { mode, level, side } : { mode, blueLevel, orangeLevel });
  return (
    <>
      <div className="menu-buttons">
        <button type="button" className="infoButton" aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>
          Play a Bot
        </button>
        <button type="button" className="infoButton" aria-pressed={mode === 'watch'} onClick={() => setMode('watch')}>
          Watch Bots
        </button>
      </div>
      {mode === 'solo' ? (
        <>
          <LevelPicker label="Difficulty" value={level} onChange={setLevel} />
          <label className="bot-picker">
            <span>Play as</span>
            <select value={side} onChange={(e) => setSide(e.target.value)} aria-label="Play as">
              <option value="blue">Blue (moves first)</option>
              <option value="orange">Orange</option>
            </select>
          </label>
        </>
      ) : (
        <>
          <LevelPicker label="Blue bot" value={blueLevel} onChange={setBlueLevel} />
          <LevelPicker label="Orange bot" value={orangeLevel} onChange={setOrangeLevel} />
        </>
      )}
      <p className="menu-note" role="status">
        {notice ||
          (mode === 'solo'
            ? 'Deeper bots take longer to think (up to a minute a turn).'
            : 'Watch two bots play, with a bar showing who is winning and their top 3 moves.')}
      </p>
      <div className="menu-buttons">
        <button type="button" className="infoButton" disabled={busy} onClick={start}>
          {busy ? 'Starting…' : 'Start'}
        </button>
        <button type="button" className="infoButton" onClick={onBack}>
          Back
        </button>
      </div>
    </>
  );
}
