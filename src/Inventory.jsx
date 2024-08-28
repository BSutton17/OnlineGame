import React from 'react';
import { GameProvider, useGameContext } from './Context/GameContext';
import {useContext } from 'react';
import "./App.css"

const Inventory = ({ color, handleDragStart, setNewColor, updateSideState }) => {
    const { showBelowInv, setShowBelowInv  } = useGameContext(); 
  return (
    <div id="inventory">
    <button className="change" onClick={() => {
        setShowBelowInv(false)
      }}>Abilities</button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'MM')}
      >
        <h1>MinuteMan</h1>
        <h2>$50</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'A')}
      >
        <h1>Archer</h1>
        <h2>$100</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'P')}
      >
        <h1>Priest</h1>
        <h2>$300</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'M')}
      >
        <h1>Miner</h1>
        <h2>$150</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'W')}
      >
        <h1>Wizard</h1>
        <h2>$200</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'N')}
      >
        <h1>Necromancer</h1>
        <h2>$250</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'C')}
      >
        <h1>Carpenter</h1>
        <h2>$150</h2>
      </button>
      <button
        className={color}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'B')}
      >
        <h1>Barrier</h1>
        <h2>$100</h2>
      </button>
      
      <button className="change" onClick={() => {
        setNewColor();
        updateSideState();
      }}>End Turn</button>
    </div>
  );
};

export default Inventory;
