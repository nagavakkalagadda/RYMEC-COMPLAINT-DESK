import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Clock, 
  Lock, 
  Award,
  MapPin,
  FileCheck
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
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">

      {/* ── RYMEC Campus Photograph ── */}
      <div className="absolute inset-0 -z-30">
        <img
          src="/images/rymec-campus.png"
          alt="Rao Bahadur Y. Mahabaleswarappa Engineering College Campus"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
      </div>

      {/* ── Quiet Dark Overlay for Text Legibility ── */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-navy-950/40 via-navy-950/60 to-navy-950/95" />

      {/* ── Hero Main Content ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center max-w-4xl mx-auto">

        {/* Institutional Accreditation */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-navy-900/70 px-3.5 py-1.5 text-xs text-silver-300 mb-6 backdrop-blur-md">
          <Award className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>NAAC A+ Accredited · VTU Affiliated · Estd. 1980</span>
        </div>

        {/* College & Portal Titles */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-silver-400">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </p>

          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-silver-200 leading-snug">
            Rao Bahadur Y. Mahabaleswarappa Engineering College
          </h2>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mt-1">
            Grievance Redressal Portal
          </h1>
        </div>

        {/* Campus Location */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-silver-400 text-xs">
          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>V.V. Sangha Campus, Cantonment, Ballari — 583 104, Karnataka</span>
        </div>

        {/* Purpose Statement */}
        <p className="text-sm sm:text-base text-silver-300 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
          The official institutional grievance redressal system for students, faculty, and administration —
          providing confidential reporting, direct departmental routing, and time-bound resolution tracking.
        </p>

        {/* Two Deliberate Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 active:scale-[0.98] transition-colors"
          >
            <span>Submit Grievance</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onTrack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-silver-200 hover:bg-white/10 hover:border-white/25 active:scale-[0.98] transition-colors"
          >
            <Search className="h-4 w-4 text-silver-400" />
            <span>Track Grievance</span>
          </button>
        </div>

        {/* Quiet Tertiary Link */}
        <button
          onClick={onViewTransparency}
          className="text-xs text-silver-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white"
        >
          View Public Transparency Wall →
        </button>

      </div>

      {/* ── Institutional Pillars ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Lock,
              title: 'Confidential Reporting',
              desc: 'File sensitive matters without disclosing personal identity to non-committee members.',
              tag: 'Privacy'
            },
            {
              icon: ShieldCheck,
              title: 'Direct Routing',
              desc: 'Grievances automatically dispatch to the responsible department head, warden, or mentor.',
              tag: 'Routing'
            },
            {
              icon: Clock,
              title: 'Time-Bound SLA',
              desc: '7-day target for standard matters and 3-day resolution for urgent safety submissions.',
              tag: 'Milestone'
            },
            {
              icon: FileCheck,
              title: 'Permanent Audit Trail',
              desc: 'All official remarks, status changes, and committee notes are timestamped and logged.',
              tag: 'Accountability'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <GlassCard key={idx} className="p-5 text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-mono text-silver-400">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-silver-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>

    </div>
  );
};
