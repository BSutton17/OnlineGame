import React from 'react';
import { ABILITIES, UNITS } from './game/units.jsx';
import { abilityReady } from './game/legal';
import { EndTurnButton } from './Inventory';

export default function Abilities({ color, legal, costs, money, yourTurn, movesLeft, selection, onSelect, onUse, onToggle, onEndTurn }) {
  return (
    <div id="inventory" className="tray">
      <button type="button" className="change" onClick={onToggle}>
        Inventory
      </button>
      {ABILITIES.map((ability) => {
        const price = ability.paid ? costs[ability.key] : null;
        const ready = yourTurn && abilityReady(ability.key, legal);
        const status = ready ? 'Ready' : price !== null && price > money ? `Need $${price}` : 'Not ready';
        const selected = selection?.kind === ability.key;
        const classes = [color, 'tile', selected && 'selected', !ready && 'disabled'].filter(Boolean).join(' ');
        const Icon = UNITS[ability.unit].Icon;
        const pick = () => {
          if (!ready) return;
          // Purify has no target, so it happens straight away.
          if (ability.key === 'purify') onUse(legal.purify);
          else onSelect({ kind: ability.key });
        };
        return (
          <button
            key={ability.key}
            type="button"
            className={classes}
            draggable={ready && ability.key !== 'purify'}
            aria-pressed={selected}
            aria-disabled={!ready}
            title={ability.hint}
            onClick={pick}
            onDragStart={(e) => {
              if (!ready) return e.preventDefault();
              e.dataTransfer.setData('text/plain', ability.key);
              onSelect({ kind: ability.key });
            }}
          >
            <Icon className="tile-icon" />
            <h1>{ability.title}</h1>
            <h2>
              {ability.name}
              {price !== null && ` $${price}`}
            </h2>
            <span className="tile-status">{status}</span>
          </button>
        );
      })}
      <EndTurnButton yourTurn={yourTurn} movesLeft={movesLeft} onEndTurn={onEndTurn} />
    </div>
  );
}
