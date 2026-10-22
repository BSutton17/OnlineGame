import { describe, expect, test } from 'vitest';
import { describeEvent, winText } from '../game/messages';

const view = { you: 'blue', players: { blue: { name: 'Ann' }, orange: { name: 'Ben' } } };

describe('describeEvent', () => {
  test('talks about your pieces and theirs', () => {
    expect(describeEvent({ kind: 'killed', owner: 'blue', unit: 'A', how: 'captured' }, view)).toBe('Your Archer was captured');
    expect(describeEvent({ kind: 'killed', owner: 'orange', unit: 'W', how: 'arrow' }, view)).toBe("Ben's Wizard was shot by an arrow");
    expect(describeEvent({ kind: 'ability', side: 'orange', ability: 'explosion' }, view)).toBe('Ben used Explosion!');
  });

  test('shows the kill reward when you take a piece', () => {
    expect(describeEvent({ kind: 'killed', owner: 'orange', unit: 'A', how: 'captured', by: 'blue', bounty: 25 }, view)).toBe("Ben's Archer was captured (+$25)");
    expect(describeEvent({ kind: 'killed', owner: 'blue', unit: 'A', how: 'captured', by: 'orange', bounty: 25 }, view)).toBe('Your Archer was captured');
  });

  test('stays quiet about routine events', () => {
    expect(describeEvent({ kind: 'moved' }, view)).toBe(null);
    expect(describeEvent({ kind: 'autoEndTurn', side: 'orange' }, view)).toBe(null);
  });
});

describe('winText', () => {
  const finished = (winner, winReason, winUnit) => ({ ...view, game: { winner, winReason, winUnit } });
  test('explains how the game ended', () => {
    expect(winText(finished('blue', 'reachedEnd', 'MM'))).toEqual({ title: 'Victory!', detail: 'Your MinuteMan reached the far side of the board!' });
    expect(winText(finished('orange', 'reachedEnd', 'W'))).toEqual({ title: 'Defeat', detail: "Ben's Wizard reached your side of the board." });
    expect(winText(finished('blue', 'reachedEnd')).detail).toBe('Your piece reached the far side of the board!');
    expect(winText(finished('blue', 'forfeit')).detail).toBe('Ben left the game.');
    expect(winText(finished('draw', 'turnLimit')).title).toBe('Draw');
    expect(winText({ ...view, game: { winner: null } })).toBe(null);
  });
});

describe('winText at the round limit', () => {
  const ended = (winner) => ({ ...view, game: { winner, winReason: 'roundLimit', stats: { kills: { blue: 9, orange: 7 } } } });
  test('says who destroyed more pieces', () => {
    expect(winText(ended('blue'))).toEqual({ title: 'Victory!', detail: "Time's up! You destroyed more enemy pieces (9 to 7)." });
    expect(winText(ended('orange')).detail).toBe("Time's up! Ben destroyed more of your pieces (9 to 7).");
    expect(winText(ended('draw')).detail).toBe("Time's up, and it's dead even.");
  });
});
