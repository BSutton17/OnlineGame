import React, { useState } from 'react';
import { TbBow, TbSwords, TbCross, TbShovel } from 'react-icons/tb';
import { PiMagicWandFill, PiHammerFill } from 'react-icons/pi';
import { GiCrownedSkull, GiRaiseSkeleton } from 'react-icons/gi';
import { useGameContext } from '../Context/GameContext';
import './HTP.css';

const NAME_KEY = 'overlord.name';

const rememberedName = () => {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
};

// An invite link looks like https://.../?room=0427
const roomFromLink = () => (new URLSearchParams(window.location.search).get('room') || '').replace(/\D/g, '').slice(0, 4);

export function MenuBackground({ children }) {
  return (
    <div className="backGround">
      <div className="icons" id="TbBow"><TbBow size="40vmin" /></div>
      <div className="icons" id="TbSwords"><TbSwords size="30vmin" /></div>
      <div className="icons" id="TbCross"><TbCross size="21vmin" /></div>
      <div className="icons" id="TbShovel"><TbShovel size="14vmin" /></div>
      <div className="icons" id="PiMagicWandFill"><PiMagicWandFill size="21vmin" /></div>
      <div className="icons" id="PiHammerFill"><PiHammerFill size="12vmin" /></div>
      <div className="icons" id="GiCrownedSkull"><GiCrownedSkull size="32vmin" /></div>
      <div className="icons" id="GiRaiseSkeleton"><GiRaiseSkeleton size="10vmin" /></div>
      {children}
    </div>
  );
}

export default function LoadingRoom({ onShowRules }) {
  const { join, notice, setNotice, connection } = useGameContext();
  const [name, setName] = useState(rememberedName);
  const [room, setRoom] = useState(roomFromLink);
  const [joining, setJoining] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setNotice('Please enter a name');
    if (room && room.length !== 4) return setNotice('Room codes are 4 digits');
    setJoining(true);
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {
      // not important
    }
    const result = await join(name, room);
    setJoining(false);
    if (!result.ok) setNotice(result.error);
  };

  return (
    <MenuBackground>
      <form className="home-wrapper" onSubmit={submit}>
        <h1>Overlord</h1>
        <input type="text" placeholder="Name..." value={name} maxLength={16} autoComplete="nickname" onChange={(e) => setName(e.target.value)} />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Room #"
          value={room}
          maxLength={4}
          aria-label="4-digit room number"
          onChange={(e) => setRoom(e.target.value.replace(/\D/g, '').slice(0, 4))}
        />
        <p className="menu-note" role="status">
          {notice ||
            {
              connected: 'Enter your friend’s 4-digit room, or leave it blank to start one.',
              connecting: 'Connecting to the server…',
              offline: 'Can’t reach the server - retrying…',
            }[connection]}
        </p>
        <div className="menu-buttons">
          <button type="submit" className="infoButton" disabled={joining || connection !== 'connected'}>
            {joining ? 'Joining…' : 'Play Now'}
          </button>
          <button type="button" className="infoButton" onClick={onShowRules}>
            How To Play
          </button>
        </div>
      </form>
    </MenuBackground>
  );
}
