"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Zap, Flame, Skull, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

const CELL = { G: "G", Y: "Y", R: "R" };

// Generate initial maze
function generateMaze(size = 7) {
  const grid = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      if (i === 0 && j === 0) row.push(CELL.G);
      else if (i === size - 1 && j === size - 1) row.push(CELL.G);
      else {
        const rand = Math.random();
        if (rand < 0.5) row.push(CELL.G);
        else if (rand < 0.8) row.push(CELL.Y);
        else row.push(CELL.R);
      }
    }
    grid.push(row);
  }
  return grid;
}

const cloneGrid = (grid) => grid.map(row => [...row]);

function getAdjacent(r, c, size) {
  const adj = [];
  if (r > 0) adj.push([r - 1, c]);
  if (r < size - 1) adj.push([r + 1, c]);
  if (c > 0) adj.push([r, c - 1]);
  if (c < size - 1) adj.push([r, c + 1]);
  return adj;
}

function applyTransformation(grid, direction, playerPos, size, lastDirection) {
  let newGrid = cloneGrid(grid);
  
  if (direction === "right") {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === CELL.Y) newGrid[i][j] = CELL.R;
      }
    }
    const adj = getAdjacent(playerPos.r, playerPos.c, size);
    adj.forEach(([r, c]) => {
      if (newGrid[r][c] === CELL.G) newGrid[r][c] = CELL.Y;
    });
    
    if (lastDirection === "down") {
      if (playerPos.c + 1 < size) {
        for (let i = Math.max(0, playerPos.r - 1); i <= Math.min(size - 1, playerPos.r + 1); i++) {
          if (newGrid[i][playerPos.c + 1] !== CELL.R) {
            newGrid[i][playerPos.c + 1] = CELL.R;
          }
        }
      }
    }
  }
  
  else if (direction === "down") {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === CELL.R) newGrid[i][j] = CELL.G;
      }
    }
    const scrambleRow = 3;
    const row = [...newGrid[scrambleRow]];
    for (let i = row.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [row[i], row[j]] = [row[j], row[i]];
    }
    newGrid[scrambleRow] = row;
    
    if (lastDirection === "right") {
      if (playerPos.r + 1 < size) {
        for (let j = Math.max(0, playerPos.c - 1); j <= Math.min(size - 1, playerPos.c + 1); j++) {
          if (newGrid[playerPos.r + 1][j] !== CELL.R) {
            newGrid[playerPos.r + 1][j] = CELL.R;
          }
        }
      }
    }
  }
  
  else if (direction === "up") {
    const yellowCells = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === CELL.Y) {
          yellowCells.push([i, j]);
        }
      }
    }
    
    const numYellowToConvert = Math.floor(yellowCells.length * 0.5);
    const shuffledYellow = [...yellowCells].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numYellowToConvert; i++) {
      const [r, c] = shuffledYellow[i];
      newGrid[r][c] = CELL.G;
    }
    
    const mid = Math.floor(size / 2);
    const leftRedCells = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < mid; j++) {
        if (newGrid[i][j] === CELL.R) {
          leftRedCells.push([i, j]);
        }
      }
    }
    
    const numRedToConvert = Math.floor(leftRedCells.length * 0.5);
    const shuffledRed = [...leftRedCells].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numRedToConvert; i++) {
      const [r, c] = shuffledRed[i];
      newGrid[r][c] = CELL.G;
    }
  }
  
  else if (direction === "left") {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === CELL.G) newGrid[i][j] = CELL.Y;
      }
    }
    const spreads = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === CELL.R) {
          const adj = getAdjacent(i, j, size);
          if (adj.length > 0) {
            const target = adj[0];
            spreads.push(target);
          }
        }
      }
    }
    spreads.forEach(([r, c]) => {
      if (newGrid[r][c] !== CELL.R) newGrid[r][c] = CELL.R;
    });
  }
  
  return newGrid;
}

function applyQuantumCollapse(grid, size) {
  const newGrid = cloneGrid(grid);
  const startR = 0, endR = Math.floor(size / 2);
  const startC = Math.ceil(size / 2), endC = size;
  
  for (let i = startR; i < endR; i++) {
    for (let j = startC; j < endC; j++) {
      if (newGrid[i][j] === CELL.G) newGrid[i][j] = CELL.R;
      else if (newGrid[i][j] === CELL.R) newGrid[i][j] = CELL.G;
    }
  }
  return newGrid;
}

