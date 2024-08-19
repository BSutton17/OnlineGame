import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("http://localhost:3001");

function Inventory() {

  const [a, setA] = useState(1)
  useEffect(() => {
    // Listening for the 'testEmit' event from the server
    socket.on('receiveUpdated', (message) => {
      console.log('Message from server:', message);
      setA(prev=> prev + 1)
    });

    // Cleanup on component unmount
    return () => {
      socket.off('testEmit');
    };
  }, []);

  const sendRequest = () =>{
    socket.emit("sendUpdate", a)
  }

  return (
    <div className="Inventory">
      <h1 style={{color: 'white'}}>{a}</h1>
      <button onClick={sendRequest}>Click Me</button>
    </div>
  );
}

export default Inventory;
