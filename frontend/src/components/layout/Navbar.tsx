import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(res => {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentTab('home')}
          className="group flex cursor-pointer items-center gap-3 transition-transform hover:opacity-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 border border-white/15 text-white shadow-sm">
            <Building2 className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">RYMEC</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-silver-300">
                NAAC A+
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-tight text-silver-400 line-clamp-1">
              Rao Bahadur Y. Mahabaleswarappa Engineering College
            </p>
          </div>
        </div>

        {/* Desktop Quick Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-navy-900/60 p-1 backdrop-blur-md">
          {[
            { id: 'home', label: 'Home' },
            { id: 'track', label: 'Track Status' },
            { id: 'transparency', label: 'Transparency Wall' },
            { id: 'about', label: 'About RYMEC' },
            { id: 'faq', label: 'Help & FAQ' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                currentTab === item.id 
                  ? 'text-white bg-brand-royal' 
                  : 'text-silver-400 hover:text-silver-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-silver-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-silver-300" /> : <Moon className="h-4 w-4 text-navy-850" />}
          </button>

          {/* Notifications Center */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-silver-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-royal px-1 text-[10px] font-bold text-white shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-navy-900 p-4 shadow-2xl backdrop-blur-2xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-silver-400" />
                        <h4 className="text-sm font-bold text-white">Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-medium text-brand-accent hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-silver-500">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-xl p-2.5 text-xs transition-colors ${
                              n.is_read ? 'bg-white/5 text-silver-400' : 'bg-white/10 text-white border border-white/15'
                            }`}
                          >
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-silver-300">{n.message}</p>
                            <span className="mt-1 block text-[10px] text-silver-500">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile or Login CTA */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 py-1.5 px-3 transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-royal text-white font-bold text-xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.full_name.split(' ')[0]}</p>
                  <span className="text-[10px] font-medium text-silver-400 uppercase tracking-wider">{user.role}</span>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-navy-900 p-3 shadow-2xl backdrop-blur-2xl z-50"
                  >
                    <div className="border-b border-white/10 pb-2.5 px-2">
                      <p className="text-sm font-bold text-white">{user.full_name}</p>
                      <p className="text-xs text-silver-400 truncate">{user.email}</p>
                      <div className="mt-1 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-silver-300">
                        ROLE: {user.role.toUpperCase()}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setCurrentTab('profile');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-silver-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <UserIcon className="h-4 w-4 text-silver-400" />
                        Account Settings
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="pebble-pill inline-flex items-center gap-2 bg-brand-royal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600"
            >
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