function calculateEntropy(grid) {
  let total = 0, red = 0;
  grid.forEach(row => {
    row.forEach(cell => {
      total++;
      if (cell === CELL.R) red++;
    });
  });
  return (red / total) * 100;
}

function Cell({ cell, isPlayer, isExit, isStart, isVisited, isPermanentRed }) {
  const getColor = () => {
    if (isStart) return "bg-blue-500 border-blue-400";
    if (isExit) return "bg-purple-600 border-purple-500";
    if (isPermanentRed) return "bg-red-900 border-red-700";
    if (cell === CELL.G) return "bg-emerald-500 border-emerald-400";
    if (cell === CELL.Y) return "bg-amber-500 border-amber-400";
    if (cell === CELL.R) return "bg-rose-600 border-rose-500";
    return "bg-gray-600 border-gray-500";
  };
  
  const getContent = () => {
    if (isPlayer) {
      return <img src="player.png" alt="Player" className="w-12 h-12 object-cover" />;
    }
    if (isStart) return <Rocket className="w-8 h-8 text-white" />;
    if (isExit) {
      return <img src="win.png" alt="Trophy" className="w-15 h-13 text-white" />;
    };
    if (isPermanentRed) return <Skull className="w-8 h-8 text-white" />;
    if (cell === CELL.G) {
      return <img src="safe.png" alt="Safe" className="w-12 h-12 object-cover" />;
    };
    if (cell === CELL.Y) {
      return <img src="break.png" alt="Adventurer" className="w-12 h-12 object-cover" />;
    };;
    if (cell === CELL.R) {
      return <img src="enemy.png" alt="Enemy" className="w-12 h-12 object-cover" />;
    };
    return <span className="text-2xl">⬜</span>;
  };
  
  return (
    <div className={`w-16 h-16 flex items-center justify-center border-2 ${getColor()} ${isPlayer ? "ring-4 ring-cyan-400 scale-110" : ""} ${isVisited ? "opacity-60" : ""}`}>
      {getContent()}
    </div>
  );
}

