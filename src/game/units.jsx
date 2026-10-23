// Display-only information about each piece. Rules and prices live on the
// server; this file only says what things are called and how they look.
import { AiFillFire } from 'react-icons/ai';
import { TbBow, TbSwords, TbCross } from 'react-icons/tb';
import { PiMagicWandFill } from 'react-icons/pi';
import { GiCrownedSkull, GiRaiseSkeleton, GiGoblinHead, GiMagicShield } from 'react-icons/gi';

export const UNITS = {
  MM: {
    name: 'MinuteMan',
    Icon: TbSwords,
    blurb: 'The most basic and reliable troop: cheap, quick, and always charging for the far side.',
    range: 'Melee',
    moves: 'Charges 1 or 2 squares straight ahead, and can move twice a turn. It never moves sideways or back.',
    ability: "Shield (passive): immune to Wizards' spells and to Spread - but an Archer's arrow or an Explosion still gets it.",
  },
  A: {
    name: 'Archer',
    Icon: TbBow,
    blurb: 'Strong and determined, archers support allies from afar.',
    range: 'Ranged: every time it moves, it shoots the enemy directly in front of where it lands - even a MinuteMan',
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
    name: 'Goblin',
    Icon: GiGoblinHead,
    blurb: "Sneaky diggers who love gold. They hoard it at home, steal it from the enemy, and hide in their tunnels where no spell or arrow can reach them.",
    range: 'Melee',
    moves: '1 or 2 squares straight ahead (3 when tunnelling under a barrier), and can move twice a turn, or one step back.',
    ability: "Burrow (passive): tunnels under barriers - but not fire, and not a barrier an enemy warden is touching.",
  },
  W: {
    name: 'Wizard',
    Icon: PiMagicWandFill,
    blurb: "Some would say the smartest troop in your empire. They don't mess around with fire. You can have at most 2 at a time.",
    range: 'Ranged: every time it moves, it casts a spell on the enemy directly in front of where it lands',
    moves: 'Sideways or diagonally forward, up to 2 squares, or one step back.',
    ability: 'Explosion! (costs money): a ring of fire bursts out around the wizard, destroying everything in it, even MinuteMen. Wizards walk through fire.',
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
    name: 'Warden',
    Icon: GiMagicShield,
    blurb: 'Keepers of the walls. Wardens build and mend barriers, and shield the pieces around them from magic and blasts.',
    range: 'Melee',
    moves: 'One step forward or back, or up to 2 squares up or down.',
    ability: "Repair, Reinforce & Smash (passive): extends a barrier it touches by one square for one move, stops enemy goblins tunnelling under a barrier it's touching, and walks straight through barriers, knocking them down.",
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
  { key: 'purify', title: 'Priest', name: 'Purify', unit: 'P', paid: true, hint: 'Pick a priest: destroy the enemy pieces it reaches.' },
  { key: 'explosion', title: 'Wizard', name: 'Explosion!', unit: 'W', paid: true, hint: 'Pick a wizard: ring it with fire.' },
  { key: 'rise', title: 'Necromancer', name: 'Rise', unit: 'N', paid: true, hint: 'Pick a necromancer: raise fallen allies as skeletons.' },
  { key: 'repair', title: 'Warden', name: 'Repair', unit: 'C', hint: 'Extend a barrier next to one of your wardens. Costs a move.' },
  // Shown only when the server's rules have them (they then appear in the price list).
  { key: 'fortify', title: 'Warden', name: 'Fortify', unit: 'C', paid: true, optional: true, hint: 'Build a 1-square barrier next to one of your wardens.' },
  { key: 'curse', title: 'Necromancer', name: 'Curse', unit: 'N', paid: true, optional: true, hint: 'Pick an enemy piece near a necromancer: it cannot move next turn.' },
];

export const sideName = (side) => (side === 'blue' ? 'Blue' : 'Orange');

// "Wizards", "MinuteMen".
export const pluralName = (unit) => (UNITS[unit].name.endsWith('Man') ? `${UNITS[unit].name.slice(0, -3)}Men` : `${UNITS[unit].name}s`);

// A piece's ability text under the server's current rules (some pieces got
// new jobs in the 2026-10-21 balance update; older servers keep the old text).
export function abilityText(key, rules) {
  const base = UNITS[key].ability;
  if (!rules) return base;
  const fire = rules.fireTurns ? ` The fire burns out after ${rules.fireTurns / 2} rounds.` : '';
  switch (key) {
    case 'P':
      if (!rules.purifyMode || rules.purifyMode === 'undead') return base;
      return `Purify (costs money): pick a priest - every enemy piece ${rules.purifyMode === 'column' ? "in the priest's column (the whole line, top to bottom)" : 'touching it'} is destroyed${rules.purifySparesShield ? ' (except MinuteMen, whose shields protect them)' : ''}.${rules.purifySacrifice ? ' The priest gives its life to do it.' : ''}${rules.purifyCostsMove ? ' Uses a move.' : ''}${rules.purifyCooldown ? ` Afterwards that priest rests for ${rules.purifyCooldown} turn${rules.purifyCooldown === 1 ? '' : 's'} before it can Purify again.` : ''}`;
    case 'M':
      if (!rules.minerIncome) return base;
      return `Gold mine (passive): each of your Goblins${rules.minerIncomeHome ? ' on your half of the board' : ''} digs up $${rules.minerIncome} when you end your turn.${rules.minerRaid ? ` Raid: a Goblin on the enemy's half steals $${rules.minerRaid} of their money instead.` : ''}${rules.winUnits && !rules.winUnits.includes('M') ? " Goblins are thieves, not soldiers: they don't win by reaching the far side." : ''} Burrow: tunnels under barriers${rules.tunnelPieces ? ' and pieces' : ''} - but not fire, and not a barrier an enemy warden is touching.${rules.minerUnderground ? " Underground: Explosion, Purify, Spread and arrows can't touch a Goblin - only close combat can take one." : ''}`;
    case 'N': {
      const parts = [];
      if (rules.riseRevives) parts.push(`Rise (costs money): ${rules.riseMax === 1 ? 'your most recently fallen piece comes' : `up to ${rules.riseMax} of your fallen pieces come`} back as ${rules.riseMax === 1 ? 'itself' : 'themselves'}${rules.riseMax === 1 ? '' : ' (most recent first)'} in front of the necromancer${rules.riseNoWizards ? ' (Wizards stay dead)' : ''}.${rules.riseHomeOnly ? " Only onto your own half of the board, so a necromancer on the enemy half can't Rise." : ''}${rules.riseCostsMove ? ' Uses a move.' : ''}`);
      else parts.push(base);
      if (rules.necroCurse) parts.push(`Curse (costs money): an enemy piece within ${rules.curseRange} squares can't move or use an ability on its next ${rules.curseTurns > 1 ? `${rules.curseTurns} turns` : 'turn'}. Each necromancer can curse once a turn.`);
      if (rules.winUnits && !rules.winUnits.includes('N')) parts.push("Necromancers are summoners, not soldiers: they don't win by reaching the far side.");
      return parts.join(' ');
    }
    case 'C':
      if (!rules.carpenterBuilds) return base;
      return `${base} Fortify (costs money${rules.fortifyFree ? ", doesn't use a move" : ', uses a move'}): build a 1-square barrier on an empty square next to the warden - it may touch pieces.${rules.carpenterWalls ? ` Each warden you have lets you build ${rules.carpenterWalls} more barrier squares.` : ''}${rules.carpenterWard ? ` Ward (passive): your pieces touching a warden can't be destroyed by ${rules.carpenterWard >= 2 ? 'Purify, Explosion or Spread' : 'Purify'}.` : ''}`;
    case 'W':
      return base + fire;
    default:
      return base;
  }
}
