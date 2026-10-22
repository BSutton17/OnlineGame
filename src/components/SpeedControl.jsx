import React, { useEffect, useRef, useState } from 'react';

const SPEED_KEY = 'overlord.watchDelay';

const remembered = () => {
  try {
    const ms = Number(localStorage.getItem(SPEED_KEY));
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  } catch {
    return null;
  }
};

const remember = (ms) => {
  try {
    localStorage.setItem(SPEED_KEY, String(ms));
  } catch {
    // not important
  }
};

// Watching two bots: how fast their moves are shown. All the way right is
// full speed (the normal pause between moves); further left pauses longer.
// The bots still think just as fast - only the showing slows down.
export default function SpeedControl({ moveDelay, onChange }) {
  const { ms, fastest, slowest } = moveDelay;
  const [value, setValue] = useState(ms);
  const timer = useRef(null);
  const span = Math.max(1, slowest - fastest);

  // follow the server's value (e.g. when the game restarts)
  useEffect(() => setValue(ms), [ms]);

  // a new watch game starts at the speed this viewer picked last time
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    const saved = remembered();
    if (saved && saved !== ms) onChange(Math.max(fastest, Math.min(slowest, saved)));
  }, [ms, fastest, slowest, onChange]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const position = Math.round((100 * (slowest - value)) / span);
  const pick = (e) => {
    const next = Math.round(slowest - (Number(e.target.value) / 100) * span);
    setValue(next);
    remember(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), 150); // (one request when the slider stops)
  };
  const label = value <= fastest ? 'Full speed' : `${(value / 1000).toFixed(1)} s a move`;

  return (
    <div className="speed-control">
      <label htmlFor="watch-speed">Speed</label>
      <input
        id="watch-speed"
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={pick}
        aria-valuetext={label}
      />
      <span className="speed-value">{label}</span>
    </div>
  );
}
