import React, { useState } from 'react';
import './HTP.css';
import Characters from './Characters';
import { useGameContext } from '../Context/GameContext';
import { pluralName } from '../game/units.jsx';

// The rules, split into short pages so nothing ever needs scrolling.
function pages(rules) {
  const income = rules ? `$${rules.income}` : 'money';
  const start = rules ? `$${rules.startingMoney}` : 'some money';
  const moves = rules?.movesPerTurn ?? 3;
  const barrier = rules ? `$${rules.costs.B}` : 'a little money';
  const firstTurn = rules?.firstTurnMoves ?? moves;
  const perPiece = rules?.pieceMoveLimit ?? 1;
  const bonus = rules?.secondPlayerBonus ?? 0;
  const anyPieceWins = !rules || !rules.winUnits;
  // e.g. every piece except Goblins scores (Goblins dig and steal gold instead)
  const nonScorers = rules?.winUnits && rules.winUnits.includes('MM') ? ['A', 'P', 'M', 'W', 'N', 'C'].filter((u) => !rules.winUnits.includes(u)) : [];
  // Pieces allowed to move twice a turn, e.g. "MinuteMen and Goblins".
  const twice = Object.entries(rules?.unitMoveLimits ?? { MM: 2 }).filter(([, n]) => n === 2).map(([u]) => pluralName(u));
  const caps = Object.entries(rules?.unitCaps ?? {}).map(([u, n]) => `${n} ${pluralName(u)}`);
  const ABILITY_NAMES = { spread: 'Spread', purify: 'Purify', explosion: 'Explosion!', rise: 'Rise', curse: 'Curse', fortify: 'Fortify' };
  const activeAbilities = Object.keys(ABILITY_NAMES).filter((k) => !rules || rules.costs[k] !== undefined);
  const abilityPrices = rules ? activeAbilities.map((k) => `${ABILITY_NAMES[k]} ${rules.costs[k]}`).join(', ') : null;
  return [
    {
      title: 'How to Play',
      body: (
        <>
          <p>Overlord is a two-player battle. To play a friend, one of you presses <strong>Play Now</strong> with the room box empty, then shares the 4-digit room number (or invite link). The other types it in.</p>
          <h2>How to Win</h2>
          {nonScorers.length ? (
            <p>Get <strong>any one of your pieces</strong> except {nonScorers.map(pluralName).join(' and ')} all the way to the far side of the board. Blue marches right, Orange marches left. Every soldier is a threat - so guard every lane!</p>
          ) : anyPieceWins ? (
            <p>Get <strong>any one of your pieces</strong> all the way to the far side of the board. Blue marches right, Orange marches left. Every piece is a threat - so guard every lane!</p>
          ) : (
            <p>Get a <strong>MinuteMan</strong> all the way to the far side of the board. Blue marches right, Orange marches left. Other pieces can get there too, but only a MinuteMan wins - so protect yours and stop theirs!</p>
          )}
          {rules?.roundLimit ? (
            <p>
              <strong>Time limit:</strong> if nobody has got across after <strong>{rules.roundLimit} rounds</strong>, the game ends and whoever destroyed <strong>more enemy pieces</strong> wins (if that's a tie, whoever has more pieces left).
            </p>
          ) : null}
          <p>
            Everyone starts with {start}
            {bonus > 0 ? <> (Orange gets <strong>${bonus}</strong> extra for going second)</> : null}, and you earn {income} every time you end your turn
            {rules?.killBounty > 0 ? <>, plus <strong>${rules.killBounty}</strong> for every enemy piece you take</> : null}.
          </p>
          {rules?.minerIncome ? <p>Each <strong>Goblin</strong> you have{rules.minerIncomeHome ? ' on your half' : ''} digs up another <strong>${rules.minerIncome}</strong> of gold when you end your turn.</p> : null}
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
              {perPiece === 1 && twice.length ? `, ${twice.join(' and ')} twice)` : perPiece ? ')' : ''}
            </li>
            <li>building or repairing a barrier</li>
          </ul>
          {firstTurn < moves ? <p>Blue goes first, so Blue's very first turn has only <strong>{firstTurn} move{firstTurn === 1 ? '' : 's'}</strong>.</p> : null}
          {rules?.spawnSickness ? <p><strong>Fresh recruits:</strong> a piece you buy can move right away, but it can't capture or shoot until your next turn.</p> : null}
          {rules?.pieceLimit ? (
            <p>
              You can have at most <strong>{rules.pieceLimit} pieces</strong> on the board at once{caps.length ? <>, and at most <strong>{caps.join(' and ')}</strong></> : null}.
            </p>
          ) : null}
          <p>Abilities{rules?.purifyCostsMove ? ' (except Purify)' : ''} and skeleton steps <strong>don't use a move</strong>. When nothing is left to do, your turn ends by itself.</p>
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
          <p><strong>Archers and Wizards</strong> are ranged: they can't move onto an enemy. Instead, every time one moves, it automatically shoots the enemy <strong>directly in front</strong> of the square it lands on. Moves that will shoot someone light up <strong>yellow</strong>. MinuteMen are immune to Wizards' spells, but not to Archers' arrows or a Wizard's Explosion.</p>
        </>
      ),
    },
    {
      title: 'Barriers & Fire',
      body: (
        <>
          <p>A barrier costs {barrier} and is two squares tall: the square you pick and the one above it. Barriers only go in the middle of the board, and can't touch another barrier, fire, or any piece.</p>
          <p>A piece that walks into a barrier destroys it, but is destroyed too - except a <strong>Warden</strong>, which smashes through and survives. Goblins tunnel straight under barriers, unless an enemy Warden is standing right next to that barrier.</p>
          {rules?.barrierLimit ? <p>Each player can have at most <strong>{rules.barrierLimit} barrier squares</strong> on the board (repairs count).</p> : null}
          <p><strong>Fire</strong> works like a barrier, except wizards walk right through it (putting it out), and goblins can't tunnel through it.{rules?.fireTurns ? <> It burns out by itself after <strong>{rules.fireTurns / 2} rounds</strong>.</> : null}</p>
        </>
      ),
    },
    {
      title: 'Abilities',
      body: (
        <>
          <p><strong>Active</strong> abilities ({activeAbilities.map((k) => ABILITY_NAMES[k]).join(', ')}) <strong>cost money</strong> every time you use them, but don't use a move{rules?.purifyCostsMove ? ' (Purify does: it uses one of your moves)' : ''}. You need a character of that type on the board that wasn't bought this turn.</p>
          {abilityPrices && <p>Prices: {abilityPrices}.</p>}
          <p><strong>Passive</strong> abilities (Shield, Burrow{rules?.minerIncome ? ', Gold mine' : ''}, Repair &amp; Reinforce) are always on. See <strong>Characters</strong> for what each one does.</p>
          <p>Open the <strong>Abilities</strong> tab to use one. Squares you can target light up in aqua.</p>
        </>
      ),
    },
    {
      title: 'Good to Know',
      body: (
        <>
          <ul>
            <li>No one to play? <strong>Play Bots</strong> lets you play the computer (Easy to Impossible), or watch two bots play with a bar showing who is winning.</li>
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
