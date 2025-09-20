import React, { useState, useEffect, useRef } from "react";

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
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: "#2196f3",
        position: "relative",
        overflow: "hidden",
        touchAction: "manipulation",
      }}
      onClick={jump}
      onTouchStart={jump}
    >
      {/* Suelo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: GROUND_HEIGHT,
          background: "#388e3c",
        }}
      />
      {/* Cerdito */}
      <div
        style={{
          position: "absolute",
          left: 30,
          bottom: GROUND_HEIGHT + pigY,
          width: PIG_SIZE,
          height: PIG_SIZE,
          background: "#ffb6c1",
          borderRadius: "50%",
        }}
      />
      {/* Obstáculos */}
      {obstacles.map((obs, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: obs.x,
            bottom: GROUND_HEIGHT,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            background: "#795548",
          }}
        />
      ))}
      {/* Score */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "#fff",
          fontWeight: "bold",
          fontSize: 20,
          textShadow: "1px 1px 2px #0008",
        }}
      >
        {score}
      </div>
      {/* Game Over */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: "#fff",
            color: "#c33",
            fontWeight: "bold",
            fontSize: 22,
            padding: 16,
            borderRadius: 8,
            boxShadow: "0 2px 8px #0003",
            textAlign: "center",
          }}
        >
          ¡Game Over!
          <br />
          <span style={{ color: "#333", fontSize: 16 }}>Puntuación: {score}</span>
          <br />
          <button
            onClick={resetGame}
            style={{
              marginTop: 10,
              fontSize: 16,
              padding: "6px 18px",
              borderRadius: 6,
              border: "none",
              background: "#2196f3",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Reiniciar
          </button>
        </div>
      )}
      {/* Mensaje de inicio */}
      {score === 0 && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: 0,
            width: "100%",
            textAlign: "center",
            color: "#333",
            fontSize: 16,
            fontWeight: "bold",
            background: "#fff8",
            padding: 10,
            borderRadius: 8,
          }}
        >
          ¡Toca para saltar!
        </div>
      )}
    </div>
  );
}

export default App;
