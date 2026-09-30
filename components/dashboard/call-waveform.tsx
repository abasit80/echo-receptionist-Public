"use client";

import { motion } from "framer-motion";

export function CallWaveform({ active = true }: { active?: boolean }) {
  const bars = [12, 22, 16, 28, 18, 26, 14, 24, 20, 30, 16, 22];

  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map((height, index) => (
        <motion.span
          key={index}
          className="w-1 rounded-full bg-success-500"
          animate={
            active
              ? { height: [8, height, 10, height * 0.7, 8] }
              : { height: 8 }
          }
          transition={{
            duration: 1.1,
            repeat: active ? Infinity : 0,
            delay: index * 0.06,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
