// Board geometry for drawing. The server owns the rules; these helpers only
// decide colours and where each square goes on screen.

export const ROWS = 9;
export const COLS = 14;

export const rowOf = (i) => Math.floor(i / COLS);
export const colOf = (i) => i % COLS;
export const toIndex = (r, c) => r * COLS + c;

// The background colour class of an empty square (same pattern as the
// original game): checkerboard of white/grey and team colour, with each
// side's back line in its own colour.
export function terrainClass(i) {
  const r = rowOf(i);
  const c = colOf(i);
  if (c === 0) return 'box-purple';
  if (c === COLS - 1) return 'box-red';
  if ((r + c) % 2 === 0) return c < 3 || c > COLS - 4 ? 'box-grey' : 'box-white';
  return c >= COLS / 2 ? 'box-orange' : 'box-blue';
}

// Where square `i` is drawn. In landscape the board is drawn as-is (blue on
// the left). Held upright, it is turned on its side so it fills the phone,
// with your own back line at the bottom.
export function screenPosition(i, layout, you) {
  const r = rowOf(i);
  const c = colOf(i);
  if (layout !== 'portrait') return { row: r + 1, col: c + 1 };
  if (you === 'orange') return { row: c + 1, col: ROWS - r };
  return { row: COLS - c, col: r + 1 };
}

export const gridShape = (layout) => (layout === 'portrait' ? { cols: ROWS, rows: COLS } : { cols: COLS, rows: ROWS });

// The board shows barriers as two squares: the chosen one and the one above.
export const barrierFootprint = (i) => [i, i - COLS];
