import React from 'react';
import { UNITS, SHOP } from './game/units.jsx';
import { GiBrickWall } from 'react-icons/gi';

function ShopTile({ color, unit, name, price, Icon, enabled, selected, why, onSelect }) {
  const classes = [color, 'tile', selected && 'selected', !enabled && 'disabled'].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={classes}
      draggable={enabled}
      aria-pressed={selected}
      aria-disabled={!enabled}
      title={why}
      onClick={() => enabled && onSelect({ kind: 'spawn', unit })}
      onDragStart={(e) => {
        if (!enabled) return e.preventDefault();
        e.dataTransfer.setData('text/plain', unit);
        onSelect({ kind: 'spawn', unit });
      }}
    >
      <Icon className="tile-icon" />
      <h1>{name}</h1>
      <h2>${price}</h2>
    </button>
  );
}

export default function Inventory({ color, costs, money, legal, yourTurn, movesLeft, limits, selection, onSelect, onToggle, onEndTurn }) {
  const reason = (unit, canDo) => {
    if (canDo) return unit === 'B' ? 'Barrier: blocks two squares. Click, then pick a green square.' : `${UNITS[unit].blurb} ${UNITS[unit].moves}`;
    if (!yourTurn) return 'Wait for your turn';
    if (movesLeft <= 0) return 'Out of moves';
    if (costs[unit] > money) return `Need $${costs[unit]}`;
    if (unit !== 'B' && limits?.pieces >= limits?.pieceLimit) return `Piece limit reached (${limits.pieceLimit})`;
    if (unit === 'B' && limits?.barriers + 2 > limits?.barrierLimit) return `Barrier limit reached (${limits.barrierLimit} squares)`;
    return unit === 'B' ? 'No room for a barrier right now' : 'No free square to place it';
  };
  const isSelected = (unit) => selection?.kind === 'spawn' && selection.unit === unit;

  return (
    <div id="inventory" className="tray">
      <button type="button" className="change" onClick={onToggle}>
        Abilities
      </button>
      {SHOP.map((unit) => {
        const canDo = legal.spawn.has(unit);
        return (
          <ShopTile
            key={unit}
            color={color}
            unit={unit}
            name={UNITS[unit].name}
            price={costs[unit]}
            Icon={UNITS[unit].Icon}
            enabled={canDo}
            selected={isSelected(unit)}
            why={reason(unit, canDo)}
            onSelect={onSelect}
          />
        );
      })}
      <ShopTile
        color={color}
        unit="B"
        name="Barrier"
        price={costs.B}
        Icon={GiBrickWall}
        enabled={legal.barrier.length > 0}
        selected={isSelected('B')}
        why={reason('B', legal.barrier.length > 0)}
        onSelect={onSelect}
      />
      <EndTurnButton yourTurn={yourTurn} movesLeft={movesLeft} onEndTurn={onEndTurn} />
    </div>
  );
}

export function EndTurnButton({ yourTurn, movesLeft, onEndTurn }) {
  return (
    <button
      type="button"
      className={`change end-turn${yourTurn && movesLeft === 0 ? ' pulse' : ''}`}
      disabled={!yourTurn}
      onClick={onEndTurn}
    >
      End Turn
    </button>
  );
}
