import React, { createContext, useContext, useState, useRef } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [grid, setGrid] = useState([]);
  const [color, setColor] = useState("selector-blue");
  const [side, setSide] = useState(true);
  const [blueMoney, setBlueMoney] = useState(550);
  const [orangeMoney, setOrangeMoney] = useState(550);
  const [turn, setTurn] = useState("");
  const [moves, setMoves] = useState(3);

  const dragPositionRef = useRef(null);
  const dragClassRef = useRef(null);
  const dragCharacterRef = useRef(null);
  const beforeChangeRef = useRef(null);

  return (
    <GameContext.Provider value={{ grid, setGrid, color, setColor, side, setSide, blueMoney, setBlueMoney, orangeMoney, setOrangeMoney, turn, setTurn, moves, setMoves, dragPositionRef, dragClassRef, dragCharacterRef, beforeChangeRef }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
