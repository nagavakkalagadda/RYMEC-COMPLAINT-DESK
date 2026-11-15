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
      className={`ios-glass-card rounded-2xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
