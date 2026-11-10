import React from 'react';
import { AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { TrendAlert } from '../../types';

interface TrendAlertBannerProps {
  alerts: TrendAlert[];
}

export const TrendAlertBanner: React.FC<TrendAlertBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border p-4 shadow-lg flex items-start gap-3 backdrop-blur-xl ${
            alert.severity === 'critical'
              ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/70 via-navy-900/80 to-charcoal-900/90 text-rose-200'
              : 'border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-navy-900/80 to-charcoal-900/90 text-amber-200'
          }`}
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <AlertTriangle className="h-5 w-5 animate-bounce" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider rounded px-2 py-0.5 bg-black/30 border border-white/10">
                AI Pattern Detection
              </span>
              <span className="text-xs font-bold text-white uppercase">
                {alert.category} • {alert.count} Complaints Logged
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
