"use client";

import { motion } from "framer-motion";

const squares = [
  { size: 168, left: "6%", top: "8%", rotate: [-10, 8, -10], x: [0, 36, 0], y: [0, 28, 0], duration: 16 },
  { size: 110, left: "78%", top: "12%", rotate: [12, -4, 12], x: [0, -28, 0], y: [0, 40, 0], duration: 13 },
  { size: 90, left: "62%", top: "58%", rotate: [-6, 14, -6], x: [0, 22, 0], y: [0, -32, 0], duration: 11 },
  { size: 132, left: "18%", top: "62%", rotate: [4, -12, 4], x: [0, -20, 0], y: [0, -24, 0], duration: 15 },
  { size: 72, left: "42%", top: "22%", rotate: [0, 18, 0], x: [0, 18, 0], y: [0, 22, 0], duration: 10 },
  { size: 58, left: "88%", top: "42%", rotate: [16, 0, 16], x: [0, -16, 0], y: [0, 18, 0], duration: 12 },
  { size: 46, left: "30%", top: "38%", rotate: [-18, 6, -18], x: [0, 14, 0], y: [0, -16, 0], duration: 9 },
];

export function MovingSquares() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {squares.map((square, index) => (
        <motion.span
          key={index}
          className="absolute rounded-2xl border border-gold-400/30 bg-gold-400/15 shadow-[0_8px_24px_rgba(212,160,23,0.08)] dark:border-gold-400/20 dark:bg-gold-500/10"
          style={{
            width: square.size,
            height: square.size,
            left: square.left,
            top: square.top,
          }}
          animate={{
            x: square.x,
            y: square.y,
            rotate: square.rotate,
          }}
          transition={{
            duration: square.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.35,
          }}
        />
      ))}
    </div>
  );
}
