import React, { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle, RefreshCw, Lock, Mail, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

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
  title = 'Verify your email',
  subtitle,
  onBack,
  autoFocus = true,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      // Visual pause so user sees the curl animation onto the dotted orbit ring
      await new Promise((res) => setTimeout(res, 650));

      const ok = await onVerify(code);
      if (ok !== false) {
        setStatus('success');
        // Phase 1: All boxes turn neon green on ring
        // Phase 2: After 450ms, collapse all boxes into single center squircle!
        setTimeout(() => {
          setIsCollapsed(true);
        }, 450);
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

    // Wait for shake animation then reverse to row and focus box 0
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

    try {
      await onResend();
      setDigits(['', '', '', '', '', '']);
      setCountdown(60);
      setStatus('idle');
      setIsCollapsed(false);
      setActiveIndex(0);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Geometry: 6 boxes on a circle of radius R = 52px
  // In horizontal row, boxes have a pitch of 48px from center:
  // X coords in row: [-120, -72, -24, +24, +72, +120]
  // On circle of R = 52px, the 6 angles are -90°, -30°, +30°, +90°, +150°, +210°:
  // Box 0: (0, -52)     -> delta: (+120, -52)
  // Box 1: (45, -26)    -> delta: (+117, -26)
  // Box 2: (45, 26)     -> delta: (+21,  +26)
  // Box 3: (0, 52)      -> delta: (-24,  +52)
  // Box 4: (-45, 26)    -> delta: (-117, +26)
  // Box 5: (-45, -26)   -> delta: (-165, -26)
  const orbitOffsets = [
    { targetX: 120, targetY: -52 },
    { targetX: 117, targetY: -26 },
    { targetX: 21,  targetY: 26 },
    { targetX: -24, targetY: 52 },
    { targetX: -117, targetY: 26 },
    { targetX: -165, targetY: -26 },
  ];

  const isCurling = status === 'verifying' || status === 'success';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Dynamic Keyframes for Exact Gyre Component 89 Animation */}
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
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(46, 230, 168, 0.6); }
          50% { transform: scale(1.04); box-shadow: 0 0 35px 8px rgba(46, 230, 168, 0.5); }
          100% { transform: scale(1); box-shadow: 0 0 25px 2px rgba(46, 230, 168, 0.35); }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 40; opacity: 0; }
          40% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes particle-float {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0.8; }
          50% { transform: translate(var(--p-x), var(--p-y)) scale(1.2); opacity: 1; }
          100% { transform: translate(calc(var(--p-x) * 1.5), calc(var(--p-y) * 1.5)) scale(0.6); opacity: 0.4; }
        }
        .otp-shake-active {
          animation: otp-error-shake 0.75s ease-in-out;
        }
        .otp-orbit-active {
          animation: otp-spin-ring 2.6s linear infinite;
        }
        .otp-counter-active {
          animation: otp-counter-spin 2.6s linear infinite;
        }
      `}</style>

      {/* Header Info */}
      <div className="text-center mb-4 w-full">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {isCollapsed ? 'Verified successfully' : title}
        </h3>
        <p className="text-xs text-silver-300 mt-1 max-w-sm mx-auto">
          {isCollapsed ? (
            'Your institutional credentials have been verified.'
          ) : subtitle ? (
            subtitle
          ) : (
            <>
              Enter the 6-digit code sent to{' '}
              <span className="font-mono text-cyan-300 font-semibold">{email}</span>
            </>
          )}
        </p>
      </div>

      {/* Gmail Shortcut Pill (Hidden on Collapsed Success) */}
      {!isCollapsed && (
        <div className="mb-3">
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/25 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 hover:text-white hover:bg-blue-500/20 backdrop-blur-md transition-all shadow-sm cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5 text-blue-400" />
            <span>Open Gmail Inbox</span>
            <ExternalLink className="h-3 w-3 text-silver-400" />
          </a>
        </div>
      )}

      {/* Status Alert Banner */}
      {errorMessage && (
        <div className="mb-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── 6-DIGIT CIRCULAR ORBIT ANIMATION STAGE ── */}
      <div
        className={`relative flex items-center justify-center w-full min-h-[170px] sm:min-h-[185px] my-1 select-none ${
          status === 'error' ? 'otp-shake-active' : ''
        }`}
      >
        {/* The Dotted Orbit Ring and Center Hub Point from Reference Component */}
        <div
          className={`absolute flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
            isCurling && !isCollapsed ? 'opacity-100' : 'opacity-40'
          }`}
          style={{ width: '130px', height: '130px' }}
        >
          <svg className="w-full h-full" viewBox="0 0 130 130">
            <circle
              cx="65"
              cy="65"
              r="52"
              fill="none"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="absolute rounded-full bg-white/40"
            style={{ width: '5px', height: '5px' }}
          />
        </div>

        {/* Orbit Ring Wrapper: Spins 360° when curling */}
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

            // In row vs orbit vs collapsed-to-center transform
            let curlTransform = 'translate(0px, 0px) scale(1)';
            if (isCollapsed) {
              // Collapsed state: boxes merge into center hub (0,0) and fade out
              curlTransform = 'translate(0px, 0px) scale(0.2)';
            } else if (isCurling) {
              // Curled state: positioned along circular ring
              curlTransform = `translate(${offset.targetX}px, ${offset.targetY}px) scale(0.92)`;
            }

            return (
              <div
                key={idx}
                className="relative transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  transform: curlTransform,
                  opacity: isCollapsed ? 0 : 1,
                  pointerEvents: isCollapsed ? 'none' : 'auto',
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
                      ? 'border-[#2ee6a8] bg-[#2ee6a8]/20 text-[#2ee6a8] shadow-[0_0_24px_rgba(46,230,168,0.55)]'
                      : status === 'error'
                      ? 'border-[#ff4d6a] bg-[#ff4d6a]/15 text-[#ff4d6a] shadow-[0_0_20px_rgba(255,77,106,0.5)]'
                      : isCurling
                      ? 'border-[#dceaff] bg-blue-500/20 text-blue-100 shadow-[0_0_18px_rgba(220,234,255,0.45)]'
                      : isActive
                      ? 'border-[#dceaff] bg-navy-900/90 text-white shadow-[0_0_16px_rgba(220,234,255,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] scale-[1.04]'
                      : digit
                      ? 'border-white/30 bg-navy-950/80 text-white shadow-sm'
                      : 'border-white/15 bg-white/5 text-silver-500 hover:border-white/30'
                  }`}
                >
                  {/* Invisible Input for Keyboard & Accessibility */}
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

                  {/* Counter-spinning digit container to keep numbers upright */}
                  <span
                    className={`relative z-10 transition-transform duration-200 ${
                      isCurling && status !== 'success' ? 'otp-counter-active' : ''
                    } ${digit ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                  >
                    {digit}
                  </span>

                  {/* Pulsing Caret Indicator when active & empty */}
                  {isActive && !digit && status === 'idle' && (
                    <span className="h-5 w-0.5 rounded-full bg-[#dceaff] animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── COLLAPSED SINGLE SQUIRCLE WITH GLOWING CHECKMARK (REFERENCE VIDEO FINALE) ── */}
        {isCollapsed && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
            style={{
              animation: 'otp-pulse-success 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Floating Green Particles around the squircle (as in frame_160.jpg) */}
            <div className="absolute pointer-events-none" style={{ width: '140px', height: '140px' }}>
              {[
                { x: '42px', y: '-38px', delay: '0s', size: '5px' },
                { x: '-46px', y: '-32px', delay: '0.2s', size: '4px' },
                { x: '50px', y: '28px', delay: '0.4s', size: '4.5px' },
                { x: '-38px', y: '40px', delay: '0.1s', size: '5px' },
                { x: '0px', y: '-52px', delay: '0.3s', size: '4px' },
                { x: '18px', y: '50px', delay: '0.5s', size: '3.5px' },
              ].map((p, pIdx) => (
                <span
                  key={pIdx}
                  className="absolute rounded-full bg-[#2ee6a8] shadow-[0_0_10px_#2ee6a8]"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: p.size,
                    height: p.size,
                    // @ts-ignore
                    '--p-x': p.x,
                    '--p-y': p.y,
                    animation: `particle-float 2.5s ease-in-out infinite alternate ${p.delay}`,
                  }}
                />
              ))}
            </div>

            {/* Single Merged Center Squircle Box */}
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#2ee6a8]/20 border-2 border-[#2ee6a8] shadow-[0_0_35px_rgba(46,230,168,0.65)] backdrop-blur-2xl">
              <svg
                className="h-7 w-7 text-[#2ee6a8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 40,
                  animation: 'check-draw 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* "Verified and secure" Badge */}
            <div className="flex items-center gap-1.5 text-xs text-[#2ee6a8] font-bold mt-3 animate-in fade-in duration-300">
              <Lock className="h-3.5 w-3.5" />
              <span>Verified and secure</span>
            </div>
          </div>
        )}
      </div>

      {/* Orbit Verification Caption / Loading State */}
      {status === 'verifying' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mt-2 animate-pulse">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <span>Authenticating 6-digit code with RYMEC-iSMART...</span>
        </div>
      )}

      {/* Footer Actions: Resend Code & Back */}
      {!isCollapsed && (
        <div className="flex items-center justify-between w-full pt-3 mt-1 border-t border-white/10 text-xs">
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
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
