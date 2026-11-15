import React, { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle, RefreshCw, Clock, ArrowRight, ShieldCheck, Mail, ExternalLink } from 'lucide-react';

export interface OtpOrbitVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<boolean | void>;
  onResend: () => Promise<void>;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  autoFocus?: boolean;
}

export type OtpStatus = 'idle' | 'verifying' | 'success' | 'error' | 'expired';

export const OtpOrbitVerification: React.FC<OtpOrbitVerificationProps> = ({
  email,
  onVerify,
  onResend,
  title = 'Enter 6-Digit Verification Code',
  subtitle,
  onBack,
  autoFocus = true,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus management
  useEffect(() => {
    if (autoFocus && status === 'idle') {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  // Countdown timer for OTP expiry & resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (status !== 'success') {
        setStatus('expired');
        setErrorMessage('Verification code expired. Please request a new OTP.');
      }
    }
  }, [countdown, status]);

  // Single digit input change
  const handleChange = (index: number, val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    const lastChar = cleaned.slice(-1);
    const updated = [...digits];
    updated[index] = lastChar;
    setDigits(updated);
    setErrorMessage(null);

    // Auto-advance focus to next box
    if (index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else {
      // 6th digit entered
      const fullCode = updated.join('');
      if (fullCode.length === 6) {
        triggerVerification(fullCode);
      }
    }
  };

  // Keyboard navigation & backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const updated = [...digits];
        updated[index - 1] = '';
        setDigits(updated);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...digits];
        updated[index] = '';
        setDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Paste support: Handles pasting full 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setDigits(newDigits);

    if (pasteData.length === 6) {
      triggerVerification(pasteData);
    } else {
      const nextIndex = Math.min(pasteData.length, 5);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Execute verification with circular orbit animation
  const triggerVerification = async (code: string) => {
    if (status === 'verifying' || status === 'success') return;

    setStatus('verifying');
    setErrorMessage(null);

    try {
      // Small visual pause to let the user see the circular curling transform
      await new Promise((res) => setTimeout(res, 600));

      const ok = await onVerify(code);
      if (ok !== false) {
        setStatus('success');
        setSuccessMessage('Verified Successfully!');
      } else {
        triggerFailure('Incorrect OTP. Please check your Gmail and try again.');
      }
    } catch (err: any) {
      triggerFailure(err.message || 'Incorrect OTP. Please try again.');
    }
  };

  // Failure flow: shake, red border, and smooth return to row
  const triggerFailure = (msg: string) => {
    setStatus('error');
    setErrorMessage(msg);

    // Wait for shake animation then reset digits and focus box 0
    setTimeout(() => {
      setDigits(['', '', '', '', '', '']);
      setStatus('idle');
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }, 1100);
  };

  // Resend code handler
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onResend();
      setDigits(['', '', '', '', '', '']);
      setCountdown(60);
      setStatus('idle');
      setActiveIndex(0);
      setSuccessMessage('A fresh 6-digit OTP has been sent to your Gmail.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Geometry calculations for the 6-box circular curling orbit
  // Box 0 to 5 offsets from horizontal center to circle circumference (R = 56px, mobile 46px)
  // Row offsets (pitch = 48px): [-120, -72, -24, +24, +72, +120]
  // Circle angles: -90°, -30°, +30°, +90°, +150°, +210°
  const orbitOffsets = [
    { targetX: 120, targetY: -56 },   // Box 0: top center (x: 0, y: -56) -> deltaX: 0 - (-120) = +120
    { targetX: 120.5, targetY: -28 }, // Box 1: 30° top-right (x: +48.5, y: -28) -> deltaX: 48.5 - (-72) = +120.5
    { targetX: 72.5, targetY: 28 },   // Box 2: 30° bot-right (x: +48.5, y: +28) -> deltaX: 48.5 - 24 = +24.5
    { targetX: -24, targetY: 56 },    // Box 3: bot center (x: 0, y: +56) -> deltaX: 0 - 24 = -24
    { targetX: -120.5, targetY: 28 }, // Box 4: 150° bot-left (x: -48.5, y: +28) -> deltaX: -48.5 - 72 = -120.5
    { targetX: -168.5, targetY: -28 },// Box 5: 210° top-left (x: -48.5, y: -28) -> deltaX: -48.5 - 120 = -168.5
  ];

  const isCurling = status === 'verifying' || status === 'success';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Dynamic Keyframes for Circular Orbit & Counter-Spin */}
      <style>{`
        @keyframes otp-spin-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes otp-counter-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes otp-error-shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        @keyframes otp-pulse-success {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px 6px rgba(52, 211, 153, 0.4); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 40; opacity: 0; transform: scale(0.6); }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; transform: scale(1); }
        }
        .otp-shake-active {
          animation: otp-error-shake 0.75s ease-in-out;
        }
        .otp-orbit-active {
          animation: otp-spin-ring 2.8s linear infinite;
        }
        .otp-counter-active {
          animation: otp-counter-spin 2.8s linear infinite;
        }
      `}</style>

      {/* Header Info */}
      <div className="text-center mb-5 w-full">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-silver-300 mt-1 max-w-sm mx-auto">
          {subtitle || (
            <>
              Enter the 6-digit code dispatched to{' '}
              <span className="font-mono text-cyan-300 font-semibold">{email}</span>
            </>
          )}
        </p>
      </div>

      {/* Gmail Shortcut Pill */}
      <div className="mb-4">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 hover:text-white hover:bg-blue-500/20 backdrop-blur-md transition-all shadow-sm"
        >
          <Mail className="h-3.5 w-3.5 text-blue-400" />
          <span>Open Gmail Inbox</span>
          <ExternalLink className="h-3 w-3 text-silver-400" />
        </a>
      </div>

      {/* Status Alert Banner */}
      {errorMessage && (
        <div className="mb-4 w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 animate-in fade-in duration-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* ── 6-DIGIT CIRCULAR ORBIT ANIMATION STAGE ── */}
      <div
        className={`relative flex items-center justify-center w-full min-h-[160px] sm:min-h-[175px] my-2 select-none ${
          status === 'error' ? 'otp-shake-active' : ''
        }`}
      >
        {/* Ring Orbiting Wrapper: Spins 360° when all 6 digits entered */}
        <div
          className={`relative flex items-center justify-center gap-2 sm:gap-2.5 transition-all duration-700 ease-out ${
            isCurling && status !== 'success' ? 'otp-orbit-active' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {digits.map((digit, idx) => {
            const isActive = activeIndex === idx && status === 'idle';
            const offset = orbitOffsets[idx];

            // Curling transform for box i
            const curlTransform = isCurling
              ? `translate(${offset.targetX}px, ${offset.targetY}px) scale(0.92)`
              : 'translate(0px, 0px) scale(1)';

            return (
              <div
                key={idx}
                className="relative transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  transform: curlTransform,
                }}
              >
                {/* Individual 6-Digit Box */}
                <div
                  onClick={() => {
                    if (status === 'idle') {
                      setActiveIndex(idx);
                      inputRefs.current[idx]?.focus();
                    }
                  }}
                  className={`relative flex h-12 w-10 sm:h-14 sm:w-11 items-center justify-center rounded-2xl border text-xl font-mono font-bold transition-all duration-300 backdrop-blur-xl cursor-text ${
                    status === 'success'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                      : status === 'error'
                      ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.45)]'
                      : isCurling
                      ? 'border-blue-400 bg-blue-500/20 text-blue-200 shadow-[0_0_18px_rgba(56,189,248,0.4)]'
                      : isActive
                      ? 'border-cyan-400 bg-navy-900/90 text-white shadow-[0_0_14px_rgba(56,189,248,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] scale-[1.04]'
                      : digit
                      ? 'border-white/30 bg-navy-950/80 text-white shadow-sm'
                      : 'border-white/15 bg-white/5 text-silver-500 hover:border-white/30'
                  }`}
                >
                  {/* Invisible Actual Input for Accessibility & Mobile Keyboards */}
                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={status === 'verifying' || status === 'success'}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    onFocus={() => setActiveIndex(idx)}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-text"
                  />

                  {/* Counter-spinning digit container to keep numbers upright while ring spins */}
                  <span
                    className={`relative z-10 transition-transform duration-200 ${
                      isCurling && status !== 'success' ? 'otp-counter-active' : ''
                    } ${digit ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                  >
                    {digit}
                  </span>

                  {/* Pulsing Caret Indicator when active & empty */}
                  {isActive && !digit && status === 'idle' && (
                    <span className="h-5 w-0.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Centered Glowing Checkmark on Success */}
          {status === 'success' && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                animation: 'otp-pulse-success 1.2s ease-out forwards',
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/25 border-2 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.6)] backdrop-blur-md">
                <svg
                  className="h-6 w-6 text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 40,
                    animation: 'check-draw 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orbit Verification Caption / Loading State */}
      {status === 'verifying' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mt-2 animate-pulse">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <span>Authenticating 6-digit credentials with RYMEC-iSMART...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mt-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Verified Successfully · Continuing...</span>
        </div>
      )}

      {/* Footer Actions: Resend Code & Back */}
      <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-white/10 text-xs">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={status === 'verifying'}
            className="text-silver-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        {/* Resend Action with Visible Cooldown Countdown */}
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending || status === 'verifying'}
          className={`inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
            countdown > 0 || isResending || status === 'verifying'
              ? 'text-silver-500 cursor-not-allowed opacity-60'
              : 'text-blue-400 hover:text-blue-300 hover:underline'
          }`}
        >
          <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
          <span>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
          </span>
        </button>
      </div>
    </div>
  );
};
