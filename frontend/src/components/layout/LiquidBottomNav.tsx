import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  PlusCircle, 
  Search, 
  Clock, 
  User, 
  BarChart3, 
  Inbox, 
  Building, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LiquidBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const LiquidBottomNav: React.FC<LiquidBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  const isStaffOrAdmin = user && ['lecturer', 'warden', 'hod', 'mentor', 'principal'].includes(user.role);

  const studentNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'submit', label: 'Submit', icon: PlusCircle },
    { id: 'track', label: 'Track', icon: Search },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'complaints', label: 'Complaints', icon: Inbox },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const items = isStaffOrAdmin ? adminNavItems : studentNavItems;

  const handleTabClick = (tabId: string) => {
    if (!user && (tabId === 'submit' || tabId === 'history' || tabId === 'profile' || tabId === 'complaints' || tabId === 'analytics' || tabId === 'overview')) {
      onOpenAuth();
      return;
    }
    setCurrentTab(tabId);
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 safe-bottom">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bottom-nav-glass relative flex items-center gap-1 sm:gap-2 rounded-full p-1.5 sm:p-2 ring-1 ring-white/10"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="group relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-medium transition-colors focus:outline-none"
            >
              {/* Clean Frosted Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="liquid-pill"
                  className="absolute inset-0 rounded-full bg-white/10 border border-white/15"
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <Icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-silver-400 group-hover:text-silver-200'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`relative z-10 hidden sm:inline-block tracking-normal transition-colors ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-silver-400 group-hover:text-silver-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
