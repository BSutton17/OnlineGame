import { useState } from "react";
import { io } from "socket.io-client";
import App from "./App";
import './App.css'

const socket = io.connect("http://localhost:3001")

const LoadingRoom = () =>{
    const [userName, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [joinedRoom, setJoinedRoom] = useState(true)

    

    const joinRoom = () =>{
        if(userName !== "" && room !== ""){
            socket.emit('joinRoom', room, userName)
            setJoinedRoom(false)
            console.log("User joined room: " + joinedRoom)
        }
    }

    return(
        <>
        {joinedRoom ? (
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
            <button onClick={joinRoom}>Play Now</button>
          </div>
          </div>
        ) : (
          <App socket={socket} username={userName} room={room} />
        )}
      </>
    )
}


export default LoadingRoom