export default function QuantumMaze() {
  const size = 7;
  const [grid, setGrid] = useState(() => generateMaze(size));
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [exit] = useState({ r: size - 1, c: size - 1 });
  const [visited, setVisited] = useState(new Set(["0,0"]));
  const [permanentRed, setPermanentRed] = useState(new Set());
  const [moveCount, setMoveCount] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);
  const [message, setMessage] = useState("DISCOVER THE RULES!");
  const [gameOver, setGameOver] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [won, setWon] = useState(false);
  const router = useRouter();

    useEffect(() => {
    const access = sessionStorage.getItem("maze_access");
    if (access !== "granted") {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    const style = document.createElement('style');
    style.textContent = `
      .pixelated {
        font-family: 'Press Start 2P', monospace !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const entropy = calculateEntropy(grid);
    if (entropy > 40 && !gameOver) {
      setGameOver(true);
      setMessage(`ENTROPY OVERLOAD! GAME OVER!`);
    }
  }, [grid, gameOver]);

  useEffect(() => {
    if (moveCount > 25 && !gameOver && !won) {
      setGameOver(true);
      setMessage(`MOVE LIMIT EXCEEDED! GAME OVER!`);
    }
  }, [moveCount, gameOver, won]);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (map[e.key]) {
        e.preventDefault();
        handleMove(map[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pos, grid, gameOver, moveCount, visited, permanentRed, lastDirection]);

  const handleMove = (direction) => {
    if (gameOver) return;
    
    const delta = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[direction];
    const nr = pos.r + delta[0];
    const nc = pos.c + delta[1];
    
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
      setMessage("MAZE BOUNDARY!");
      return;
    }
    
    if (grid[nr][nc] === CELL.R) {
      setMessage("BLOCKED BY RED!");
      return;
    }
    
    const posKey = `${nr},${nc}`;
    const wasVisited = visited.has(posKey);
    
    const newPos = { r: nr, c: nc };
    setPos(newPos);
    
    let newGrid = applyTransformation(grid, direction, newPos, size, lastDirection);
    
    setLastDirection(direction);
    
    if (wasVisited && !permanentRed.has(posKey)) {
      newGrid[nr][nc] = CELL.R;
      setPermanentRed(prev => new Set([...prev, posKey]));
    }
    
    setVisited(prev => new Set([...prev, posKey]));
    
    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);
    
    if (newMoveCount % 4 === 0) {
      newGrid = applyQuantumCollapse(newGrid, size);
      setMessage(`QUANTUM COLLAPSE!`);
    } else {
      setMessage(`MOVED ${direction.toUpperCase()}`);
    }
    
    setGrid(newGrid);

    if (nr === exit.r && nc === exit.c) {
      setWon(true);
      setGameOver(true);
      setMessage(`VICTORY IN ${newMoveCount} MOVES!`);
      setShowVictoryModal(true);
    }
    
    const canMove = [[-1,0], [1,0], [0,-1], [0,1]].some(([dr, dc]) => {
      const r = nr + dr, c = nc + dc;
      return r >= 0 && r < size && c >= 0 && c < size && newGrid[r][c] !== CELL.R;
    });
    
    if (!canMove && !won) {
      setGameOver(true);
      setMessage("NO VALID MOVES! TRAPPED!");
    }
  };

  const reset = () => {
    setGrid(generateMaze(size));
    setPos({ r: 0, c: 0 });
    setVisited(new Set(["0,0"]));
    setPermanentRed(new Set());
    setMoveCount(0);
    setLastDirection(null);
    setGameOver(false);
    setWon(false);
    setMessage("DISCOVER THE RULES!");
  };

  const entropy = calculateEntropy(grid);

  return (
    <div className="min-h-screen bg-[#0a1628] p-4 relative overflow-hidden">
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.5) 1px, transparent 1px, transparent 2px)'
        }}
      />
      
      <div className="w-full max-w-[1800px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl text-cyan-400 pixelated mb-2" 
            style={{ textShadow: '0 0 10px rgba(0,217,255,0.8)' }}>
            QUANTUM MAZE
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left - Maze */}
          <div className="flex flex-col items-center justify-center">
            {/* Win/Loss Status - TOP */}
            {won && (
              <div className="border-4 border-green-400 bg-green-900/90 p-3 mb-6 w-full">
                <h2 className="pixelated text-green-400 text-xl text-center mb-2"> VICTORY! </h2>
                <p className="pixelated text-white text-md text-center">MOVES: {moveCount}</p>
              </div>
            )}

            {(gameOver && !won) && (
              <div className="border-4 border-red-400 bg-red-900/90 p-3 mb-6 w-full">
                <h2 className="pixelated text-red-400 text-xl text-center mb-2">DEFEATED</h2>
                <p className="pixelated text-white text-sm text-center">{message}</p>
              </div>
            )}

            <div className="bg-[#1a2742]/80 p-6 border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,217,255,0.5)] inline-block">
              {grid.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => (
                    <Cell
                      key={c}
                      cell={cell}
                      isPlayer={pos.r === r && pos.c === c}
                      isStart={r === 0 && c === 0}
                      isExit={exit.r === r && exit.c === c}
                      isVisited={visited.has(`${r},${c}`)}
                      isPermanentRed={permanentRed.has(`${r},${c}`)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="mt-6 border-2 border-cyan-400 bg-[#1a2742]/80 p-4 w-full">
              <p className="text-center text-cyan-300 pixelated text-xs">
                {message}
              </p>
            </div>
          </div>

          {/* Right - Stats & Controls */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="border-2 border-cyan-400 bg-[#1a2742]/80 p-4">
              <div className="space-y-3 pixelated text-xs text-cyan-300">
                <div className="flex justify-between">
                  <span>MOVES</span>
                  <span className={`${moveCount > 20 ? 'text-red-400' : 'text-white'}`}>{moveCount}/25</span>
                </div>
                <div className="flex justify-between">
                  <span>ENTROPY</span>
                  <span className={`${entropy > 35 ? 'text-red-400' : 'text-white'}`}>{entropy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>COLLAPSE</span>
                  <span className="text-white">{4 - (moveCount % 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>POSITION</span>
                  <span className="text-white">({pos.r},{pos.c})</span>
                </div>
              </div>
            </div>

            {/* Loss Conditions Warning */}
            <div className="border-2 border-red-400 bg-red-900/30 p-4">
              <h3 className="pixelated text-red-400 text-xs mb-3 text-center">LOSS CONDITIONS</h3>
              <div className="space-y-2 pixelated text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>ENTROPY &gt; 40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4" />
                  <span>MOVES &gt; 25</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-2 border-cyan-400 bg-[#1a2742]/80 p-4">
              <h3 className="pixelated text-cyan-400 text-sm mb-4 text-center">CONTROLS</h3>
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => handleMove("up")}
                  disabled={gameOver}
                  className="px-6 py-2 bg-cyan-400 text-[#0a1628] pixelated text-xs hover:bg-cyan-300 disabled:opacity-50 transition-all w-32"
                >
                  UP
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMove("left")}
                    disabled={gameOver}
                    className="px-6 py-2 bg-cyan-400 text-[#0a1628] pixelated text-xs hover:bg-cyan-300 disabled:opacity-50 transition-all w-32"
                  >
                    LEFT
                  </button>
                  <button 
                    onClick={() => handleMove("right")}
                    disabled={gameOver}
                    className="px-6 py-2 bg-cyan-400 text-[#0a1628] pixelated text-xs hover:bg-cyan-300 disabled:opacity-50 transition-all w-32"
                  >
                    RIGHT
                  </button>
                </div>
                <button 
                  onClick={() => handleMove("down")}
                  disabled={gameOver}
                  className="px-6 py-2 bg-cyan-400 text-[#0a1628] pixelated text-xs hover:bg-cyan-300 disabled:opacity-50 transition-all w-32"
                >
                  DOWN
                </button>
                <button 
                  onClick={reset}
                  className="mt-4 px-6 py-2 bg-red-600 text-white pixelated text-xs hover:bg-red-500 transition-all w-full"
                >
                  RESTART
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="border-2 border-cyan-400 bg-[#1a2742]/80 p-4">
              <h3 className="pixelated text-cyan-400 text-xs mb-3">LEGEND</h3>
              <div className="space-y-2 pixelated text-xs text-cyan-300">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  <span>START</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span>FINISH</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="safe.png" alt="Safe" className="w-5 h-5 object-cover" />
                  <span>GREEN SAFE</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="break.png" alt="Safe" className="w-5 h-5 object-cover" />
                  <span>YELLOW UNSTABLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="enemy.png" alt="Safe" className="w-5 h-5 object-cover" />
                  <span>RED BLOCKED</span>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4" />
                  <span>PERMANENT RED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Info Section - Bottom */}
        <div className="mt-8 border-4 border-cyan-400 bg-[#1a2742]/90 p-6">
          <h2 className="pixelated text-cyan-400 text-lg mb-4 text-center">GAME INFORMATION</h2>
          <div className="grid md:grid-cols-2 gap-6 text-cyan-300 pixelated text-xs leading-relaxed">
            <div className="space-y-4">
              <div>
                <h3 className="text-white mb-2">OBJECTIVE</h3>
                <p>Navigate from the starting position to reach the trophy at the bottom-right corner. Plan your route carefully - the maze is alive and changes with every move you make.</p>
              </div>
              <div>
                <h3 className="text-white mb-2">THE MAZE</h3>
                <p>The maze consists of three types of cells: Green (safe), Yellow (unstable), and Red (blocked). Each direction you move triggers unique transformations across the entire grid.</p>
              </div>
              <div>
                <h3 className="text-white mb-2">DANGER ZONES</h3>
                <p>Revisiting a cell turns it permanently red, blocking future passage. Keep track of your path to avoid trapping yourself.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-white mb-2">QUANTUM COLLAPSE</h3>
                <p>Every 4 moves triggers a Quantum Collapse event that swaps colors in a specific region of the maze. Time your moves strategically around these predictable disruptions.</p>
              </div>
              <div>
                <h3 className="text-white mb-2">ENTROPY</h3>
                <p>Entropy measures the percentage of red cells. If it exceeds 40%, chaos overwhelms the maze and you lose. Balance exploration with caution.</p>
              </div>
              <div>
                <h3 className="text-white mb-2">STRATEGY</h3>
                <p>Watch the patterns. Each move direction has consistent effects. Observe how the maze responds to your choices and adapt your strategy accordingly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Victory Modal */}
{showVictoryModal && (
  <div className="fixed inset-0 bg-black/80 bg-opacity-90 flex items-center justify-center z-50">
    <div className="border-4 border-cyan-400 bg-[#0a1628] p-8 max-w-md shadow-[0_0_50px_rgba(0,217,255,0.8)]">
      <h2 className="text-cyan-400 text-2xl mb-4 text-center pixelated" style={{ textShadow: '0 0 20px rgba(0,217,255,1)' }}>
        VICTORY! 
      </h2>
      <div className="text-cyan-300 text-xs pixelated mb-6 text-center space-y-3">
        <p className="text-lg text-white">Congratulations!</p>
        <p>You escaped the Quantum Maze!</p>
        <div className="border-2 border-cyan-400 bg-cyan-900/30 p-4 mt-4">
          <p className="text-white text-sm">TOTAL MOVES: {moveCount}</p>
          <p className="text-white text-sm">FINAL ENTROPY: {entropy.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}