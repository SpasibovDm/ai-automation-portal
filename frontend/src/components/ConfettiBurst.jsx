import React, { useMemo } from "react";

const colors = ["#6366f1", "#22c55e", "#f97316", "#0ea5e9", "#f43f5e"];

const ConfettiBurst = ({ active = false }) => {
  const pieces = useMemo(() => {
    if (!active) {
      return [];
    }
    return Array.from({ length: 18 }).map((_, index) => {
      const angle = Math.random() * 360;
      const distance = 80 + Math.random() * 80;
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;
      return {
        id: `confetti-${index}`,
        color: colors[index % colors.length],
        style: {
          "--tx": `${x}px`,
          "--ty": `${y}px`,
          "--rot": `${Math.random() * 360}deg`,
          animationDelay: `${Math.random() * 0.15}s`,
        },
      };
    });
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{ backgroundColor: piece.color, ...piece.style }}
        />
      ))}
    </div>
  );
};

export default ConfettiBurst;
