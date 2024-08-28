import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import LoadingRoom from "./MainMenu/LoadingRoom";
import { GameProvider } from "./Context/GameContext";
import App from "./App";


ReactDOM.render(
  <GameProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </GameProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
