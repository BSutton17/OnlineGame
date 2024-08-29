import React, { useState } from "react";
import { io } from "socket.io-client";
import App from "../App";
import "../App.css"
import HowToPlay from "./HowToPlay"; 
import { useGameContext } from '../Context/GameContext';
import { TbBow, TbSwords, TbCross, TbShovel  } from "react-icons/tb";
import { PiMagicWandFill, PiHammerFill  } from "react-icons/pi";
import { GiCrownedSkull, GiRaiseSkeleton  } from "react-icons/gi";
import './HTP.css';

const socket = io.connect("https://overloardserver-3dcf0e3323a3.herokuapp.com/")

const LoadingRoom = () => {
  const [userName, setUsername] = useState("");
  const [room, setRoom] = useState("");
  
  const { joinedRoom, setJoinedRoom, showRules, setShowRules, loadRoom, setLoadRoom, blueUser, setBlueUser, orangeUser, setOrangeUser } = useGameContext(); 

  const joinRoom = () => {
    if (userName !== "" && room !== "") {
      socket.emit('joinRoom', room, userName);
      setJoinedRoom(false);
      console.log("User joined room: " + joinedRoom);
    }
  };

  return (
    <>
      {showRules ? (
        <HowToPlay />
      ) : joinedRoom ? (
        <div className="backGround">
          <div className="icons" id="TbBow"><TbBow size={400}/></div>
          <div className="icons" id="TbSwords"><TbSwords size={300}/></div>
          <div className="icons" id="TbCross"><TbCross size={212}/></div>
          <div className="icons" id="TbShovel"><TbShovel size={140}/></div>
          <div className="icons" id="PiMagicWandFill"><PiMagicWandFill size={210}/></div>
          <div className="icons" id="PiHammerFill"><PiHammerFill size={123}/></div>
          <div className="icons" id="GiCrownedSkull"><GiCrownedSkull size={323}/></div>
          <div className="icons" id="GiRaiseSkeleton"><GiRaiseSkeleton size={100}/></div>
          <div className='home-wrapper'>
            <h1>Overlord</h1>
            <input
              type='text'
              placeholder="Name..."
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type='text'
              placeholder="Room Id..."
              onChange={(e) => setRoom(e.target.value)}
            />
            <button className="infoButton" onClick={joinRoom}>Play Now</button>
            <button className="infoButton" onClick={() => setShowRules(true)}>How To Play</button>
          </div>
        </div>
      )  : (
        <App socket={socket} username={userName} room={room} />
      ) }
    </>
  );
};

export default LoadingRoom;
