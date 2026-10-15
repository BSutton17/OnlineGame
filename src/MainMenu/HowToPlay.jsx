import React, { useState } from 'react';
import './HTP.css';
import Characters from './Characters';
import { useGameContext } from '../Context/GameContext';

// The rules, split into short pages so nothing ever needs scrolling.
function pages(rules) {
  const income = rules ? `$${rules.income}` : 'money';
  const start = rules ? `$${rules.startingMoney}` : 'some money';
  const moves = rules?.movesPerTurn ?? 3;
  const barrier = rules ? `$${rules.costs.B}` : 'a little money';
  const firstTurn = rules?.firstTurnMoves ?? 1;
  const perPiece = rules?.pieceMoveLimit ?? 1;
  const mmLimit = rules?.unitMoveLimits?.MM ?? 2;
  const abilityPrices = rules
    ? `Spread $${rules.costs.spread}, Purify $${rules.costs.purify}, Explosion! $${rules.costs.explosion}, Rise $${rules.costs.rise}`
    : null;
  return [
    {
      title: 'How to Play',
      body: (
        <>
          <p>Overlord is a two-player battle. To play a friend, one of you presses <strong>Play Now</strong> with the room box empty, then shares the 4-digit room number (or invite link). The other types it in.</p>
          <h2>How to Win</h2>
          <p>Get a <strong>MinuteMan</strong> all the way to the far side of the board. Blue marches right, Orange marches left. Other pieces can get there too, but only a MinuteMan wins - so protect yours and stop theirs!</p>
          <p>
            Everyone starts with {start}, and you earn {income} every time you end your turn
            {rules?.killBounty > 0 ? <>, plus <strong>${rules.killBounty}</strong> for every enemy piece you take</> : null}.
          </p>
        </>
      ),
    },
    {
      title: 'Your Turn',
      body: (
        <>
          <p>You get <strong>{moves} moves</strong> each turn. Each of these uses one move:</p>
          <ul>
            <li>buying a character and placing it on a grey square on your side</li>
            <li>
              moving a piece
              {perPiece === 1 ? ' (each piece can move once a turn' : perPiece ? ` (one piece can move at most ${perPiece} times a turn` : ''}
              {perPiece && mmLimit && mmLimit !== perPiece ? `, MinuteMen ${mmLimit === 2 ? 'twice' : `${mmLimit} times`})` : perPiece ? ')' : ''}
            </li>
            <li>building or repairing a barrier</li>
          </ul>
          <p>Blue goes first, so Blue's very first turn has only <strong>{firstTurn} move{firstTurn === 1 ? '' : 's'}</strong>.</p>
          {rules?.pieceLimit ? <p>You can have at most <strong>{rules.pieceLimit} pieces</strong> on the board at once.</p> : null}
          <p>Abilities and skeleton steps <strong>don't use a move</strong>. When nothing is left to do, your turn ends by itself.</p>
        </>
      ),
    },
    {
      title: 'Moving',
      body: (
        <>
          <p>Tap a piece (or drag it). <strong>Green</strong> squares are where it can go. <strong>Dark green</strong> squares are farther away and only open if the way there is clear - nothing can jump over allies, enemies or barriers, and no move can cross a barrier, not even by cutting round its corner.</p>
          <p>Every piece except the MinuteMan can also step <strong>one square straight back</strong>. A step back uses one of your moves, but that piece <strong>can still move again</strong> the same turn.</p>
          <p><strong>Melee</strong> pieces capture an enemy by moving onto it.</p>
          <p><strong>Archers and Wizards</strong> are ranged: they can't move onto an enemy. Instead, every time one moves, it automatically shoots the enemy <strong>directly in front</strong> of the square it lands on. Moves that will shoot someone light up <strong>yellow</strong>. MinuteMen are immune to arrows and spells.</p>
        </>
      ),
    },
    {
      title: 'Barriers & Fire',
      body: (
        <>
          <p>A barrier costs {barrier} and is two squares tall: the square you pick and the one above it. Barriers only go in the middle of the board, and can't touch another barrier, fire, or any piece.</p>
          <p>A piece that walks into a barrier destroys it, but is destroyed too - except a <strong>Carpenter</strong>, which smashes through and survives. Miners tunnel straight under barriers, unless an enemy Carpenter is standing right next to that barrier.</p>
          {rules?.barrierLimit ? <p>Each player can have at most <strong>{rules.barrierLimit} barrier squares</strong> on the board (repairs count).</p> : null}
          <p><strong>Fire</strong> works like a barrier, except wizards walk right through it (putting it out), and miners can't tunnel through it.</p>
        </>
      ),
    },
    {
      title: 'Abilities',
      body: (
        <>
          <p><strong>Active</strong> abilities (Spread, Purify, Explosion!, Rise) <strong>cost money</strong> every time you use them, but don't use a move. You need a character of that type on the board that wasn't bought this turn.</p>
          {abilityPrices && <p>Prices: {abilityPrices}.</p>}
          <p><strong>Passive</strong> abilities (Shield, Burrow, Repair &amp; Reinforce) are always on.</p>
          <p>Open the <strong>Abilities</strong> tab to use one. Squares you can target light up in aqua.</p>
        </>
      ),
    },
    {
      title: 'Good to Know',
      body: (
        <>
          <ul>
            <li>Press <strong>Esc</strong> or tap an empty square to cancel a selection.</li>
            <li>Pieces you can still use have a white outline.</li>
            <li>On a phone, hold it sideways or upright - both work. Upright, your side is at the bottom.</li>
            <li>Refreshed by accident? You'll drop right back into your game.</li>
            <li>If your opponent loses connection, they get 60 seconds to come back before you win.</li>
          </ul>
        </>
      ),
    },
  ];
}

export default function HowToPlay({ onBack }) {
  const { rules } = useGameContext();
  const [showChar, setShowChar] = useState(false);
  const [page, setPage] = useState(0);
  const all = pages(rules);

  if (showChar) return <Characters rules={rules} onBack={() => setShowChar(false)} />;
  const current = all[page];

  return (
    <div className="rules-screen">
      <div id="how-to-play" className="rules-panel">
        <h1>{current.title}</h1>
        <div className="rules-body">{current.body}</div>
        <div className="pager">
          <button type="button" className="infoButton" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Back
          </button>
          <span className="pager-dots">
            {all.map((p, k) => (
              <button key={p.title} type="button" aria-label={p.title} className={k === page ? 'dot on' : 'dot'} onClick={() => setPage(k)} />
            ))}
          </span>
          <button type="button" className="infoButton" disabled={page === all.length - 1} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
        <div className="menu-buttons">
          <button type="button" className="infoButton" onClick={() => setShowChar(true)}>
            View Characters
          </button>
          <button type="button" className="infoButton" onClick={onBack}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
