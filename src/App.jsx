import React, { useState, useEffect, useRef } from "react";
import "./App.css"; 

const GAME_WIDTH = 340;
const GAME_HEIGHT = 220;
const GROUND_HEIGHT = 32;
const PIG_SIZE = 36;
const OBSTACLE_WIDTH = 22;
const OBSTACLE_HEIGHT = 38;
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
  const pigYRef = useRef(pigY);
  const velocityRef = useRef(velocity);

  useEffect(() => { pigYRef.current = pigY; }, [pigY]);
  useEffect(() => { velocityRef.current = velocity; }, [velocity]);

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
        const updated = prev.map(obs => ({ ...obs, x: obs.x - speed })).filter(obs => obs.x + OBSTACLE_WIDTH > 0);
        updated.forEach(obs => {
          if (!obs.scored && obs.x + OBSTACLE_WIDTH < 30) {
            obs.scored = true;
            setScore(s => s + 1);
          }
        });
        const pigX = 30;
        const pigBottom = GROUND_HEIGHT + newPigY;
        const pigTop = pigBottom + PIG_SIZE;
        const pigLeft = pigX;
        const pigRight = pigX + PIG_SIZE;
        for (let obs of updated) {
          const obsLeft = obs.x;
          const obsRight = obs.x + OBSTACLE_WIDTH;
          const obsBottom = GROUND_HEIGHT;
          const obsTop = GROUND_HEIGHT + OBSTACLE_HEIGHT;
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
      setObstacles(prev => [...prev, { x: GAME_WIDTH, scored: false }]);
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

    return (
      <div className="game-container" onClick={jump} onTouchStart={jump}>
        <div className="ground" />
        <div
          className="pig"
          style={{
            left: 30,
            bottom: GROUND_HEIGHT + pigY,
            width: PIG_SIZE,
            height: PIG_SIZE,
          }}
        />
        {obstacles.map((obs, i) => (
          <div
            key={i}
            className="obstacle"
            style={{
              left: obs.x,
              bottom: GROUND_HEIGHT,
              width: OBSTACLE_WIDTH,
              height: OBSTACLE_HEIGHT,
            }}
          />
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
