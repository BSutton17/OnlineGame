import React, { useState } from "react";
import { io } from "socket.io-client";
import App from "../App";
import "../App.css"
import HowToPlay from "./HowToPlay"; // Import the correct component
import { useContext } from 'react';
import { useGameContext } from '../Context/GameContext';
import './HTP.css';

const socket = io.connect("https://overloardserver-3dcf0e3323a3.herokuapp.com/")

const LoadingRoom = () => {
  const [userName, setUsername] = useState("");
  const [room, setRoom] = useState("");
  
  const { joinedRoom, setJoinedRoom, showRules, setShowRules } = useGameContext(); 

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
            <button className="infoButton"onClick={joinRoom}>Play Now</button>
            <button className="infoButton"onClick={() => setShowRules(true)}>How To Play</button>
          </div>
        </div>
      ) : (
        <App socket={socket} username={userName} room={room} />
      )}
    </>
  );
};

export default LoadingRoom;
