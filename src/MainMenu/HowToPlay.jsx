import React, { useState } from 'react';
import "./HTP.css";
import Characters from './Characters';
import { useContext } from 'react';
import { useGameContext } from '../Context/GameContext';

const HowToPlay = () => {
    const { showChar, setShowChar, setJoinedRoom, setShowRules } = useGameContext(); 

  return (
    <div>
      {showChar ? (
        <Characters />
      ) : (
        <div id="how-to-play">
          <h1>How to Play</h1>
          <p>
            When it is your turn, you may place up to 3 characters and/or barriers onto any gray square on your side. You will have 3 moves before your turn is over. Placing a character or moving a character will count as a move.
            <br /><br />
            You may not spawn a character onto a square another piece, friend or foe, is occupying. You may spawn a character and move a character on the same turn if you have enough remaining moves to do so.
            <br /><br />
            At the end of every turn you will generate $100.
          </p>

          <h1>How to Win</h1>
          <p>
            The first player to get a piece to the other side of the board is deemed the winner.
          </p>

          <h1>Moving</h1>
          <p>
            When you click on a character, an array of green squares will appear, you may move to any of these green squares (with the exception of the one you are currently on).
            <br /><br />
            <strong>For melee characters:</strong> Should an enemy be blocking a path, you may move to that square and capture the enemy.
            <br /><br />
            <strong>For ranged characters:</strong> Should an enemy be blocking a path, you may move one square in front of the enemy and use an arrow to capture them.
            <br /><br />
            If a barrier is blocking your path, you may move around the barrier. If no other path is available, you may move a piece on top of a barrier, removing both that barrier and your piece from the board.
            <br /><br />
            You cannot jump over any barriers, allies, or enemies.
          </p>

          <h1>Barriers</h1>
          <p>
            Barriers are powerful cards that can block opponents' paths.
            <br /><br />
            You cannot place a barrier adjacent to any other barrier or character (friend or foe).
            <br /><br />
            You cannot place a barrier in the gray sections of the board.
            <br /><br />
            Barriers are two-blocks tall; whatever square you place a barrier on, it will extend one block upwards.
          </p>

          <h1>Fire</h1>
          <p>
            Fire behaves similarly to barriers, with the exception that all wizards (friend and foe) may walk through it, while miners cannot.
          </p>

          <h1>Abilities</h1>
          <p>
            Abilities are powerful quirks that characters can possess. Some abilities are passive, meaning they have infinite use. Other abilities are active, meaning they can only be used one time per character type.
            <br /><br />
            <strong>Note:</strong> If an ability is active, it can only be used once per side for the entire game, regardless of whether multiple of that troop are on the board or if more spawn in later.
          </p>

          <button className="infoButton" onClick={() => setShowChar(true)}>View Characters</button>
          <button  className="infoButton"onClick={() => {
            setJoinedRoom(true)
            setShowRules(false)
          }}>Back</button>

        </div>
      )}
    </div>
  );
};

export default HowToPlay;
