import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur-xl transition-[border-color,background-color] duration-150 hover:border-white/20 hover:bg-navy-900/80 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
