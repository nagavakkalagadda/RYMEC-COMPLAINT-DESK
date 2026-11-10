import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../3d/GlassCard';

export const UserProfileView: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-silver-400">
        Please sign in to view your profile settings.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Profile Card */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-royal text-white font-bold text-2xl shadow-sm">
            {user.full_name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase text-silver-300">
                {user.role}
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>

            <p className="text-xs text-silver-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5 text-silver-500" />
              <span>{user.email}</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
              {user.usn_roll && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <span className="text-[10px] text-silver-500 uppercase block">College USN</span>
                  <span className="font-mono font-semibold text-white">{user.usn_roll}</span>
                </div>
              )}
              {user.department && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <span className="text-[10px] text-silver-500 uppercase block">Department</span>
                  <span className="font-semibold text-white truncate block">{user.department}</span>
                </div>
              )}
              {user.hostel_block && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <span className="text-[10px] text-silver-500 uppercase block">Hostel Block</span>
                  <span className="font-semibold text-white">{user.hostel_block}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="pebble-pill flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </GlassCard>

    </div>
  );
};
