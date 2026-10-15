// Turns the server's flat list of legal actions into quick lookups for the
// UI, and works out which squares to light up for whatever is selected.

export function groupLegal(actions = []) {
  const g = {
    byFrom: new Map(), // square -> moves and arrows for the piece standing there
    spawn: new Map(), // unit -> [actions]
    barrier: [],
    repair: [],
    arrow: [],
    spread: [],
    explosion: [],
    rise: [],
    purify: null,
    endTurn: null,
    count: actions.length,
  };
  for (const a of actions) {
    switch (a.type) {
      case 'spawn':
        if (!g.spawn.has(a.unit)) g.spawn.set(a.unit, []);
        g.spawn.get(a.unit).push(a);
        break;
      case 'move':
      case 'arrow':
        if (!g.byFrom.has(a.from)) g.byFrom.set(a.from, []);
        g.byFrom.get(a.from).push(a);
        if (a.type === 'arrow') g.arrow.push(a);
        break;
      case 'barrier':
      case 'repair':
      case 'spread':
      case 'explosion':
      case 'rise':
        g[a.type].push(a);
        break;
      case 'purify':
        g.purify = a;
        break;
      case 'endTurn':
        g.endTurn = a;
        break;
      default:
        break;
    }
  }
  return g;
}

// Is a given ability usable right now?
export function abilityReady(key, legal) {
  if (key === 'purify') return Boolean(legal.purify);
  return (legal[key] || []).length > 0;
}

// `selection` is one of:
//   { kind: 'piece', at }        a piece on the board
//   { kind: 'spawn', unit }      a unit from the shop (or 'B' for a barrier)
//   { kind: <ability key> }      an ability tile
// Returns Map(square -> { cls, action }), where `action` is what clicking
// (or dropping on) that square does.
export function targetsFor(selection, legal) {
  const out = new Map();
  if (!selection) return out;
  const add = (at, cls, action) => {
    if (!out.has(at)) out.set(at, { cls, action });
  };

  switch (selection.kind) {
    case 'piece': {
      for (const a of legal.byFrom.get(selection.at) || []) {
        // Yellow: a move that also shoots someone (archers and wizards).
        if (a.type === 'arrow' || a.shoots !== undefined) add(a.to, 'box-yellow', a);
        else add(a.to, a.far ? 'box-dark-green' : 'box-green', a);
      }
      out.set(selection.at, { cls: 'box-green', action: null });
      break;
    }
    case 'spawn':
      if (selection.unit === 'B') for (const a of legal.barrier) add(a.to, 'box-green', a);
      else for (const a of legal.spawn.get(selection.unit) || []) add(a.to, 'box-green', a);
      break;
    case 'arrow':
      for (const a of legal.arrow) add(a.to, 'box-yellow', a);
      break;
    case 'spread':
    case 'repair':
      for (const a of legal[selection.kind]) add(a.to, 'box-aqua', a);
      break;
    case 'explosion':
    case 'rise':
      for (const a of legal[selection.kind]) add(a.from, 'box-aqua', a);
      break;
    default:
      break;
  }
  return out;
}

// Pieces you can do something with this turn (used to hint at them).
export const actionablePieces = (legal) => new Set(legal.byFrom.keys());
