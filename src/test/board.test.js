import { describe, expect, test } from 'vitest';
import { terrainClass, screenPosition, gridShape, toIndex, ROWS, COLS } from '../game/board';

// The colouring function from the original App.js, copied verbatim, so we can
// prove the board still looks exactly the same.
const determineBackground = (i, j, content) => {
  let className = '';
  if (content === 'B') {
    className = 'box-black';
    return className;
  } else {
    if (i % 2 === 0) {
      className = j % 2 === 0 ? ((j < 3 || j > 10) ? 'box-grey' : 'box-white') : (j > 14 / 2 - 1 ? 'box-orange' : 'box-blue');
    } else {
      className = j % 2 === 1 ? ((j < 3 || j > 10) ? 'box-grey' : 'box-white') : (j > 14 / 2 - 1 ? 'box-orange' : 'box-blue');
    }
    if (j === 0) {
      className = 'box-purple';
    } else if (j === 13) {
      className = 'box-red';
    }
  }
  return className;
};

describe('terrain colours', () => {
  test('match the original game on every square', () => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) expect(terrainClass(toIndex(r, c))).toBe(determineBackground(r, c));
    }
  });
});

describe('screen positions', () => {
  for (const [layout, you] of [['wide', 'blue'], ['compact', 'orange'], ['portrait', 'blue'], ['portrait', 'orange']]) {
    test(`${layout} for ${you} puts every square in its own spot inside the grid`, () => {
      const { rows, cols } = gridShape(layout);
      const seen = new Set();
      for (let i = 0; i < ROWS * COLS; i++) {
        const { row, col } = screenPosition(i, layout, you);
        expect(row).toBeGreaterThanOrEqual(1);
        expect(row).toBeLessThanOrEqual(rows);
        expect(col).toBeGreaterThanOrEqual(1);
        expect(col).toBeLessThanOrEqual(cols);
        seen.add(`${row},${col}`);
      }
      expect(seen.size).toBe(ROWS * COLS);
    });
  }

  test('held upright, your own back line is at the bottom and forward points up', () => {
    expect(screenPosition(toIndex(4, 0), 'portrait', 'blue').row).toBe(COLS);
    expect(screenPosition(toIndex(4, COLS - 1), 'portrait', 'orange').row).toBe(COLS);
    expect(screenPosition(toIndex(4, 5), 'portrait', 'blue').row).toBeLessThan(screenPosition(toIndex(4, 4), 'portrait', 'blue').row);
    expect(screenPosition(toIndex(4, 8), 'portrait', 'orange').row).toBeLessThan(screenPosition(toIndex(4, 9), 'portrait', 'orange').row);
  });

  test('sideways, the board is drawn as-is', () => {
    expect(screenPosition(toIndex(2, 7), 'wide', 'orange')).toEqual({ row: 3, col: 8 });
  });
});
