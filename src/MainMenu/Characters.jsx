import React from 'react';
import { useGameContext } from '../Context/GameContext';
import { TbBow, TbSwords, TbCross, TbShovel  } from "react-icons/tb";
import { PiMagicWandFill,PiHammerFill  } from "react-icons/pi";
import { GiCrownedSkull, GiRaiseSkeleton  } from "react-icons/gi";
import './HTP.css';

const Characters = () => {
  const { showChar, setShowChar  } = useGameContext(); 
  return (
    <div id="characters">
      <h1>Characters</h1>

      <h2>MinuteMen <TbSwords /></h2>
      <p>The most basic and reliable troop, weak alone but mighty in numbers!</p>
      <p><strong>Range:</strong> Melee</p>
      <p><strong>Ability:</strong> Shield (Passive) MinuteMen cannot be harmed by spells or arrows</p>

      <h2>Archers <TbBow /></h2>
      <p>Strong and determined, archers are great at supporting allies from afar.</p>
      <p><strong>Range:</strong> One block</p>
      <p><strong>Ability:</strong> Spread (Active) Fire an arrow to the block in front of you, as well as one above and below the target block.</p>
      <p><strong>Placement:</strong> On enemy</p>

      <h2>Priest <TbCross /></h2>
      <p>Priests are Necromancers and the undead's worst nightmares, never a bad idea to have a few around, just in case.</p>
      <p><strong>Range:</strong> Melee</p>
      <p><strong>Ability:</strong> Purify (Active) All Necromancers and undead on your side of the board are eliminated.</p>
      <p><strong>Placement:</strong> Anywhere</p>
      
      <h2>Miners <TbShovel /></h2>
      <p>These resilient miners do the dirty work, not even barriers can stand in their way… but fire might.</p>
      <p><strong>Range:</strong> Melee</p>
      <p><strong>Ability:</strong> Burrow (Passive) Miners dig underground and appear on the other side of barriers. Note: Miners can move up to the closest dark green square available.</p>
      
      <h2>Wizard <PiMagicWandFill /></h2>
      <p>Some would say the smartest troop in your empire. These guys don’t mess around with their fire.</p>
      <p><strong>Range:</strong> One Block</p>
      <p><strong>Ability:</strong> Explosion! (Active) Cast an explosion that leaves behind a ring of fire around you, eliminating all allies and enemies in the blast radius.</p>
      <p><strong>Placement:</strong> On Wizard</p>
      
      <h2>Necromancer <GiCrownedSkull /></h2>
      <p>Necromancers have dedicated their entire lives studying and speaking to the undead. The more allies fall, the more powerful they become.</p>
      <p><strong>Range:</strong> Melee</p>
      <p><strong>Ability:</strong> Rise (Active) Three fallen allies are resurrected as the undead <GiRaiseSkeleton />, the undead can only move one square per round, but don’t count towards your movement!</p>
      <p><strong>Placement:</strong> One block in front of Necromancer</p>
      
      <h2>Carpenter <PiHammerFill /></h2>
      <p>Everyone needs a handyman on sight, carpenters repair barriers, and are some of the best defenders in your empire.</p>
      <p><strong>Range:</strong> Melee</p>
      <p><strong>Ability:</strong> Repair (Passive) Any carpenter that is orthodontology adjacent to a barrier may extend it by one block in any direction as long as the block is vacant.</p>

      <h1>Now you know the ropes. Rally your troops, build those barriers, manage your economy and become an overlord.</h1>
      <button  className="infoButton" onClick={() => setShowChar(false)}>How to play</button>
    </div>
  );
};

export default Characters;
