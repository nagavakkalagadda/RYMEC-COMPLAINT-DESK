import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface GlassSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface GlassSelectProps {
  label?: string;
  badge?: string;
  options: GlassSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dropdownAlign?: 'left' | 'right' | 'auto';
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  badge,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  dropdownAlign = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${isOpen ? 'z-[60]' : 'z-[10]'} ${className}`} ref={containerRef}>
      {(label || badge) && (
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          {label && (
            <label className="text-xs font-semibold text-silver-200">
              {label}
            </label>
          )}
          {badge && (
            <span className="text-[10px] text-cyan-400 font-semibold">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border py-2.5 px-3.5 text-xs font-medium transition-all text-left cursor-pointer ${
          isOpen
            ? 'border-cyan-400/80 bg-navy-900/90 shadow-lg shadow-cyan-950/30 text-white'
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="text-sm shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-cyan-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute top-full mt-1.5 z-[100] rounded-2xl border border-white/15 bg-navy-900/98 backdrop-blur-2xl shadow-2xl p-1.5 max-h-72 overflow-y-auto custom-scrollbar w-full min-w-full ${
              dropdownAlign === 'right' 
                ? 'right-0' 
                : 'left-0'
            }`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all text-left cursor-pointer mb-0.5 last:mb-0 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
                      : 'text-silver-300 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {opt.icon && (
                      <span className="text-sm shrink-0">{opt.icon}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-silver-400 font-normal truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
