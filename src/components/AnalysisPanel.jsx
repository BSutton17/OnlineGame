import React from 'react';
import { sideName } from '../game/units.jsx';

// "+1.25" / "-0.40": the engine's score from Blue's side (positive = Blue is
// better). The server caps a forced win at ±99, shown as who wins.
const signed = (x) => (x >= 99 ? 'Blue wins' : x <= -99 ? 'Orange wins' : x > 0 ? `+${x.toFixed(2)}` : x.toFixed(2));
const percent = (p) => Math.round(p * 100);

// Shown instead of the shop when two bots play each other: an eval bar
// (who is winning, by the engine) and the top 3 turns it considered.
export default function AnalysisPanel({ analysis, thinking, players, current }) {
  const blue = analysis ? percent(analysis.blueChance) : 50;
  const thinker = players[current]?.name || 'The bot';
  return (
    <div className="analysis tray" aria-live="polite">
      <div className="eval-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={blue} aria-label={`Blue's chance of winning: ${blue}%`}>
        <div className="eval-side box-blue" style={{ width: `${blue}%` }}>
          {blue >= 15 ? `${blue}%` : ''}
        </div>
        <div className="eval-side box-orange" style={{ width: `${100 - blue}%` }}>
          {100 - blue >= 15 ? `${100 - blue}%` : ''}
        </div>
      </div>
      {analysis ? (
        <>
          <p className="eval-line">
            {analysis.eval !== undefined && <strong>{signed(analysis.eval)}</strong>} · {analysis.level} bot ({sideName(analysis.side)}) looked {analysis.depth}{' '}
            turn{analysis.depth === 1 ? '' : 's'} ahead
          </p>
          <ol className="top-moves">
            {analysis.top.map((m, i) => (
              <li key={i} className={m.text === analysis.chosen ? 'chosen' : undefined} title={m.text}>
                <span className="move-eval">{signed(m.eval)}</span> {m.text}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="eval-line">The engine's view appears after the first move.</p>
      )}
      {thinking && <p className="eval-line thinking">{thinker} is thinking…</p>}
    </div>
  );
}
