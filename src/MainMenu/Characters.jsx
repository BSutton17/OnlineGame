import React, { useState } from 'react';
import { UNITS } from '../game/units.jsx';
import './HTP.css';

const ORDER = ['MM', 'A', 'P', 'M', 'W', 'N', 'C', 'S'];

export default function Characters({ rules, onBack }) {
  const [picked, setPicked] = useState('MM');
  const unit = UNITS[picked];
  const price = (key) => (key === 'S' ? 'Raised' : rules ? `$${rules.costs[key]}` : '');
  const ABILITY_OF = { A: 'spread', P: 'purify', W: 'explosion', N: 'rise' };
  const abilityPrice = (key) => (rules && ABILITY_OF[key] ? `$${rules.costs[ABILITY_OF[key]]} each use` : null);

  return (
    <div className="rules-screen">
      <div id="characters" className="rules-panel">
        <h1>Characters</h1>
        <div className="character-grid">
          {ORDER.map((key) => {
            const { Icon, name } = UNITS[key];
            return (
              <button key={key} type="button" className={`character-card${key === picked ? ' on' : ''}`} onClick={() => setPicked(key)}>
                <Icon />
                <span>{name}</span>
                <small>{price(key)}</small>
              </button>
            );
          })}
        </div>
        <div className="rules-body character-detail">
          <h2>
            {unit.name} <unit.Icon />
          </h2>
          <p>{unit.blurb}</p>
          <p><strong>Moves:</strong> {unit.moves}</p>
          <p><strong>Attack:</strong> {unit.range}</p>
          <p><strong>Ability:</strong> {unit.ability}</p>
          {abilityPrice(picked) && <p><strong>Ability price:</strong> {abilityPrice(picked)}</p>}
        </div>
        <div className="menu-buttons">
          <button type="button" className="infoButton" onClick={onBack}>
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
}
