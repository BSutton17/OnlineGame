import React from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from './Context/GameContext';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
);
