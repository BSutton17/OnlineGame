import React, { useState } from 'react';
import { useGameContext } from '../Context/GameContext';
import './HTP.css';

export default function WaitingRoom() {
  const { view, leave } = useGameContext();
  const [copied, setCopied] = useState(null);
  const link = `${window.location.origin}${window.location.pathname}?room=${view.code}`;

  const copy = (text, what) =>
    navigator.clipboard?.writeText(text).then(
      () => setCopied(what),
      () => setCopied(null),
    );

  return (
    <div className="Waiting-Room">
      <div className="waiting-content">
        <span>Waiting for Opponent...</span>
        <div className="room-code" aria-label={`Room ${view.code}`}>
          {view.code}
        </div>
        <p className="menu-note">Tell your friend this room number, or send them the link.</p>
        <div className="menu-buttons">
          <button type="button" className="infoButton" onClick={() => copy(view.code, 'code')}>
            {copied === 'code' ? 'Copied!' : 'Copy Room #'}
          </button>
          <button type="button" className="infoButton" onClick={() => copy(link, 'link')}>
            {copied === 'link' ? 'Copied!' : 'Copy Invite Link'}
          </button>
          <button type="button" className="infoButton" onClick={leave}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
