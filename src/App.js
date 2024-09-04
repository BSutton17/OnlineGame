import React, { useState, useEffect, useRef, useContext } from 'react';
import './App.css';
import { AiFillFire } from "react-icons/ai";
import { TbBow, TbSwords, TbCross, TbShovel  } from "react-icons/tb";
import { PiMagicWandFill,PiHammerFill, PiArrowFatLinesLeftFill  } from "react-icons/pi";
import { GiCrownedSkull, GiRaiseSkeleton  } from "react-icons/gi";
import Inventory from './Inventory';
import Abilities from './Abilities';
import { useGameContext } from './Context/GameContext';

function App({ socket, username, room }) {
  const [grid, setGrid] = useState([]); //stores the grid array
  const [color, setColor] = useState("selector-blue"); //tracks the color of the inv
  const [side, setSide] = useState(true) //a boolean tracker for if statements. True == blue. False == orange
  const [blueMoney, setBlueMoney] = useState(600) 
  const [orangeMoney, setOrangeMoney] = useState(600)
  const [turn, setTurn] = useState("") //A string for the top of the page
  const [moves, setMoves] = useState(3)//Tracks moves
  const [userSide, setUserSide] = useState()
  
  const [canMove, setCanMove] = useState(true);

  const dragPositionRef = useRef(null); // Ref to store position of dragged cell
  const dragClassRef = useRef(null)
  const dragCharacterRef = useRef(null);
  const beforeChangeRef = useRef(null)

  const { showBelowInv, setLoadRoom, loadRoom, blueUser, setBlueUser,  orangeUser, setOrangeUser} = useGameContext(); 

  useEffect(() => {
    if (moves <= 0) {
      setCanMove(false);
    } else {
      setCanMove(true);
    }
  }, [grid, moves, turn]);

 useEffect(() => {
  socket.on('assignRoles', ({ blueUser, orangeUser }) => {
    setBlueUser(blueUser + "'s");
    setOrangeUser(orangeUser + "'s");
    setUserSide(username === blueUser ? blueUser : orangeUser);

    console.log(blueUser + orangeUser);
    if (blueUser !== "" && orangeUser !== "") {
      setLoadRoom(true);
    }
  });

  socket.on('roomFull', () => {
    console.log('full');
  });

 
  return () => {
    socket.off('assignRoles');
    socket.off('roomFull');
  };
}, []); 


   // Define characters
   const minuteMen = "MM";
   const archer = 'A';
   const priest = "P";
   const miner = "M";
   const wizard = "W";
   const necromancer = "N";
   const carpenter = "C";
   const barrier = 'B'

   useEffect(() => {
    setGrid(createGrid(14, color))
      // Listening for the 'testEmit' event from the server
  },[])

  //send new side to clients
  useEffect(()=>{
    socket.on('receiveUpdated', (newSide) => {
      setSide(newSide)
      setNewColor()
    });

    // Cleanup on component unmount
    return () => {
      socket.off('receiveUpdated');
    };
  },[side, color, turn])

  // UseEffect For broadcasting colors
useEffect(() => {
    socket.on('receiveMovesUpdated', (newMoves) => {
        setMoves(newMoves);
    });

    return () => {
        socket.off('receiveMovesUpdated');
    };
}, [grid, moves]);

  //update the grid for clients
  useEffect(() => {
    socket.on('receiveGridUpdated', (serializedGrid) => {
      setGrid(serializedGrid.map((cell) => {
      const [cellI, cellJ] = cell.id.split('-').map(Number);
      let icon = determineSentIcon(cell.content)
      if(icon == undefined){
        icon = ''
      }
      
        return (
          <button
            key={cell.id}
            className={cell.className}
            draggable={cell.draggable}
            id={cell.id}
            onMouseDown={() => handleMouseDown(cellI, cellJ, icon, cell.className)}
            onMouseUp={handleMouseUp}
            onDragStart={(e) => handleDragStart(e, icon, cell.className)}
            onDragOver={(e) => handleDragOver(e, cell.className)}
            onDrop={(e) => handleDrop(e, cell.id, color)}
          >
            {icon}
          </button>
        );
      }));
    });
 
  //  resetColors()
    // Cleanup on component unmount
    return () => {
      socket.off('receiveGridUpdated');
    };
  }, [grid, turn]);

   // UseEffect For broadcasting colors
   useEffect(()=>{
    socket.on('receiveMoneyUpdated', (newPrice) => {
      setBlueMoney(newPrice[0])
      setOrangeMoney(newPrice[1])
    });

    // Cleanup on component unmount
    return () => {
      socket.off('receiveMoneyUpdated');
    };
  },[blueMoney, orangeMoney, grid])
 
 
  const updateSideState = () => {
    socket.emit("sendUpdate", side, room);
};

const updateMoneyState = () => {
  setBlueMoney((prevBlueMoney) => {
    setOrangeMoney((prevOrangeMoney) => {
      const updatedBlueMoney = prevBlueMoney; // or apply any logic if you need to
      const updatedOrangeMoney = prevOrangeMoney; // or apply any logic if you need to
      socket.emit("sendMoneyUpdate", [updatedBlueMoney, updatedOrangeMoney], room);
      return prevOrangeMoney;
    });
    return prevBlueMoney;
  });
};

const updateMoves = () =>{
  setMoves((prevMoves)=>{
    const updatedMoves = prevMoves
    socket.emit("sendMovesUpdate", updatedMoves, room)
    return prevMoves
  })
}

const serializeGrid = (grid) => {
  return grid.map((cell) => {

    let content = cell.props.children
    let character = content == "B" ? "B" : content && content.props && content.props.name ? content.props.name : ''
    return {
      id: cell.props.id,
      content: character,
      className: cell.props.className,
      draggable: cell.props.draggable,
    };
  });
};

const sendGridUpdate = () => {
  setGrid((prevGrid) => {
    const serializedGrid = serializeGrid(prevGrid);
    socket.emit("sendGridUpdate", serializedGrid, room);
    return prevGrid;
  });
};

  //keep the color the same until the end of your turn
  useEffect(() => {
   
    setGrid((prevGrid) => {
      return prevGrid.map((cell) => {
        const [cellI, cellJ] = cell.props.id.split('-').map(Number);
        const className = cell.props.className
        const drag = cell.props.children == '' ? false : true
           
        // Print the className of the cell to the console
        setMoves(3)


        return (
          <button
            className={className}
            draggable={drag}
            id={cell.props.id}
            onMouseDown={() => handleMouseDown(cellI, cellJ, cell.props.children, className)}
            onMouseUp={handleMouseUp}
            onDragStart={cell.props.onDragStart}
            onDragOver={(e) => handleDragOver(e, className)}
            onDrop={(e) => handleDrop(e, cell.props.id, color)}
          >
            {cell.props.children}
          </button>
        );
      });
    });
  }, [side]);

  const setNewColor = () => {
    if (!side) {
        setOrangeMoney(prevOrangeMoney => prevOrangeMoney + 75);
        setColor("selector-blue");
        setTurn("Blue's Turn");
        setMoves(3);
    } else {
        setBlueMoney(prevBlueMoney => prevBlueMoney + 75);
        setColor("selector-orange");
        setTurn("Orange's Turn");
        setMoves(3);
    }
    
    setTimeout(() => {
        setTurn("");
    }, 2000);
    
    setSide((prevSide) => !prevSide);
    sendGridUpdate()
    updateMoneyState();
    updateMoves(); 
};

  // Function to create the initial grid
  const createGrid = (num, color) => {
    let array = [];
    for (let i = 0; i <9 ; i++) {
      for (let j = 0; j < num; j++) {
        let content = '';
        let className = determineBackground(i, j);

        array.push(
          <button
            className={className}
            draggable={!!content}
            id={`${i}-${j}`}
            onMouseDown={() => handleMouseDown(i, j, content, className)}
            onMouseUp={handleMouseUp}
            onDragStart={(e) => handleDragStart(e, content,className)}
            onDragOver={(e) => handleDragOver(e,className)}
            onDrop={(e) => handleDrop(e, `${i}-${j}`, color)}
            key={`${i}-${j}`}
          >
            {content}
          </button>
        );
      }
    }
    return array;
  };
 
  // Allow drop event
 // Allow drop event
const handleDragOver = (e, className) => {
// Determine if the dragged item is from the inventory
const isFromInv = dragClassRef.current === "selector-blue" || dragClassRef.current === "selector-orange";
const iconName = e.target.getAttribute('name');

  //only characters have to be dropped on gray sqaures
  let isChar = false
  switch(dragCharacterRef.current ){
    case minuteMen:
    case archer:
    case priest:
    case miner:
    case wizard:
    case necromancer:
    case carpenter:
      isChar = true;
      break;
    default:
      isChar = false;
  }

  if(e.target.className == className && iconName != null){
    return;
  }

  if(dragCharacterRef.current == "Arrow" && iconName == "MM"){
    return;
  }

  if(dragCharacterRef.current == "fireBall" && iconName !== wizard){
    return
  }
  //allow barriers
  if((dragCharacterRef.current == barrier || dragCharacterRef.current == "Sp" ||
      dragCharacterRef.current == "Re" || dragCharacterRef.current == "fireBall" || dragCharacterRef.current == "Ri" ||
      dragCharacterRef.current == "Pu" || dragCharacterRef.current == "S" || dragCharacterRef.current == "Arrow"
  )  && iconName === null){
    e.preventDefault()
  }

  if(iconName !== null){
    e.preventDefault();
  }
  // Allow drop if the item is from the inventory and the target is a grey box
  if (isFromInv && e.target.className === "box-grey") {
    e.preventDefault();
  }

  //only move to green sqaures (unless it is an enemy sqaure)
   if((!isFromInv && (e.target.className == 'box-green' || e.target.className == 'box-dark-green' || e.target.className == 'box-black')) || iconName != null){
    e.preventDefault();
  }
};

  const determineSentIcon = (character) =>{
    switch(character){
      case 'MM':
        return <TbSwords size={35} name="MM" />
      case 'A':
        return <TbBow size={35} name='A'/>
      case 'P':
        return <TbCross size={35} name='P'/>
      case "M":
        return <TbShovel size={35} name="M"/>
      case "W":
        return <PiMagicWandFill size={35} name="W" />
      case "N":
        return <GiCrownedSkull size={35} name="N"/>
      case "C":
        return <PiHammerFill size={35} name="C"/>
      case 'F':
          return  <AiFillFire size={35} name='F' />
      case 'B':
          return 'B'
      case "S":
          return <GiRaiseSkeleton size={35} name="S" />
      default:
        break;
     
    }
  }
 
  // draw an icon onto the screen at a specific location
  const determineIcon = (boxClassName, droppedContent, id, cellI, cellJ, color) => {
    switch(droppedContent) {
      case 'MM':
        return renderBoxButton(boxClassName, <TbSwords size={35} name='MM'/>, id, cellI, cellJ, color);
      case 'A':
        return renderBoxButton(boxClassName, <TbBow size={35} name='A'/>, id, cellI, cellJ, color)
      case 'P':
        return renderBoxButton(boxClassName, <TbCross size={35} name='P'/>, id, cellI, cellJ, color)
      case "M":
        return renderBoxButton(boxClassName, <TbShovel size={35} name='M'/>, id, cellI, cellJ, color)
      case "W":
        return renderBoxButton(boxClassName, <PiMagicWandFill size={35} name='W'/>, id, cellI, cellJ, color)
      case "N":
        return renderBoxButton(boxClassName, <GiCrownedSkull size={35} name='N'/>, id, cellI, cellJ, color)
      case "C":
        return renderBoxButton(boxClassName, <PiHammerFill size={35} name='C'/>, id, cellI, cellJ, color)
      case "fireBall":
        return renderBoxButton(boxClassName, <PiMagicWandFill size={35} name='W'/>, id, cellI, cellJ, color)
      case "S":
        return renderBoxButton(boxClassName, <GiRaiseSkeleton size={35} name='S'/>, id, cellI, cellJ, color)
      default:
        break;
    }
  }
 
//when called it creates a cell with updated information
const renderBoxButton = (className, content, id, cellI, cellJ, color) => {
  let drag = true;
  if (content === '' || content === "B") {
    drag = false;
  }
  return (
    <button
      className={className}
      draggable={drag}
      id={id}
      onMouseDown={() => handleMouseDown(cellI, cellJ, content, className)}
      onMouseUp={handleMouseUp}
      onDragStart={(e) => handleDragStart(e, content, className)}
      onDragOver={(e) => handleDragOver(e, className)}
      onDrop={(e) => handleDrop(e, id, color)}
    >
      {content}
    </button>
  );
};

// Define function to get the cost of a character
function getCharacterCost(character) {
  switch(character) {
    case 'MM': return 50;
    case 'A': return 100;
    case 'P': return 300;
    case 'M': return 150;
    case 'W': return 200;
    case 'N': return 250;
    case 'C': return 150;
    case 'B': return 100;
    default: return 0;
  }
}

// Define function to check if a player can afford a character
function canAffordCharacter(character, color) {
  const cost = getCharacterCost(character);
  return (color === 'selector-blue' && blueMoney >= cost) ||
         (color === 'selector-orange' && orangeMoney >= cost);
}

function handleDragStart(e, character, className) {
  // blue/orange User have an 's after for the UI so add it here
  //if it is blue's turn, don't let orange go and vice versa
  if((!side && (userSide + "'s" == blueUser || className == 'box-blue')) || (side && (userSide+"'s" == orangeUser || className == 'box-orange'))){
    e.preventDefault()
  }
 
  if (!canAffordCharacter(character, color)) {
    e.preventDefault();
    setTurn("Cannot Afford");
    setTimeout(() => {
      setTurn("");
    }, 1500);
    return false;
  } 
 
  if(className != "Ability"){
    if (!canMove) {
      e.preventDefault();
      setTurn("Out of moves");
      setTimeout(() => {
        setTurn("");
      }, 1500);
      return false;
    } 
  }
 
  try{
    e.dataTransfer.setData('text/plain', character);
    dragClassRef.current = e.target.className;
    dragCharacterRef.current = character;
  }
  catch{
    dragPositionRef.current = e.target.id;
    dragClassRef.current = e.target.className;
    dragCharacterRef.current = character;

    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
  }
  
}
// Updated handleDrop function to prevent dropping if the player can't afford the character
function handleDrop(e, id, color) {
  const droppedContent = e.dataTransfer.getData('text/plain');
  console.log(droppedContent);

  let removeMoves = true;
  switch(droppedContent) {
    case "Arrow":
    case "Sp":
    case "Pu":
    case "fireBall":
    case "Ri":
    case "MM":
    case 'A':
    case "P":
    case "M":
    case "W":
    case "N":
    case "C":
      removeMoves = false;
      break;
    default:
      removeMoves = true;
  }
  
  let copyMoves;
  if (removeMoves) {
    setMoves((prevMoves) => {
      copyMoves = prevMoves - 1
      console.log(copyMoves)
      return prevMoves - 1
    }); 
    updateMoves();
  } 

  if(copyMoves < 0 && !removeMoves){
    resetColors()
    setTurn("Out of moves");
      setTimeout(() => {
        setTurn("");
      }, 1500);
    return;
  }

  resetColors();

  const [targetI, targetJ] = id.split('-').map(Number);

  const neighbors = [
    [targetI - 1, targetJ],    
    [targetI + 1, targetJ],    
    [targetI, targetJ - 1],     
    [targetI, targetJ + 1],     
    [targetI - 1, targetJ - 1], 
    [targetI - 1, targetJ + 1], 
    [targetI + 1, targetJ - 1], 
    [targetI + 1, targetJ + 1]  
  ];

  setGrid((prevGrid) => {
    return prevGrid.map((cell) => {
      const [cellI, cellJ] = cell.props.id.split('-').map(Number);
      const cellAsId = `${cellI}-${cellJ}`;
      const targetId = id.split('-').map(Number);
      const isAboveTarget = (cellI === targetId[0] - 1 && cellJ === targetId[1]);
      const isBelowTarget = (cellI === targetId[0] + 1 && cellJ === targetId[1]);
      let className = determineBackground(cellI, cellJ, cell.props.children);

      const isTargetCell = cellI === targetI && cellJ === targetJ;
      const isNeighbor = neighbors.some(([i, j]) => i === cellI && j === cellJ);

      // General cells
      if (droppedContent === 'Pu') {
        return priestAbility(cell, cellI, cellJ, color, className);
      } else if (droppedContent === 'B' && (cell.props.id === id || isAboveTarget)) {
        handleMoney(barrier, color);
        return renderBoxButton('box-black', 'B', cell.props.id, cellI, cellJ, color);
      } else if (droppedContent === "Sp"  && (cell.props.id === id || isAboveTarget || isBelowTarget)) {
        return renderBoxButton(className, '', cell.props.id, cellI, cellJ, color);
      } else if (droppedContent === 'Re' && isTargetCell) {
        // Check if any neighboring cell is a black box
        const hasBlackNeighbor = neighbors.some(([i, j]) => {
          const neighbor = prevGrid.find(cell => cell.props.id === `${i}-${j}`);
          return neighbor && neighbor.props.children === 'B';
        });

        if (hasBlackNeighbor) {
          return renderBoxButton('box-black', 'B', cell.props.id, cellI, cellJ, color);
        }
        else {
          return cell;
        }
      } else if(droppedContent === "Ri"  && (cell.props.id === id || isAboveTarget || isBelowTarget)) {
        const boxClassName = dragClassRef.current === "selector-blue" ? 'box-blue' : 'box-orange';
        return renderBoxButton(boxClassName, <GiRaiseSkeleton size={35} name='S' />, cell.props.id, cellI, cellJ, color);
      }

      // Character movement and enemy detection
      if (isTargetCell) {
        // If the current cell is the one where the item was dropped
        if (droppedContent === 'Arrow') {
          return renderBoxButton(className, '', cell.props?.id, cellI, cellJ, color);
        } else if (dragClassRef.current === 'selector-blue' || dragClassRef.current === 'selector-orange') {
          const boxClassName = dragClassRef.current === "selector-blue" ? 'box-blue' : 'box-orange';
          handleMoney(droppedContent, color);
          return determineIcon(boxClassName, droppedContent, id, cellI, cellJ, boxClassName);
        } 
        // else if (droppedContent === 'fireBall') {
        //   return renderBoxButton(className, "", cell.props?.id, cellI, cellJ, color);
        // } 
        else {
          return renderBoxButton(dragClassRef.current, dragCharacterRef.current, id, cellI, cellJ, color);
        }
      } else if (droppedContent === 'fireBall' && isNeighbor ) {
        return renderBoxButton(className, <AiFillFire size={35} name='F' />, cell.props.id, cellI, cellJ, color);
      } else if (cellAsId === dragPositionRef.current) {
        return renderBoxButton(className, '', cell?.props?.id, cellI, cellJ, color);
      } else if (cell?.props?.children !== '') {
        return renderBoxButton(cell.props.className, cell.props.children, cell.props.id, cellI, cellJ, color);
      } else {
        return renderBoxButton(className, '', cell?.props?.id, cellI, cellJ, color, cell?.props?.draggable);
      }
    });
  });

  sendGridUpdate();
  resetColors();
}


const priestAbility = (cell, cellI, cellJ, color, className) => {
  if (!cell || !cell.props || !cell.props.children) {
    return cell; // Return the original cell if it's undefined or has no children
  }

  // Check if the cell's children have props (e.g., an icon component)
  if (!cell.props.children.props || !cell.props.children.props.name) {
    return cell;
  }
  try{
    switch (color) {
      case 'selector-blue':
        if (cellJ < 10 && cell.props.className === 'box-orange' && (cell.props.children.props.name === necromancer || cell.props.children.props.name === "S")) {
          return renderBoxButton(className, '', cell.props.id, cellI, cellJ, color, false);
        } else {
          return cell;
        }
      default:
        if (cellJ >= 10 && cell.props.className === 'box-blue' && (cell.props.children.props.name === necromancer || cell.props.children.props.name === "S")) {
          return renderBoxButton(className, '', cell.props.id, cellI, cellJ, color, false);
        } else {
          return cell;
        }
    }
  }
  catch{return cell}
};
 
  const handleMouseDown = (i, j, character, side) => {
    if (!character || !character.props) {
      return;
  }
 
    dragPositionRef.current = i + "-" + j;
    let id = `${i}-${j}`
    // Update grid and character positions
    setGrid((prevGrid) => {
      return prevGrid.map((cell) => {
        const [cellI, cellJ] = cell.props.id.split('-').map(Number);
        let condition = false;
        let condition2 = false;
        // Determine conditions based on classNamr and character type

        if (side =='box-blue') {
          switch (character.props.name) {
            case minuteMen:
              condition = (cellI === i && cellJ === j + 1 )
              condition2 = (cellI === i && cellJ === j + 2);
              break;
            case 'A':
              condition = ( (cellI === i && cellJ === j )  || (cellI === i && cellJ === j + 1) || (cellI === i && cellJ === j + 2) ||
                           (cellI === i + 1 && cellJ === j + 2) ||(cellI === i - 1 && cellJ === j + 2) );
              condition2 =  (cellI === i + 2 && cellJ === j + 2) ||(cellI === i - 2 && cellJ === j + 2);
              break;
            case priest:
              condition = ( (cellI === i && cellJ === j )  || (cellI === i && cellJ === j + 1) || cellI === i + 1 && cellJ === j + 1 ||
                cellI === i + 2 && cellJ === j + 1 || cellI === i - 1 && cellJ === j + 1 || cellI === i - 2 && cellJ === j + 1);
              condition2 = (cellI === i + 2&& cellJ === j + 2 ) || (cellI === i - 2&& cellJ === j + 2 );
              break;
            case miner:
              condition = (cellI === i && cellJ === j + 1) ;
              condition2 =  (cellI === i && cellJ === j + 2) || (cellI === i && cellJ === j + 3);
              break;
            case wizard:
                condition =  (cellI === i && cellJ === j )  || (cellI === i +1 && cellJ == j) ||  (cellI === i - 1 && cellJ == j)
                ||  (cellI === i +1 && cellJ == j + 1) ||   (cellI === i - 1 && cellJ == j + 1)
                condition2 =(cellI === i +1 && cellJ == j + 2) || (cellI === i -1 && cellJ == j + 2) ;
              break;
            case necromancer:
              condition = (cellI === i && cellJ === j )  ||  (cellI === i && cellJ === j + 1) || (cellI === i + 1 && cellJ === j + 1) ||(cellI === i - 1 && cellJ === j + 1)
              condition2 = (cellI === i - 1 && cellJ === j + 2) || (cellI === i + 1 && cellJ === j + 2);
              break;
            case carpenter:
              condition =  (cellI === i && cellJ === j + 1) || (cellI === i - 1&& cellJ === j) || (cellI === i && cellJ === j - 1)
              || (cellI === i + 1 && cellJ === j) || (cellI === i +2 && cellJ === j) ||(cellI === i -2 && cellJ === j);
              break;
            case "S":
                condition2 =  (cellI === i && cellJ === j + 1) || (cellI === i - 1&& cellJ === j) || (cellI === i && cellJ === j - 1)
                || (cellI === i + 1 && cellJ === j);
                break;
            default:
              condition = (cellI === i && cellJ === j )
              break;
          }
        } else{
          switch (character.props.name) {
            case minuteMen:
              condition = (cellI === i && cellJ === j - 1);
              condition2 = (cellI === i && cellJ === j - 2);
              break;
            case archer:
              condition = ((cellI === i && cellJ === j )  ||  (cellI === i && cellJ === j - 1) || (cellI === i && cellJ === j - 2) ||
                           (cellI === i - 1 && cellJ === j - 2) ||(cellI === i + 1 && cellJ === j - 2));
              condition2 =  (cellI === i - 2 && cellJ === j - 2) ||(cellI === i + 2 && cellJ === j - 2);
              break;
            case priest:
              condition = ( (cellI === i && cellJ === j )  || (cellI === i && cellJ === j - 1) || cellI === i - 1 && cellJ === j - 1 ||
                cellI === i - 2 && cellJ === j - 1 || cellI === i + 1 && cellJ === j - 1 || cellI === i + 2 && cellJ === j - 1);
              condition2 = (cellI === i - 2 && cellJ === j - 2) || (cellI === i + 2 && cellJ === j - 2);
              break;
            case miner:
              condition = (cellI === i && cellJ === j - 1) ;
              condition2 =  (cellI === i && cellJ === j - 2) || (cellI === i && cellJ === j - 3);
              break;
            case wizard:
              condition =  (cellI === i && cellJ === j )  || (cellI === i - 1 && cellJ == j) ||  (cellI === i + 1 && cellJ == j)
                          ||  (cellI === i - 1 && cellJ == j - 1) ||   (cellI === i + 1 && cellJ == j - 1);
              condition2 =(cellI === i - 1 && cellJ == j - 2) || (cellI === i + 1 && cellJ == j - 2);
              break;
            case necromancer:
              condition = (cellI === i && cellJ === j )  ||  (cellI === i && cellJ === j - 1) || (cellI === i - 1 && cellJ === j - 1) ||
                           (cellI === i + 1 && cellJ === j - 1)
              condition2 = (cellI === i + 1 && cellJ === j - 2) || (cellI === i - 1 && cellJ === j - 2)
              break;
            case carpenter:
              condition =  (cellI === i && cellJ === j - 1) || (cellI === i + 1 && cellJ === j) || (cellI === i && cellJ === j + 1)
                          || (cellI === i - 1 && cellJ === j) || (cellI === i - 2 && cellJ === j) ||(cellI === i + 2 && cellJ === j);
              break;
            case "S":
                condition2 =  (cellI === i && cellJ === j + 1) || (cellI === i - 1&& cellJ === j) || (cellI === i && cellJ === j - 1)
                || (cellI === i + 1 && cellJ === j);
                break;
            default:
              break;
          }
        }
        //if it is a conditino cell, and it is empty, make it green
        if (condition && cell.props.children == '' && cell.props.className != 'box-black' && cell.props.children != character) {
          return renderBoxButton("box-green", cell.props.children, cell.props.id, cellI, cellJ, color)
        }
        //if it is the character cell, make it green but remember its old color
        else if (condition && cell.props.children == character) {
          beforeChangeRef.current = cell.props.className;
          return (
            <button
              key={cell.props.id}
              className="box-green"
              draggable={cell.props.draggable}
              id={cell.props.id}
              onMouseDown={() => handleMouseDown(cellI, cellJ, character.props.name, color)}
              onMouseUp={handleMouseUp}
              onDragStart={cell.props.onDragStart}
              onDragOver={(e) => handleDragOver(e, "box-green")}
              onDrop={cell.props.onDrop}
            >
              {character}
            </button>
          );
        }
        // Handle conditions to update grid cell based on character movement
        else if (condition && cell.props.id == id) {
          beforeChangeRef.current = cell.props.className;
          return renderBoxButton("box-green", cell.props.children, cell.props.id, cellI, cellJ, color)
        }
        // same but for dark green
        else if (condition2 && cell.props.children == '') {
          return renderBoxButton("box-dark-green", cell.props.children, cell.props.id, cellI, cellJ, color)
        }
        // if it wasn't a target cell keep it the same
        return cell;
      });
    });
   
  };

  // Handle the mouse up event to reset the colors back to their original state
  const handleMouseUp = () => {
    resetColors()
    dragPositionRef.current = null;
  }
  // Reset colors of all cells to their original state based on their position
  const resetColors = () => {
    setGrid((prevGrid) => {
     
      return prevGrid.map((cell) => {
        const [cellI, cellJ] = cell.props.id.split('-').map(Number);
        let className = ''
        if((cell.props.children != '' || cell.props.children == barrier )  && (cell.props.className == 'box-green' || cell.props.className == 'box-dark-green' )){
          className = beforeChangeRef.current
         
        }
        else if(cell.props.className == 'box-green' || cell.props.className == 'box-dark-green'){
          className = determineBackground(cellI, cellJ)
       }
        else{
           className = cell.props.className
        }

        return (
          <button
            className={className}
            draggable={cell.props.draggable}
            id={cell.props.id}
            onMouseDown={() => handleMouseDown(cellI, cellJ, cell.props.children, className)}
            onMouseUp={handleMouseUp}
            onDragStart={cell.props.onDragStart}
            onDragOver={(e) => handleDragOver(e, className)}
            onDrop={(e) => handleDrop(e, cell.props.id, color)}
          >
            {cell.props.children}
          </button>
        );
      });
    });
    sendGridUpdate()
  };

  const handleMoney = (character, color) => {
    let deduction = 0;
 
    switch(character) {
      case minuteMen:
        deduction = 50;
        break;
      case archer:
        deduction = 100;
        break;
      case priest:
        deduction = 300;
        break;
      case miner:
        deduction = 150;
        break;
      case wizard:
        deduction = 200;
        break;
      case necromancer:
        deduction = 250;
        break;
      case carpenter:
        deduction = 150;
        break;
      case barrier:
        deduction = 50;
        break;
      default:
        deduction = 0;
        break;
    }
 
    if (color === 'selector-blue') {
      setBlueMoney(prevBlueMoney => prevBlueMoney - deduction);
    } else {
      setOrangeMoney(prevOrangeMoney => prevOrangeMoney - deduction);
    }

    updateMoneyState()
    //deduction = 0;
  };
 
  const determineBackground = (i, j, content) => {
    let className = '';
    if (content === 'B') {
     className = 'box-black';
     return className
    }  else {
      if (i % 2 === 0) {
        className = j % 2 === 0 ? (j < 3 || j > 10) ? 'box-grey' : 'box-white' : (j > 14 / 2 - 1 ? 'box-orange' : 'box-blue');
      } else {
        className = j % 2 === 1 ? (j < 3 || j > 10) ? 'box-grey' : 'box-white' : (j > 14 / 2 - 1 ? 'box-orange' : 'box-blue');
      }
      if (j === 0) {
        className = 'box-purple';
      } else if (j === 13) {
        className = 'box-red';
      }
    }

    return className;
  };

  const removeMoves = (turn) =>{
  let message = moves > 0 ?  moves : 0
    if(turn == '' ){
      return "Moves Left: " +  message
    }
  }

    return (
      <>
      { !loadRoom ? (
        <>
          <div className="Waiting-Room">Waiting for Opponent...</div>
          <h3 id="room">{`room id: ${room}`}</h3>
        </>
      ): (
        <div id="Outer-Container">
          <h3 id="room">{`room id: ${room}`}</h3>
          <h1 className='turn'>{turn}</h1>
          <h1 className='turn'>{removeMoves(turn)}</h1>
          <div id="above-inventory">
            <div id="moneyLeft">
              <h1 className = "cash-Title">{blueUser} Cash:</h1>
              <h1 className = "cash" >${blueMoney}</h1>
              </div>
            <div id="board-box">{grid}</div>
            <div id="moneyRight">
            <h1 className = "cash-Title">{orangeUser} Cash:</h1>
            <h1 className = "cash">${orangeMoney}</h1>
            </div>
          </div>
          {showBelowInv ? (
            <Inventory
              color={color}
              handleDragStart={handleDragStart}
              setNewColor={setNewColor}
              updateSideState={updateSideState}
            />
          ) : (
            <Abilities
              color={color}
              handleDragStart={handleDragStart}
              setNewColor={setNewColor}
              updateSideState={updateSideState}
            />
          )}
        </div>
        ) }
      </>
    )
  }
export default App
