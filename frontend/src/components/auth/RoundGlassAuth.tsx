import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoundGlassAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'otp';

export const RoundGlassAuth: React.FC<RoundGlassAuthProps> = ({ isOpen, onClose }) => {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student' as UserRole,
    usn_roll: '',
    department: 'Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    section: 'A',
    academic_year: '3rd Year',
    hostel_block: '',
    designation: 'Assistant Professor'
  });

  // Handle countdown timer for Resend OTP
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'branch') {
        updated.department = value;
      }
      return updated;
    });
    setError(null);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score: 1, text: 'Fair', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: 'Good', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const pStrength = getPasswordStrength(formData.password);

  // OTP Input Handlers
  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);
    setError(null);

    // Auto advance to next input
    if (cleaned && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setOtpDigits(newDigits);
    const focusTarget = Math.min(pasteData.length, 5);
    otpRefs.current[focusTarget]?.focus();
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || !otpEmail) return;
    setError(null);
    setLoading(true);
    try {
      const res = await resendOtp(otpEmail);
      setSuccessMsg(res.message || 'A fresh OTP code has been dispatched.');
      setResendTimer(60);
      if (res.demoOtp) {
        setDemoCodeHint(res.demoOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);
        if (res && res.token) {
          onClose();
        }
      } else if (mode === 'register') {
        if (formData.password !== formData.confirm_password) {
          throw new Error('Passwords do not match. Please verify.');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const res = await register({
          ...formData,
          department: formData.branch || formData.department
        });

        const targetEmail = res.email || formData.email.trim().toLowerCase();
        setOtpEmail(targetEmail);
        setMode('otp');
        setResendTimer(60);
        if (res.demoOtp) {
          setDemoCodeHint(res.demoOtp);
        }
        setSuccessMsg('Account created! Please enter the 6-digit verification code.');
      } else if (mode === 'otp') {
        const fullOtp = otpDigits.join('');
        if (fullOtp.length !== 6) {
          throw new Error('Please enter all 6 digits of your verification code.');
        }

        await verifyOtp(otpEmail, fullOtp);
        setSuccessMsg('Account verified! Welcome to RYMEC Grievance Desk.');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      // Check if user needs verification
      if (err?.data?.needsVerification) {
        setOtpEmail(err.data.email || formData.email);
        setMode('otp');
        setResendTimer(60);
        setError('Your account is pending email verification. Enter the OTP code sent to your email.');
      } else {
        setError(err.message || 'Operation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/85 backdrop-blur-md"
      />

      {/* Glass Card Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/15 bg-navy-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl my-auto text-silver-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-silver-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-2.5">
            {mode === 'otp' ? (
              <>
                <KeyRound className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Two-Step Security Gateway</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>RYMEC Official Portal</span>
              </>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign In to Grievance Desk'}
            {mode === 'register' && 'New User Registration'}
            {mode === 'otp' && 'Verify Email Address'}
          </h2>
          <p className="mt-1 text-xs text-silver-400 max-w-sm mx-auto">
            {mode === 'login' && 'Enter your institutional credentials to submit grievances and track status.'}
            {mode === 'register' && 'Create your official account with branch, section, and study details.'}
            {mode === 'otp' && `A 6-digit code was sent to ${otpEmail || 'your email'}. Check your inbox or Gmail.`}
          </p>
        </div>

        {/* Tab Toggle (Only for login / register) */}
        {mode !== 'otp' && (
          <div className="flex rounded-2xl border border-white/10 bg-black/25 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`relative flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'text-white bg-brand-royal shadow-md font-bold'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`relative flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'text-white bg-brand-royal shadow-md font-bold'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Step Indicator when in Register/OTP */}
        {mode !== 'login' && (
          <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-semibold">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                mode === 'register'
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 bg-white/5 text-silver-400'
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-navy-950 font-bold text-[10px]">
                1
              </span>
              Academic Details
            </span>
            <div className="w-4 h-px bg-white/20" />
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                mode === 'otp'
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 bg-white/5 text-silver-400'
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-navy-950 font-bold text-[10px]">
                2
              </span>
              OTP Verification
            </span>
          </div>
        )}

        {/* Feedback Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-xs text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[62vh] overflow-y-auto px-1 pr-2">
          {/* ───────────────── LOGIN VIEW ───────────────── */}
          {mode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1.5">College / Personal Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@rymec.edu.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-silver-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ───────────────── REGISTER VIEW ───────────────── */}
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1">
                  Email Address <span className="text-[11px] text-cyan-400">(OTP will be delivered here)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. rahul.3br21cs045@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1">Register As</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-navy-800 py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer / Faculty Member</option>
                  <option value="warden">Hostel Warden</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="mentor">Student Mentor</option>
                  <option value="principal">Principal</option>
                </select>
              </div>

              {/* STUDENT SPECIFIC: CURRENT STUDYING DETAILS */}
              {formData.role === 'student' && (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    <GraduationCap className="h-4 w-4" />
                    <span>Current Studying Details</span>
                  </div>

                  {/* Branch & Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">Branch</label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                        <option value="Information Science & Engineering">Information Science (ISE)</option>
                        <option value="Artificial Intelligence & ML">AI & Machine Learning (AIML)</option>
                        <option value="Electronics & Communication">Electronics & Comm. (ECE)</option>
                        <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">Section</label>
                      <select
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic Year & USN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">Academic Year</label>
                      <select
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Final Year)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">USN / Roll Number</label>
                      <input
                        type="text"
                        name="usn_roll"
                        required
                        placeholder="e.g. 3BR21CS045"
                        value={formData.usn_roll}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 px-2.5 text-xs text-white font-mono uppercase placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Hostel Block */}
                  <div>
                    <label className="block text-[11px] font-semibold text-silver-300 mb-1">
                      Hostel Accommodation <span className="text-silver-500 font-normal">(optional)</span>
                    </label>
                    <select
                      name="hostel_block"
                      value={formData.hostel_block}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Day Scholar (Not in Hostel)</option>
                      <option value="Aryabhata Block-A">Aryabhata Block-A (Boys)</option>
                      <option value="Aryabhata Block-B">Aryabhata Block-B (Boys)</option>
                      <option value="Bhaskaracharya Block">Bhaskaracharya Block (Boys)</option>
                      <option value="Chanakya Block">Chanakya Block (Boys)</option>
                      <option value="Kittur Rani Chennamma Block">Kittur Rani Chennamma (Girls Hostel)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* NON-STUDENT (STAFF) FIELDS */}
              {formData.role !== 'student' && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    <Building className="h-4 w-4" />
                    <span>Faculty & Department Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white"
                      >
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Information Science & Engineering">ISE</option>
                        <option value="Artificial Intelligence & ML">AIML</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Electrical & Electronics">EEE</option>
                        <option value="Mechanical Engineering">MECH</option>
                        <option value="Civil Engineering">CIVIL</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">Designation</label>
                      <input
                        type="text"
                        name="designation"
                        placeholder="e.g. Assistant Professor"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 px-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 pr-8 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-silver-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full ${pStrength.score >= 1 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                    <div className={`h-full ${pStrength.score >= 2 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                    <div className={`h-full ${pStrength.score >= 3 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                  </div>
                  <span className="text-[10px] font-semibold text-silver-400">{pStrength.text}</span>
                </div>
              )}
            </>
          )}

          {/* ───────────────── OTP VERIFICATION GATEWAY ───────────────── */}
          {mode === 'otp' && (
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-center space-y-2">
                <span className="text-xs text-silver-300 block">
                  Verification code dispatched to:
                </span>
                <span className="font-mono font-bold text-sm text-cyan-300 bg-navy-950/80 px-3 py-1 rounded-lg border border-cyan-400/30 inline-block">
                  {otpEmail}
                </span>

                <div className="pt-2">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
                  >
                    <span>Open Gmail in New Tab</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* 6 Digit Segmented Inputs */}
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-2 text-center uppercase tracking-wider">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-white/20 bg-navy-950/90 text-center text-xl font-mono font-bold text-white shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Demo Hint Banner (if applicable) */}
              {demoCodeHint && (
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-center text-xs text-amber-300">
                  <span className="font-bold">Test/Demo Code: </span>
                  <span className="font-mono font-bold tracking-widest text-white">{demoCodeHint}</span>
                </div>
              )}

              {/* Resend Code Action */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-silver-400 hover:text-white transition-colors"
                >
                  ← Edit Information
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || loading}
                  className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
                    resendTimer > 0
                      ? 'text-silver-500 cursor-not-allowed'
                      : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full pebble-pill mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-brand-royal py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:from-blue-500 hover:to-blue-600 active:scale-98 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Portal'}
                  {mode === 'register' && 'Send Verification Code (OTP)'}
                  {mode === 'otp' && 'Verify Code & Complete Registration'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
