import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Clock, 
  Lock, 
  MapPin,
  FileCheck,
  ChevronRight
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

      {/* ── Background RYMEC Campus Photograph ── */}
      <div className="absolute inset-0 -z-30">
        <img
          src="/images/rymec-campus.png"
          alt="Rao Bahadur Y. Mahabaleswarappa Engineering College Campus"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
      </div>

      {/* ── Institutional Tinted Atmosphere Veil ── */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-navy-950/40 via-navy-950/65 to-navy-950/95" />

      {/* ── Central Hero Section ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center max-w-4xl mx-auto">

        {/* Institutional Accreditation Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-navy-900/70 px-3.5 py-1 text-xs text-silver-300 backdrop-blur-md mb-6 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium tracking-wide">NAAC A+ Accredited · VTU Affiliated · Estd. 1980</span>
        </div>

        {/* Institution Identity */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-silver-400">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </p>

          <h2 className="text-base sm:text-lg md:text-xl font-normal text-silver-200 leading-snug">
            Rao Bahadur Y. Mahabaleswarappa Engineering College
          </h2>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mt-1">
            RYMEC Grievance Desk
          </h1>
        </div>

        {/* Campus Location Pin */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-silver-400 text-xs">
          <MapPin className="h-3.5 w-3.5 text-silver-400 shrink-0" />
          <span>V.V. Sangha Campus, Cantonment, Ballari — 583 104, Karnataka</span>
        </div>

        {/* Institutional Purpose Statement */}
        <p className="text-sm sm:text-base text-silver-300 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
          The institutional grievance redressal system for students, faculty, and administration —
          providing confidential reporting, direct departmental routing, and time-bound resolution tracking.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={onGetStarted}
            className="ios-glass-btn-primary rounded-xl px-6 py-3 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Submit Grievance</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onTrack}
            className="ios-glass-btn-secondary rounded-xl px-6 py-3 text-sm font-semibold text-silver-200 flex items-center gap-2 cursor-pointer"
          >
            <Search className="h-4 w-4 text-silver-400" />
            <span>Track Status</span>
          </button>
        </div>

        {/* Quiet Link for Transparency Wall */}
        <button
          onClick={onViewTransparency}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs text-silver-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span>Public Transparency Wall</span>
          <ChevronRight className="h-3.5 w-3.5 text-silver-400" />
        </button>

      </div>

      {/* ── Institutional Pillars Grid ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Lock,
              title: 'Confidential Reporting',
              desc: 'Submit sensitive concerns with identity protection, accessible only to statutory committee members.',
              tag: 'Confidential'
            },
            {
              icon: ShieldCheck,
              title: 'Automated Routing',
              desc: 'Matters automatically dispatch to the responsible department head, hostel warden, or proctor.',
              tag: 'Automated'
            },
            {
              icon: Clock,
              title: 'Time-Bound SLA',
              desc: 'Standard issues handled within 7 days. Urgent matters prioritized for 3-day turnaround with escalation.',
              tag: '7-Day SLA'
            },
            {
              icon: FileCheck,
              title: 'Verified Audit Trail',
              desc: 'Every committee action, status update, and remark is recorded with timestamped institutional accountability.',
              tag: 'Audited'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <GlassCard key={idx} className="p-5 text-left rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-silver-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded px-2 py-0.5 text-[10px] font-medium tracking-wide bg-white/5 border border-white/10 text-silver-400">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 tracking-tight">{item.title}</h3>
                <p className="text-xs text-silver-400 leading-relaxed font-normal">{item.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>

    </div>
  );
};
