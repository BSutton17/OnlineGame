import React, { useState } from 'react';
import { useGameContext } from './Context/GameContext';
import LoadingRoom from './MainMenu/LoadingRoom';
import WaitingRoom from './MainMenu/WaitingRoom';
import HowToPlay from './MainMenu/HowToPlay';
import GameScreen from './components/GameScreen';
import './App.css';

export default function App() {
  const { view, resuming } = useGameContext();
  const [showRules, setShowRules] = useState(false);

  if (view) return view.status === 'waiting' ? <WaitingRoom /> : <GameScreen />;
  if (resuming) return <div className="Waiting-Room">Rejoining your game...</div>;
  if (showRules) return <HowToPlay onBack={() => setShowRules(false)} />;
  return <LoadingRoom onShowRules={() => setShowRules(true)} />;
}
