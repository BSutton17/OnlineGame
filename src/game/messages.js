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

const ABILITY = { spread: 'Spread', purify: 'Purify', explosion: 'Explosion!', rise: 'Rise' };

export function describeEvent(event, view) {
  const owner = (side) => (side === view.you ? 'Your' : `${view.players[side]?.name || 'Opponent'}'s`);
  const who = (side) => (side === view.you ? 'You' : view.players[side]?.name || 'Opponent');
  switch (event.kind) {
    case 'killed': {
      const text = `${owner(event.owner)} ${UNITS[event.unit]?.name || 'piece'} ${HOW[event.how] || 'was destroyed'}`;
      return event.bounty > 0 && event.by === view.you ? `${text} (+$${event.bounty})` : text;
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
  if (game.winner === 'draw') return { title: 'Draw', detail: 'The turn limit was reached.' };
  const youWon = game.winner === view.you;
  const loser = view.players[game.winner === 'blue' ? 'orange' : 'blue']?.name || 'Your opponent';
  const winner = view.players[game.winner]?.name || 'Your opponent';
  const piece = UNITS[game.winUnit]?.name || 'piece';
  const detail = {
    reachedEnd: youWon ? `Your ${piece} reached the far side of the board!` : `${winner}'s ${piece} reached your side of the board.`,
    resigned: youWon ? `${loser} resigned.` : 'You resigned.',
    forfeit: youWon ? `${loser} left the game.` : 'You were away too long.',
  }[game.winReason];
  return { title: youWon ? 'Victory!' : 'Defeat', detail };
}
