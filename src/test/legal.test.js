import { describe, expect, test } from 'vitest';
import { groupLegal, targetsFor, abilityReady } from '../game/legal';

const actions = [
  { type: 'spawn', unit: 'MM', to: 16 },
  { type: 'spawn', unit: 'MM', to: 2 },
  { type: 'move', from: 60, to: 61, far: false, kind: 'move' },
  { type: 'move', from: 60, to: 62, far: true, kind: 'move' },
  { type: 'move', from: 60, to: 75, far: false, kind: 'move', shoots: 76 },
  { type: 'barrier', to: 33 },
  { type: 'repair', from: 50, to: 51 },
  { type: 'explosion', from: 90 },
  { type: 'purify', from: 3 },
  { type: 'endTurn' },
];

describe('groupLegal', () => {
  const g = groupLegal(actions);
  test('sorts actions by what they are for', () => {
    expect(g.spawn.get('MM').map((a) => a.to)).toEqual([16, 2]);
    expect(g.byFrom.get(60)).toHaveLength(3);
    expect(g.barrier).toHaveLength(1);
    expect(g.purify).toEqual([{ type: 'purify', from: 3 }]);
    expect(g.endTurn).toEqual({ type: 'endTurn' });
  });

  test('knows which abilities are ready', () => {
    expect(abilityReady('purify', g)).toBe(true);
    expect(abilityReady('explosion', g)).toBe(true);
    expect(abilityReady('rise', g)).toBe(false);
  });

  test('copes with an empty list (not your turn)', () => {
    const empty = groupLegal([]);
    expect(empty.byFrom.size).toBe(0);
    expect(targetsFor({ kind: 'piece', at: 60 }, empty).get(60).action).toBe(null);
  });
});

describe('targetsFor', () => {
  const g = groupLegal(actions);
  test('a selected piece lights up green, dark green, and yellow for a move that shoots', () => {
    const t = targetsFor({ kind: 'piece', at: 60 }, g);
    expect(t.get(61).cls).toBe('box-green');
    expect(t.get(62).cls).toBe('box-dark-green');
    expect(t.get(75).cls).toBe('box-yellow');
    expect(t.get(75).action.shoots).toBe(76);
    expect(t.get(60)).toEqual({ cls: 'box-green', action: null });
  });

  test('a shop unit lights up its spawn squares, a barrier its build squares', () => {
    expect([...targetsFor({ kind: 'spawn', unit: 'MM' }, g).keys()]).toEqual([16, 2]);
    expect([...targetsFor({ kind: 'spawn', unit: 'B' }, g).keys()]).toEqual([33]);
    expect(targetsFor({ kind: 'spawn', unit: 'P' }, g).size).toBe(0);
  });

  test('abilities light up aqua: targets for repair, the caster for explosion', () => {
    expect(targetsFor({ kind: 'repair' }, g).get(51).cls).toBe('box-aqua');
    expect(targetsFor({ kind: 'explosion' }, g).get(90).action).toEqual({ type: 'explosion', from: 90 });
  });

  test('nothing selected means nothing lit', () => {
    expect(targetsFor(null, g).size).toBe(0);
  });
});

describe('piece jobs (Fortify, Curse, a Purify per priest)', () => {
  const g = groupLegal([
    { type: 'fortify', from: 40, to: 41 },
    { type: 'curse', from: 50, to: 52 },
    { type: 'purify', from: 3 },
    { type: 'purify', from: 7 },
  ]);
  test('each is ready and lights up its targets (squares to build or curse, priests to pick)', () => {
    expect(abilityReady('fortify', g)).toBe(true);
    expect(abilityReady('curse', g)).toBe(true);
    expect(targetsFor({ kind: 'fortify' }, g).get(41).action).toEqual({ type: 'fortify', from: 40, to: 41 });
    expect(targetsFor({ kind: 'curse' }, g).get(52).cls).toBe('box-aqua');
    expect([...targetsFor({ kind: 'purify' }, g).keys()]).toEqual([3, 7]);
  });
});
