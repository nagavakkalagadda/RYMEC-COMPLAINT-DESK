import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const FloatingParticles: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  const particles = [
    { size: 280, x: '8%', y: '12%', color: 'rgba(30, 41, 59, 0.25)', duration: 22 },
    { size: 340, x: '82%', y: '10%', color: 'rgba(15, 23, 42, 0.35)', duration: 26 },
    { size: 260, x: '72%', y: '78%', color: 'rgba(30, 41, 59, 0.2)', duration: 28 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full blur-3xl filter"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
