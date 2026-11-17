import React, { useState } from 'react';
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
  KeyRound,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { OtpOrbitVerification } from './OtpOrbitVerification';

interface RoundGlassAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export type AuthMode = 'login' | 'register' | 'otp' | 'forgot' | 'forgot-otp' | 'new-password';

export const RoundGlassAuth: React.FC<RoundGlassAuthProps> = ({ isOpen, onClose }) => {
  const { login, register, verifyOtp, resendOtp, forgotPassword, verifyResetOtp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Registration OTP State
  const [otpEmail, setOtpEmail] = useState('');

  // Forgot Password Flow State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetVerifiedCode, setResetVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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
    semester: '1st Sem',
    academic_year: '1st Year',
    hostel_block: '',
    designation: 'Assistant Professor'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score, text: 'Moderate', color: 'bg-amber-400' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-400' };
  };

  const pStrength = getPasswordStrength(mode === 'new-password' ? newPassword : formData.password);

  // Submit Handler for Login, Registration & Forgot Password Initial Step
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
        setSuccessMsg(`Verification code dispatched to ${targetEmail}. Please check your Gmail.`);
      } else if (mode === 'forgot') {
        if (!forgotEmail || !forgotEmail.includes('@')) {
          throw new Error('Please enter a valid institutional email address.');
        }

        const res = await forgotPassword(forgotEmail);
        setMode('forgot-otp');
        setSuccessMsg(res.message || `Password reset code sent to ${forgotEmail}. Please check your Gmail.`);
      } else if (mode === 'new-password') {
        if (newPassword !== confirmNewPassword) {
          throw new Error('New passwords do not match. Please verify.');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must contain at least 6 characters.');
        }

        await resetPassword(forgotEmail, resetVerifiedCode, newPassword);
        setSuccessMsg('Password has been reset successfully! Please sign in with your new password.');
        setFormData((prev) => ({ ...prev, email: forgotEmail, password: '' }));
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification for Registration
  const handleVerifyRegisterOtp = async (code: string) => {
    const res = await verifyOtp(otpEmail, code);
    if (res && res.token) {
      setTimeout(() => {
        onClose();
      }, 1600);
      return true;
    }
    return false;
  };

  const handleResendRegisterOtp = async () => {
    await resendOtp(otpEmail);
  };

  // OTP Verification for Forgot Password
  const handleVerifyForgotOtp = async (code: string) => {
    const res = await verifyResetOtp(forgotEmail, code);
    if (res && res.valid) {
      setResetVerifiedCode(code);
      setTimeout(() => {
        setMode('new-password');
      }, 1600);
      return true;
    }
    return false;
  };

  const handleResendForgotOtp = async () => {
    await forgotPassword(forgotEmail);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-xl"
      />

      {/* Apple-grade Liquid Glass Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="ios-glass-card relative z-10 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-silver-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 px-3 py-1 text-xs font-semibold text-blue-300 mb-2 shadow-sm">
            {mode === 'otp' || mode === 'forgot-otp' ? (
              <>
                <KeyRound className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                <span>6-Digit Security Gateway</span>
              </>
            ) : mode === 'forgot' || mode === 'new-password' ? (
              <>
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>Password Recovery Gateway</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>RYMEC Official Portal</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign In to Grievance Desk'}
            {mode === 'register' && 'New User Registration'}
            {mode === 'otp' && 'Verify Email Address'}
            {mode === 'forgot' && 'Reset Account Password'}
            {mode === 'forgot-otp' && 'Enter Verification Code'}
            {mode === 'new-password' && 'Create New Password'}
          </h2>
          <p className="mt-1 text-xs text-silver-300 max-w-sm mx-auto">
            {mode === 'login' && 'Enter your institutional credentials to submit grievances and track status.'}
            {mode === 'register' && 'Create your official account with branch, section, and study details.'}
            {mode === 'otp' && `Enter the 6-digit code dispatched to ${otpEmail || 'your email'}.`}
            {mode === 'forgot' && 'Enter your registered institutional email to receive a 6-digit OTP verification code.'}
            {mode === 'forgot-otp' && `Enter the 6-digit reset code sent to ${forgotEmail}.`}
            {mode === 'new-password' && 'Enter your new account password to complete the reset.'}
          </p>
        </div>

        {/* Tab Toggle (Only for login / register) */}
        {(mode === 'login' || mode === 'register') && (
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
                  ? 'text-white ios-glass-btn-primary shadow-md font-bold'
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

        {/* Step Indicator when in Register */}
        {mode === 'register' && (
          <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-400/40 bg-blue-500/15 text-blue-300">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-400 text-navy-950 font-bold text-[10px]">
                1
              </span>
              Academic Details
            </span>
            <div className="w-4 h-px bg-white/20" />
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-silver-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white font-bold text-[10px]">
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

        {/* ───────────────── VIEW 1: REGISTRATION OTP ORBIT ───────────────── */}
        {mode === 'otp' && (
          <OtpOrbitVerification
            email={otpEmail}
            onVerify={handleVerifyRegisterOtp}
            onResend={handleResendRegisterOtp}
            onBack={() => setMode('register')}
            title="Account Verification"
          />
        )}

        {/* ───────────────── VIEW 2: FORGOT PASSWORD OTP ORBIT ───────────────── */}
        {mode === 'forgot-otp' && (
          <OtpOrbitVerification
            email={forgotEmail}
            onVerify={handleVerifyForgotOtp}
            onResend={handleResendForgotOtp}
            onBack={() => setMode('forgot')}
            title="Password Reset Verification"
          />
        )}

        {/* ───────────────── VIEW 3: FORMS (Login, Register, Forgot, New Password) ───────────────── */}
        {mode !== 'otp' && mode !== 'forgot-otp' && (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[62vh] overflow-y-auto px-1 pr-2">
            
            {/* ─── LOGIN VIEW ─── */}
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-silver-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(formData.email || '');
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-silver-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ─── FORGOT PASSWORD INITIAL EMAIL VIEW ─── */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1.5">
                    Registered Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@rymec.edu.in or your Gmail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-silver-400">
                    We will send a 6-digit OTP verification code to this address via the official RYMEC Gmail Gateway.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-silver-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* ─── NEW PASSWORD VIEW (AFTER OTP VERIFIED) ─── */}
            {mode === 'new-password' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>OTP verified for <strong>{forgotEmail}</strong>. Now set your new password.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 pr-10 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-silver-400 hover:text-white cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full ${pStrength.score >= 1 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                      <div className={`h-full ${pStrength.score >= 2 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                      <div className={`h-full ${pStrength.score >= 3 ? pStrength.color : 'bg-transparent'} w-1/3`} />
                    </div>
                    <span className="text-[10px] font-semibold text-silver-400">{pStrength.text}</span>
                  </div>
                )}
              </div>
            )}

            {/* ─── REGISTER VIEW ─── */}
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1">Institutional Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="student">Student / Scholar</option>
                    <option value="lecturer">Faculty / Lecturer</option>
                    <option value="mentor">Academic Mentor</option>
                    <option value="warden">Hostel Warden</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="principal">Principal Office / Management</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-silver-300 mb-1">Institutional / Personal Gmail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="student@rymec.edu.in or personal gmail"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-silver-400 mt-1 block">
                    A real 6-digit OTP verification code will be sent to this email via Gmail.
                  </span>
                </div>

                {/* Student specific fields */}
                {formData.role === 'student' && (
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-300">
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
                          className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                          <option value="CSE - Cyber Security">CSE - Cyber Security</option>
                          <option value="Data Science">Data Science</option>
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
                          className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                        </select>
                      </div>
                    </div>

                    {/* Current Semester & Academic Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-silver-300 mb-1">Current Semester</label>
                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="1st Sem">1st Semester (Sem 1)</option>
                          <option value="2nd Sem">2nd Semester (Sem 2)</option>
                          <option value="3rd Sem">3rd Semester (Sem 3)</option>
                          <option value="4th Sem">4th Semester (Sem 4)</option>
                          <option value="5th Sem">5th Semester (Sem 5)</option>
                          <option value="6th Sem">6th Semester (Sem 6)</option>
                          <option value="7th Sem">7th Semester (Sem 7)</option>
                          <option value="8th Sem">8th Semester (Sem 8)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-silver-300 mb-1">Academic Year</label>
                        <select
                          name="academic_year"
                          value={formData.academic_year}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="1st Year">1st Year (Freshman)</option>
                          <option value="2nd Year">2nd Year (Sophomore)</option>
                          <option value="3rd Year">3rd Year (Junior)</option>
                          <option value="4th Year">4th Year (Final Year)</option>
                        </select>
                      </div>
                    </div>

                    {/* USN / Roll Number & Accommodation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-silver-300 mb-1">USN / Roll Number</label>
                        <input
                          type="text"
                          name="usn_roll"
                          required
                          placeholder="e.g. 3BR21CS045"
                          value={formData.usn_roll}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 px-2.5 text-xs text-white font-mono uppercase placeholder-silver-500 focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-silver-300 mb-1">
                          Accommodation
                        </label>
                        <select
                          name="hostel_block"
                          value={formData.hostel_block}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="">Select Accommodation</option>
                          <option value="Day Scholar">Day Scholar (Local / Commuter)</option>
                          <option value="Hostel">Hostel (Campus Resident)</option>
                          <option value="PG">PG (Paying Guest / Private Room)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff specific fields */}
                {formData.role !== 'student' && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-300">
                      <Building className="h-4 w-4" />
                      <span>Department & Designation</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-silver-300 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white"
                      >
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="CSE - Cyber Security">CSE - Cyber Security</option>
                        <option value="Data Science">Data Science</option>
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
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 pr-8 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-silver-400 hover:text-white cursor-pointer"
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
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white placeholder-silver-500 focus:border-blue-400 focus:outline-none"
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

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full ios-glass-btn-primary mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to Portal'}
                    {mode === 'register' && 'Send Verification Code (OTP)'}
                    {mode === 'forgot' && 'Send Password Reset Code'}
                    {mode === 'new-password' && 'Save New Password & Sign In'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
