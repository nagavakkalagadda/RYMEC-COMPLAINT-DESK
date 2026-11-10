import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  tilt?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  tilt = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setMousePos({ x: percentX, y: percentY });

    // Subtle 3D tilt
    const rX = ((y / rect.height) - 0.5) * -6;
    const rY = ((x / rect.width) - 0.5) * 6;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className={`relative overflow-hidden rounded-2xl liquid-glass-card p-6 ${
        glow ? 'border-white/20' : 'border-white/10'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Dynamic Specular Light Glint */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.05), transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
