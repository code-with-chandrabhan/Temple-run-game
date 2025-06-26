import React, { useRef, useEffect, useState } from "react";
import orders from "./Appes.json";

const App = () => {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("🚴‍♂️ Press arrows to deliver!");
  const [orderIndex, setOrderIndex] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const bike = { x: 100, y: 300, width: 50, height: 35, speed: 3 };
    let keys = {};
    let bounce = 0;
    let hasDelivered = false;

    const bikeImg = new Image();
    bikeImg.src = "/bike.png";

    const ding = new Audio("/ding.mp3");

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 320, canvas.width, 80);

      // Destination
      const dest = { ...orders[orderIndex], width: 30, height: 30 };
      ctx.fillStyle = "#f87171";
      ctx.fillRect(dest.x, dest.y, dest.width, dest.height);

      // Bike
      if (bikeImg.complete) {
        ctx.drawImage(bikeImg, bike.x, bike.y + bounce, bike.width, bike.height);
      } else {
        ctx.fillStyle = "#facc15";
        ctx.fillRect(bike.x, bike.y + bounce, bike.width, bike.height);
      }
    };

    const update = () => {
      if (fuel <= 0 || timeLeft <= 0 || orderIndex >= orders.length) return;

      let moved = false;

      if (keys["ArrowRight"]) {
        bike.x += bike.speed;
        moved = true;
      }
      if (keys["ArrowLeft"]) {
        bike.x -= bike.speed;
        moved = true;
      }
      if (keys["ArrowUp"]) {
        bike.y -= bike.speed;
        moved = true;
      }
      if (keys["ArrowDown"]) {
        bike.y += bike.speed;
        moved = true;
      }

      if (moved) {
        setFuel((prev) => Math.max(prev - 0.2, 0));
        bounce = Math.sin(Date.now() / 100) * 2;
      } else {
        bounce = 0;
      }

      // Keep in bounds
      bike.x = Math.max(0, Math.min(canvas.width - bike.width, bike.x));
      bike.y = Math.max(0, Math.min(canvas.height - bike.height, bike.y));

      const d = { ...orders[orderIndex], width: 30, height: 30 };
      const isHit =
        bike.x < d.x + d.width &&
        bike.x + bike.width > d.x &&
        bike.y < d.y + d.height &&
        bike.y + bike.height > d.y;

      if (isHit && !hasDelivered) {
        hasDelivered = true;
        ding.play();
        setScore((prev) => prev + 10);
        setFuel(100);

        if (orderIndex < orders.length - 1) {
          setTimeout(() => {
            setOrderIndex((prev) => prev + 1);
            setStatus(`✅ Delivered! Next order loaded.`);
          }, 300);
        } else {
          setStatus("🎉 All deliveries completed!");
        }

        bike.x = 100;
        bike.y = 300;
      }

      draw();
      requestAnimationFrame(update);
    };

    const down = (e) => {
      keys[e.key] = true;
    };
    const up = (e) => {
      keys[e.key] = false;
      hasDelivered = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    update();

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [orderIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("⏰ Time’s up! Game Over.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [orderIndex]);

  const resetGame = () => {
    setOrderIndex(0);
    setFuel(100);
    setScore(0);
    setTimeLeft(30);
    setStatus("🚴‍♂️ Game Restarted!");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">🚴 Z-Delivery Game</h1>
      <div className="flex gap-6 text-lg mb-2">
        <p>⛽ Fuel: {Math.floor(fuel)}</p>
        <p>⭐ Score: {score}</p>
        <p>⏰ Time: {timeLeft}s</p>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border-2 border-yellow-400 bg-black"
      />
      <p className="mt-4">{status}</p>
      <button
        onClick={resetGame}
        className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded"
      >
        🔁 Restart
      </button>
    </div>
  );
};

export default App;
