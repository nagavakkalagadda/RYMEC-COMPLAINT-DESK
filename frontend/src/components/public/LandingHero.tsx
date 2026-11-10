import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Clock, 
  Lock, 
  Award,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { GlassCard } from '../3d/GlassCard';

interface LandingHeroProps {
  onGetStarted: () => void;
  onTrack: () => void;
  onViewTransparency: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onGetStarted,
  onTrack,
  onViewTransparency
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── RYMEC Campus Background ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -z-30"
      >
        <img
          src="/images/rymec-campus.png"
          alt="RYMEC Campus — Rao Bahadur Y. Mahabaleswarappa Engineering College, Ballari"
          className="w-full h-full object-cover object-center scale-105"
          draggable={false}
        />
      </motion.div>

      {/* ── Multi-layer Dark Overlay ── */}
      <div className="absolute inset-0 -z-20">
        {/* Base dark veil */}
        <div className="absolute inset-0 bg-navy-950/70" />
        {/* Top gradient — let sky remain slightly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-navy-950/65 to-navy-950/98" />
        {/* Subtle vignette */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, rgba(7,12,24,0.55) 100%)' }}
        />
      </div>

      {/* ── Dot-grid texture ── */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.025]" />

      {/* ── Hero Content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center"
      >

        {/* Accreditation badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] backdrop-blur-md px-4 py-1.5 text-[11px] font-semibold tracking-widest text-silver-300 mb-8 shadow-lg"
        >
          <Award className="h-3.5 w-3.5 text-brand-accent shrink-0" />
          <span>NAAC A+ ACCREDITED &nbsp;•&nbsp; VTU AFFILIATED &nbsp;•&nbsp; ESTD. 1980</span>
        </motion.div>

        {/* College name block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
          className="space-y-3 max-w-4xl mx-auto"
        >
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-silver-400/80">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </p>

          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-silver-200 drop-shadow-md leading-snug">
            Rao Bahadur Y. Mahabaleswarappa Engineering College
          </h2>

          {/* Main title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl leading-none mt-2">
            RYMEC
            <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-brand-accent/90 mt-1 tracking-widest">
              GRIEVANCE DESK
            </span>
          </h1>
        </motion.div>

        {/* Location line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-1.5 mt-4 mb-6 text-silver-400 text-xs"
        >
          <MapPin className="h-3.5 w-3.5 text-brand-accent/70 shrink-0" />
          <span>V.V. Sangha Campus, Cantonment, Ballari — 583 104, Karnataka</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="text-sm sm:text-base text-silver-300/90 leading-relaxed font-normal max-w-2xl mx-auto mb-10"
        >
          A Smarter, Transparent and Accountable Student Grievance Management Platform —
          with structured SLA tracking, anonymous safety protection, and full audit trails.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, type: 'spring', stiffness: 200 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={onGetStarted}
            className="pebble-pill inline-flex items-center gap-2 rounded-full bg-brand-royal px-7 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:bg-blue-600 hover:shadow-[0_0_32px_rgba(37,99,235,0.6)] active:scale-[0.97] transition-all"
          >
            <span>Submit a Grievance</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onTrack}
            className="pebble-pill inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-md px-6 py-3 text-sm font-semibold text-silver-200 hover:bg-white/[0.12] hover:border-white/25 active:scale-[0.97] transition-all"
          >
            <Search className="h-4 w-4 text-silver-400" />
            <span>Track Grievance</span>
          </button>

          <button
            onClick={onViewTransparency}
            className="pebble-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm font-semibold text-silver-400 hover:text-white hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.97] transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Transparency Wall</span>
          </button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-silver-500/50 text-[10px] tracking-widest"
        >
          <span className="uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>

      </motion.div>

      {/* ── Feature Highlights ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.55 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Lock,
              title: 'Anonymous Mode',
              desc: 'Report sensitive issues or safety concerns without revealing personal identity to staff.',
              badge: 'Confidential',
              color: 'text-violet-400'
            },
            {
              icon: ShieldCheck,
              title: 'Auto-Routing',
              desc: 'Grievances are automatically directed to the responsible department head or warden.',
              badge: 'Automated',
              color: 'text-brand-accent'
            },
            {
              icon: Clock,
              title: 'SLA Tracking',
              desc: '7-day target for general issues. 3-day turnaround for urgent concerns with escalation.',
              badge: 'Time-Bound',
              color: 'text-amber-400'
            },
            {
              icon: Award,
              title: 'Audit Trail',
              desc: 'Every remark, status change, and assignment is timestamped in a permanent immutable log.',
              badge: 'Accountable',
              color: 'text-emerald-400'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <GlassCard key={idx} className="p-5 text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase rounded bg-white/5 border border-white/10 px-2 py-0.5 text-silver-400">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-silver-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            );
          })}
        </motion.div>
      </div>

    </div>
  );
};
