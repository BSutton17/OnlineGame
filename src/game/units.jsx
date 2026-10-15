// Display-only information about each piece. Rules and prices live on the
// server; this file only says what things are called and how they look.
import { AiFillFire } from 'react-icons/ai';
import { TbBow, TbSwords, TbCross, TbShovel } from 'react-icons/tb';
import { PiMagicWandFill, PiHammerFill } from 'react-icons/pi';
import { GiCrownedSkull, GiRaiseSkeleton } from 'react-icons/gi';

export const UNITS = {
  MM: {
    name: 'MinuteMan',
    Icon: TbSwords,
    blurb: 'The most basic and reliable troop - and the only one that can win the game by reaching the far side!',
    range: 'Melee',
    moves: 'Charges 1 or 2 squares straight ahead, and can move twice a turn. On your own half it can also step diagonally forward.',
    ability: 'Shield (passive): immune to arrows, spells and explosions.',
  },
  A: {
    name: 'Archer',
    Icon: TbBow,
    blurb: 'Strong and determined, archers support allies from afar.',
    range: 'Ranged: every time it moves, it shoots the enemy directly in front of where it lands',
    moves: 'Up to 2 squares forward, fanning out sideways, or one step back.',
    ability: 'Spread (costs money): fire at a square in front of an archer and hit the squares above and below it too.',
  },
  P: {
    name: 'Priest',
    Icon: TbCross,
    blurb: "Necromancers' and the undead's worst nightmare. Never a bad idea to have a few around.",
    range: 'Melee',
    moves: 'One step forward to anywhere in a wide row, two forward on the wings, or one step back.',
    ability: 'Purify (costs money): every enemy Necromancer and Skeleton on your half of the board is destroyed.',
  },
  M: {
    name: 'Miner',
    Icon: TbShovel,
    blurb: 'Resilient diggers. Not even barriers can stand in their way... but fire might.',
    range: 'Melee',
    moves: '1 or 2 squares straight ahead (3 when tunnelling under a barrier), or one step back.',
    ability: "Burrow (passive): tunnels under barriers - but not fire, and not a barrier an enemy carpenter is touching.",
  },
  W: {
    name: 'Wizard',
    Icon: PiMagicWandFill,
    blurb: "Some would say the smartest troop in your empire. They don't mess around with fire.",
    range: 'Ranged: every time it moves, it casts a spell on the enemy directly in front of where it lands',
    moves: 'Sideways or diagonally forward, up to 2 squares, or one step back.',
    ability: 'Explosion! (costs money): a ring of fire bursts out around the wizard, destroying everything in it except MinuteMen. Wizards walk through fire.',
  },
  N: {
    name: 'Necromancer',
    Icon: GiCrownedSkull,
    blurb: 'They study the undead. The more of your allies fall, the more powerful they become.',
    range: 'Melee',
    moves: 'One step forward or diagonal, two forward on the diagonals, or one step back.',
    ability: 'Rise (costs money): up to 3 fallen allies return as Skeletons in front of the necromancer.',
  },
  C: {
    name: 'Carpenter',
    Icon: PiHammerFill,
    blurb: 'Everyone needs a handyman on site. Carpenters fix barriers and are great defenders.',
    range: 'Melee',
    moves: 'One step forward or back, or up to 2 squares up or down.',
    ability: "Repair, Reinforce & Smash (passive): extends a barrier it touches by one square for one move, stops enemy miners tunnelling under a barrier it's touching, and walks straight through barriers, knocking them down.",
  },
  S: {
    name: 'Skeleton',
    Icon: GiRaiseSkeleton,
    blurb: 'Raised by a necromancer. Slow, but they never tire.',
    range: 'Melee',
    moves: 'One square in any straight direction, once per turn, for free.',
    ability: "Undead: moving a skeleton doesn't use up one of your moves.",
  },
};

export const SHOP = ['MM', 'A', 'P', 'M', 'W', 'N', 'C'];

export const FireIcon = AiFillFire;

export const ABILITIES = [
  { key: 'spread', title: 'Archer', name: 'Spread', unit: 'A', paid: true, hint: 'Hit three squares in a column in front of an archer.' },
  { key: 'purify', title: 'Priest', name: 'Purify', unit: 'P', paid: true, hint: 'Destroy every enemy necromancer and skeleton on your half.' },
  { key: 'explosion', title: 'Wizard', name: 'Explosion!', unit: 'W', paid: true, hint: 'Pick a wizard: ring it with fire.' },
  { key: 'rise', title: 'Necromancer', name: 'Rise', unit: 'N', paid: true, hint: 'Pick a necromancer: raise fallen allies as skeletons.' },
  { key: 'repair', title: 'Carpenter', name: 'Repair', unit: 'C', hint: 'Extend a barrier next to one of your carpenters. Costs a move.' },
];

export const sideName = (side) => (side === 'blue' ? 'Blue' : 'Orange');
