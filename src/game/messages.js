// Turns server events into short sentences for the toast messages.
import { UNITS } from './units.jsx';

const HOW = {
  captured: 'was captured',
  arrow: 'was shot by an arrow',
  spell: 'was hit by a spell',
  exploded: 'was caught in an explosion',
  purified: 'was purified',
  sacrificed: 'smashed through a barrier',
  burned: 'walked into fire',
};

const ABILITY = { spread: 'Spread', purify: 'Purify', explosion: 'Explosion!', rise: 'Rise', curse: 'Curse' };

export function describeEvent(event, view) {
  const mine = (side) => side === view.you && !view.spectator;
  const owner = (side) => (mine(side) ? 'Your' : `${view.players[side]?.name || 'Opponent'}'s`);
  const who = (side) => (mine(side) ? 'You' : view.players[side]?.name || 'Opponent');
  switch (event.kind) {
    case 'killed': {
      const text = `${owner(event.owner)} ${UNITS[event.unit]?.name || 'piece'} ${HOW[event.how] || 'was destroyed'}`;
      return event.bounty > 0 && mine(event.by) ? `${text} (+$${event.bounty})` : text;
    }
    case 'ability':
      return `${who(event.side)} used ${ABILITY[event.ability]}`;
    case 'autoEndTurn':
      return event.side === view.you ? 'Nothing left to do - turn ended' : null;
    default:
      return null;
  }
}

export function winText(view) {
  const { game } = view;
  if (!game || !game.winner) return null;
  if (game.winner === 'draw') return { title: 'Draw', detail: game.winReason === 'roundLimit' ? "Time's up, and it's dead even." : 'The turn limit was reached.' };
  if (view.spectator) {
    // watching two bots: say who won, not "Victory" or "Defeat"
    const name = view.players[game.winner]?.name || 'A bot';
    const piece = UNITS[game.winUnit]?.name || 'piece';
    const k = game.stats?.kills;
    const detail = {
      reachedEnd: `${name}'s ${piece} reached the far side.`,
      roundLimit: `Time's up: ${name} destroyed more pieces${k ? ` (${k[game.winner]} to ${k[game.winner === 'blue' ? 'orange' : 'blue']})` : ''}.`,
    }[game.winReason] || '';
    return { title: `${game.winner === 'blue' ? 'Blue' : 'Orange'} wins!`, detail };
  }
  const youWon = game.winner === view.you;
  const loser = view.players[game.winner === 'blue' ? 'orange' : 'blue']?.name || 'Your opponent';
  const winner = view.players[game.winner]?.name || 'Your opponent';
  const piece = UNITS[game.winUnit]?.name || 'piece';
  const detail = {
    reachedEnd: youWon ? `Your ${piece} reached the far side of the board!` : `${winner}'s ${piece} reached your side of the board.`,
    resigned: youWon ? `${loser} resigned.` : 'You resigned.',
    forfeit: youWon ? `${loser} left the game.` : 'You were away too long.',
    roundLimit: (() => {
      const k = game.stats?.kills;
      const mine = k ? k[view.you] : null;
      const theirs = k ? k[view.you === 'blue' ? 'orange' : 'blue'] : null;
      const tally = k ? ` (${mine} to ${theirs})` : '';
      return youWon ? `Time's up! You destroyed more enemy pieces${tally}.` : `Time's up! ${winner} destroyed more of your pieces${tally}.`;
    })(),
  }[game.winReason];
  return { title: youWon ? 'Victory!' : 'Defeat', detail };
}
