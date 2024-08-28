import React from 'react';
import {useContext } from 'react';
import { GameProvider, useGameContext } from './Context/GameContext';
import "./App.css"
const Abilities = ({ color, handleDragStart}) => {
    const { setShowBelowInv  } = useGameContext();  
  return (
    <div id="inventory">
        <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'Arrow', "Ability")}
      >
        <h1>Archer</h1>
        <h2>Arrow</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'Sp', "Ability")}
      >
        <h1>Archer</h1>
        <h2>Spread</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'Pu', "Ability")}
      >
        <h1>Priest</h1>
        <h2>Purify</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'fireBall', "Ability")}
      >
        <h1>Wizard</h1>
        <h2>Explosion!</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'Ri', "Ability")}
      >
        <h1>Necromancer</h1>
        <h2>Rise</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'Re', "Ability")}
      >
        <h1>Carpenter</h1>
        <h2>Repair</h2>
      </button>
      <button className="change" onClick={() => {
        setShowBelowInv(true)
      }}>Inventory</button>
    </div>
  );
};

export default Abilities;
