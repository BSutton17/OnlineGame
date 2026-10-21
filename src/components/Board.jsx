import React, { memo } from 'react';
import { useElementSize } from '../hooks/useElementSize';
import { gridShape, screenPosition, terrainClass, rowOf, colOf } from '../game/board';
import { UNITS, FireIcon, sideName } from '../game/units.jsx';

const MAX_CELL = 84;

function cellClass(content, i) {
  if (content === null) return terrainClass(i);
  if (content.t === 'barrier') return 'box-black';
  if (content.t === 'fire') return terrainClass(i);
  return content.owner === 'blue' ? 'box-blue' : 'box-orange';
}

function describe(content, i) {
  const where = `row ${rowOf(i) + 1}, column ${colOf(i) + 1}`;
  if (content === null) return `Empty square, ${where}`;
  if (content.t !== 'piece') return `${content.t === 'fire' ? 'Fire' : 'Barrier'}, ${where}`;
  return `${sideName(content.owner)} ${UNITS[content.unit].name}${content.cursedUntil != null ? ' (cursed)' : ''}, ${where}`;
}

const Cell = memo(function Cell({ i, content, cls, position, last, canAct, draggable, droppable, handlers }) {
  const Icon = content?.t === 'piece' ? UNITS[content.unit].Icon : content?.t === 'fire' ? FireIcon : null;
  const classes = ['cell', cls, last && 'last-move', canAct && 'can-act'].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={classes}
      style={{ gridRow: position.row, gridColumn: position.col }}
      aria-label={describe(content, i)}
      data-cell={i}
      draggable={draggable}
      onClick={() => handlers.onClick(i)}
      onMouseEnter={() => handlers.onHover(i)}
      onMouseLeave={() => handlers.onHover(null)}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(i));
        e.dataTransfer.effectAllowed = 'move';
        handlers.onDragStart(i);
      }}
      onDragOver={(e) => {
        if (droppable) e.preventDefault();
      }}
      onDragEnter={() => handlers.onHover(i)}
      onDrop={(e) => {
        e.preventDefault();
        handlers.onDrop(i);
      }}
    >
      {/* a cursed piece (Necromancer's Curse) is drawn faded until it can move again */}
      {Icon && <Icon size="60%" style={content.cursedUntil != null ? { opacity: 0.45 } : undefined} />}
    </button>
  );
});

export default function Board({ game, you, layout, targets, preview, actionable, handlers }) {
  const [ref, size] = useElementSize();
  const { cols, rows } = gridShape(layout);
  const gap = layout === 'wide' ? 3 : 2;
  const pad = layout === 'wide' ? 12 : 5;
  const fit = (space, count) => (space - 2 * pad - gap * (count - 1)) / count;
  // Until the space has been measured, draw at a middling size.
  const measured = size.width > 0 && size.height > 0;
  const cell = measured ? Math.max(14, Math.floor(Math.min(fit(size.width, cols), fit(size.height, rows), MAX_CELL))) : 40;
  const last = game.lastAction;
  const lastCells = new Set(last && last.type !== 'endTurn' ? [last.from, last.to].filter((x) => x !== undefined) : []);

  return (
    <div className="board-area" ref={ref}>
      <div
        id="board-box"
        style={{
          '--cell': `${cell}px`,
          gap: `${gap}px`,
          padding: `${pad}px`,
          gridTemplateColumns: `repeat(${cols}, var(--cell))`,
          gridTemplateRows: `repeat(${rows}, var(--cell))`,
        }}
      >
        {game.grid.map((content, i) => {
          const target = targets.get(i);
          return (
            <Cell
              key={i}
              i={i}
              content={content}
              cls={target?.cls || (preview.has(i) ? 'box-aqua' : cellClass(content, i))}
              position={screenPosition(i, layout, you)}
              last={lastCells.has(i)}
              canAct={!target && actionable.has(i)}
              draggable={actionable.has(i)}
              droppable={Boolean(target?.action)}
              handlers={handlers}
            />
          );
        })}
      </div>
    </div>
  );
}
