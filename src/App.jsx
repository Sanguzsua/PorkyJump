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
  const [windowW, setWindowW] = useState(window.innerWidth);
  // Responsive: actualizar tamaño
  useEffect(() => {
    const handleResize = () => setWindowW(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // referencias para valores actuales (evitar estado viejo)
  const pigYRef = useRef(pigY);
  const velocityRef = useRef(velocity);
  const obstaclesRef = useRef(obstacles);

  useEffect(() => {
    pigYRef.current = pigY;
  }, [pigY]);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const jump = () => {
    if (!gameOver) {
      setVelocity(JUMP_STRENGTH);
    }
  };

  // Bucle del juego con velocidad progresiva
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      // Física del cerdito
      let newVelocity = velocityRef.current - GRAVITY;
      let newPigY = pigYRef.current + newVelocity;

      if (newPigY < 0) {
        newPigY = 0;
        newVelocity = 0;
      }

      setPigY(newPigY);
      setVelocity(newVelocity);

      // Velocidad progresiva
      const speed = OBSTACLE_SPEED_BASE + Math.min(score * 0.13, 6);

      // Obstáculos en movimiento
      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({
            ...obs,
            x: obs.x - speed,
            passed: obs.passed || obs.x + OBSTACLE_WIDTH < 30,
          }))
          .filter((obs) => obs.x + OBSTACLE_WIDTH > 0);

        // detectar score
        updated.forEach((obs) => {
          if (!obs.scored && obs.x + OBSTACLE_WIDTH < 30) {
            obs.scored = true;
            setScore((s) => s + 1);
          }
        });

        // detectar colisión
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

          const horizontalOverlap =
            pigRight > obsLeft && pigLeft < obsRight;
          const verticalOverlap =
            pigTop > obsBottom && pigBottom < obsTop;

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

  // Spawner de obstáculos
  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      setObstacles((prev) => [
        ...prev,
        { x: GAME_WIDTH, scored: false },
      ]);
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

  // Responsive scaling
  const scale = Math.min(1, windowW / (GAME_WIDTH + 16));

  return (
    <div
      style={{
        width: GAME_WIDTH * scale,
        height: GAME_HEIGHT * scale,
        background: "linear-gradient(to top, #b3e0ff 70%, #e6f7ff 100%)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        margin: "0 auto",
        borderRadius: 18 * scale,
        boxShadow: "0 4px 24px #0002",
        border: "2px solid #aee",
        touchAction: "manipulation",
        maxWidth: "100vw",
        maxHeight: "90vh",
      }}
      onClick={jump}
      onTouchStart={jump}
    >
      {/* Suelo con textura */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: GROUND_HEIGHT * scale,
          background:
            "repeating-linear-gradient(45deg, #e0cda9, #e0cda9 12px, #d1bfa3 12px, #d1bfa3 24px)",
          borderTop: `${2 * scale}px solid #bfa76f`,
          boxShadow: `0 -2px 8px #0002`,
        }}
      />
      {/* Cerdito caricaturesco */}
      <div
        style={{
          position: "absolute",
          left: 30 * scale,
          bottom: GROUND_HEIGHT * scale + pigY * scale,
          width: PIG_SIZE * scale,
          height: PIG_SIZE * scale,
          background: "pink",
          borderRadius: "50% 50% 60% 60%/60% 60% 100% 100%",
          border: `${2 * scale}px solid #e48`,
          boxShadow: `0 4px 8px #0002`,
          zIndex: 2,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {/* Orejas */}
        <div
          style={{
            position: "absolute",
            top: -10 * scale,
            left: 5 * scale,
            width: 8 * scale,
            height: 12 * scale,
            background: "#f9b",
            borderRadius: "60% 60% 40% 40%",
            border: `${1.2 * scale}px solid #e48`,
            transform: "rotate(-18deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -10 * scale,
            right: 5 * scale,
            width: 8 * scale,
            height: 12 * scale,
            background: "#f9b",
            borderRadius: "60% 60% 40% 40%",
            border: `${1.2 * scale}px solid #e48`,
            transform: "rotate(18deg)",
          }}
        />
        {/* Nariz */}
        <div
          style={{
            position: "absolute",
            bottom: 4 * scale,
            left: 10 * scale,
            width: 12 * scale,
            height: 8 * scale,
            background: "#f9b",
            borderRadius: "50%",
            border: `${1 * scale}px solid #e48`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <div
            style={{
              width: 2 * scale,
              height: 4 * scale,
              background: "#e48",
              borderRadius: "50%",
              margin: "0 1px",
            }}
          />
          <div
            style={{
              width: 2 * scale,
              height: 4 * scale,
              background: "#e48",
              borderRadius: "50%",
              margin: "0 1px",
            }}
          />
        </div>
        {/* Ojos */}
        <div
          style={{
            position: "absolute",
            top: 8 * scale,
            left: 7 * scale,
            width: 3 * scale,
            height: 3 * scale,
            background: "#333",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8 * scale,
            left: 16 * scale,
            width: 3 * scale,
            height: 3 * scale,
            background: "#333",
            borderRadius: "50%",
          }}
        />
        {/* Cola */}
        <div
          style={{
            position: "absolute",
            right: -6 * scale,
            bottom: 8 * scale,
            width: 8 * scale,
            height: 8 * scale,
            border: `${1.2 * scale}px solid #e48`,
            borderRadius: "50%",
            borderLeft: "none",
            borderTop: "none",
            transform: "rotate(30deg)",
          }}
        />
      </div>
      {/* Obstáculos con diseño */}
      {obstacles.map((obs, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: obs.x * scale,
            bottom: GROUND_HEIGHT * scale,
            width: OBSTACLE_WIDTH * scale,
            height: OBSTACLE_HEIGHT * scale,
            background:
              "repeating-linear-gradient(90deg, #7a4, #7a4 8px, #5a3 8px, #5a3 16px)",
            border: `${1.2 * scale}px solid #473`,
            borderRadius: `${3 * scale}px ${3 * scale}px 2px 2px`,
            boxShadow: `0 2px 8px #0002`,
            zIndex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Tope blanco */}
          <div
            style={{
              width: "80%",
              height: 4 * scale,
              background: "#fff",
              borderRadius: `${2 * scale}px ${2 * scale}px 2px 2px`,
              marginBottom: 1 * scale,
            }}
          />
        </div>
      ))}
      {/* Score */}
      <div
        style={{
          position: "absolute",
          top: 8 * scale,
          left: 12 * scale,
          color: "#333",
          fontWeight: "bold",
          fontSize: 18 * scale,
          textShadow: "1px 1px 0 #fff, 2px 2px 4px #0002",
          zIndex: 10,
          userSelect: "none",
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
            background: "rgba(255,255,255,0.92)",
            padding: `${14 * scale}px ${18 * scale}px` ,
            borderRadius: `${10 * scale}px`,
            boxShadow: `0 2px 12px #0003`,
            textAlign: "center",
            zIndex: 20,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: 20 * scale, color: "#c33" }}>¡Game Over!</p>
          <div style={{ color: "#333", fontSize: 15 * scale, margin: `${6 * scale}px 0` }}>Puntuación: {score}</div>
          <button
            onClick={resetGame}
            style={{
              fontSize: 15 * scale,
              padding: `${5 * scale}px ${14 * scale}px`,
              borderRadius: `${6 * scale}px`,
              border: "none",
              background: "#7a4",
              color: "#fff",
              fontWeight: "bold",
              boxShadow: `0 2px 6px #0002`,
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
            fontSize: 16 * scale,
            fontWeight: "bold",
            textShadow: "1px 1px 0 #fff, 2px 2px 4px #0002",
            zIndex: 20,
            background: "rgba(255,255,255,0.7)",
            padding: `${8 * scale}px 0`,
            borderRadius: `${8 * scale}px`,
          }}
        >
          ¡Toca para saltar!
        </div>
      )}
    </div>
  );
}

export default App;
