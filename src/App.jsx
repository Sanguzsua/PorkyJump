import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const GRAVITY = 1.1;
const JUMP_STRENGTH = 15;
const OBSTACLE_INTERVAL = 1200; // ms
const OBSTACLE_SPEED_BASE = 3.2;

function App() {
  const [pigY, setPigY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameSize, setGameSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const pigYRef = useRef(pigY);
  const velocityRef = useRef(velocity);

  useEffect(() => {
    pigYRef.current = pigY;
  }, [pigY]);
  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  // Actualiza el tamaño del juego cuando la ventana cambia de tamaño
  useEffect(() => {
    const handleResize = () => {
      setGameSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const jump = () => {
    if (!gameOver) setVelocity(JUMP_STRENGTH);
  };

  useEffect(() => {
    if (gameOver) return;
    const gameLoop = setInterval(() => {
      let newVelocity = velocityRef.current - GRAVITY;
      let newPigY = pigYRef.current + newVelocity;

      if (newPigY < 0) {
        newPigY = 0;
        newVelocity = 0;
      }

      setPigY(newPigY);
      setVelocity(newVelocity);

      setObstacles((prev) => {
        const speed = OBSTACLE_SPEED_BASE + Math.min(score * 0.13, 6);
        const updated = prev.map(obs => ({ ...obs, x: obs.x - speed })).filter(obs => obs.x + 22 > 0);
        
        updated.forEach(obs => {
          if (!obs.scored && obs.x + 22 < 30) {
            obs.scored = true;
            setScore(s => s + 1);
          }
        });

        const pigX = 30;
        const pigSize = 36;
        const groundHeight = 32;
        const obstacleWidth = 22;
        const obstacleHeight = 38;

        const pigBottom = groundHeight + newPigY;
        const pigTop = pigBottom + pigSize;
        const pigLeft = pigX;
        const pigRight = pigX + pigSize;

        for (let obs of updated) {
          const obsLeft = obs.x;
          const obsRight = obs.x + obstacleWidth;
          const obsBottom = groundHeight;
          const obsTop = groundHeight + obstacleHeight;
          
          const horizontalOverlap = pigRight > obsLeft && pigLeft < obsRight;
          const verticalOverlap = pigTop > obsBottom && pigBottom < obsTop;

          if (horizontalOverlap && verticalOverlap) {
            setGameOver(true);
            return updated;
          }
        }
        return updated;
      });
    }, 30);
    return () => clearInterval(gameLoop);
  }, [gameOver, score]);

  useEffect(() => {
    if (gameOver) return;
    const spawnInterval = setInterval(() => {
      setObstacles(prev => [...prev, { x: 340, scored: false }]);
    }, OBSTACLE_INTERVAL);
    return () => clearInterval(spawnInterval);
  }, [gameOver]);

  const resetGame = () => {
    setPigY(0);
    setVelocity(0);
    setObstacles([]);
    setGameOver(false);
    setScore(0);
  };

  // Se calculan los estilos de manera dinámica
  const pigStyle = {
    left: `30px`,
    bottom: `${32 + pigY}px`,
    width: `${36}px`,
    height: `${36}px`,
  };

  const obstacleStyle = (x) => ({
    left: `${x}px`,
    bottom: `${32}px`,
    width: `${22}px`,
    height: `${38}px`,
  });

  const gameContainerStyle = {
    width: `${340}px`,
    height: `${220}px`,
  };

  return (
    <div className="game-container" onClick={jump} onTouchStart={jump} style={gameContainerStyle}>
      <div className="ground" />
      <div className="pig" style={pigStyle} />
      {obstacles.map((obs, i) => (
        <div key={i} className="obstacle" style={obstacleStyle(obs.x)} />
      ))}
      <div className="score">{score}</div>
      {gameOver && (
        <div className="game-over">
          ¡Game Over!<br />
          <span>Puntuación: {score}</span><br />
          <button onClick={resetGame}>Reiniciar</button>
        </div>
      )}
      {score === 0 && !gameOver && (
        <div className="start-msg">¡Toca para saltar!</div>
      )}
    </div>
  );
}

export default App;