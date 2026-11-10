import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoundGlassAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoundGlassAuth: React.FC<RoundGlassAuthProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student' as UserRole,
    usn_roll: '',
    department: 'Computer Science & Engineering',
    academic_year: '3rd Year',
    hostel_block: 'Aryabhata Block-B',
    designation: 'Assistant Professor'
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-transparent' };
    if (pass.length < 6) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 9) return { score: 2, text: 'Medium', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const pStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else {
        if (formData.password !== formData.confirm_password) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await register(formData);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md"
      />

      {/* Centered Circular-Inspired Glass Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-navy-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-silver-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-silver-300 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
            Institutional Access
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-1 text-xs text-silver-400">
            {mode === 'login' 
              ? 'Access the institutional grievance desk with your college credentials.' 
              : 'Register your account with authorized college information.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-full border border-white/10 bg-black/20 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`relative flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
              mode === 'login' ? 'text-white bg-brand-royal shadow-sm' : 'text-silver-400 hover:text-white'
            }`}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`relative flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
              mode === 'register' ? 'text-white bg-brand-royal shadow-sm' : 'text-silver-400 hover:text-white'
            }`}
          >
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto px-1">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-silver-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-silver-500" />
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-silver-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-silver-500" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@rymec.edu.in"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-silver-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-silver-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-silver-500 hover:text-silver-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {mode === 'register' && formData.password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex h-1 flex-1 gap-1 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${pStrength.score >= 1 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                  <div className={`h-full ${pStrength.score >= 2 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                  <div className={`h-full ${pStrength.score >= 3 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                </div>
                <span className="text-[10px] font-semibold text-silver-400">{pStrength.text}</span>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-silver-500" />
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1">Register As</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-navy-800 py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer / Faculty</option>
                  <option value="warden">Hostel Warden</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="mentor">Student Mentor</option>
                  <option value="principal">Principal</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-silver-400 mb-1">USN / Roll No.</label>
                    <input
                      type="text"
                      name="usn_roll"
                      placeholder="e.g. 3BR21CS045"
                      value={formData.usn_roll}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 px-3 text-xs text-white placeholder-silver-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-silver-400 mb-1">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2 text-xs text-white"
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Information Science & Engineering">ISE</option>
                      <option value="Artificial Intelligence & ML">AIML</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Electrical & Electronics">EEE</option>
                      <option value="Mechanical Engineering">MECH</option>
                      <option value="Civil Engineering">CIVIL</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full pebble-pill mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-royal py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-600 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
