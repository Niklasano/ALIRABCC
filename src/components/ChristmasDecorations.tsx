import React, { useEffect, useState } from 'react';

const ChristmasDecorations: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{
    id: number;
    left: number;
    animationDuration: number;
    size: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    // Créer 20 flocons de neige avec des positions et vitesses aléatoires
    const flakes = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 20,
      size: 0.5 + Math.random() * 1,
      delay: Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      {/* Flocons de neige */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute text-white opacity-70"
            style={{
              left: `${flake.left}%`,
              fontSize: `${flake.size}rem`,
              animation: `fall ${flake.animationDuration}s linear infinite`,
              animationDelay: `${flake.delay}s`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Décorations de Noël en haut de page */}
      <div className="fixed top-0 left-0 right-0 pointer-events-none z-40 flex justify-around px-4 py-2">
        <span className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>🎄</span>
        <span className="text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</span>
        <span className="text-2xl animate-pulse" style={{ animationDelay: '1s' }}>🎁</span>
        <span className="text-2xl animate-pulse" style={{ animationDelay: '1.5s' }}>🔔</span>
        <span className="text-2xl animate-pulse" style={{ animationDelay: '2s' }}>🎅</span>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default ChristmasDecorations;
