import React, { createContext, useContext, useState, useRef } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [showBelowInv, setShowBelowInv] = useState(true)
  const [showChar, setShowChar] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(true);
  const [showRules, setShowRules] = useState(false);

  return (
    <GameContext.Provider value={{ showBelowInv, setShowBelowInv, showChar, setShowChar,joinedRoom, setJoinedRoom, showRules, setShowRules}}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
