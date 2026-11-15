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
          className="w-full h-full object-cover object-center scale-[1.02]"
          draggable={false}
        />
      </div>

      {/* ── Apple Liquid Glass Ambient Veil ── */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-navy-950/25 via-navy-950/45 to-navy-950/95" />

      {/* ── Top Corner Institutional Medallions (Official College Emblems) ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Corner: Founder & V.V. Sangha Insignia */}
        <div className="ios-glass-card rounded-2xl p-2 px-3.5 flex items-center gap-3 shadow-lg">
          <div className="flex items-center -space-x-2">
            <img
              src="/images/logos/rao-bahadur.png"
              alt="Rao Bahadur Y. Mahabaleswarappa"
              title="Founder Rao Bahadur Y. Mahabaleswarappa"
              className="h-10 w-10 rounded-full border-2 border-white/40 object-cover shadow-sm bg-navy-900"
            />
            <img
              src="/images/logos/vvs-logo.jpg"
              alt="Veerasaiva Vidyavardhaka Sangha Emblem"
              title="V.V. Sangha, Ballari"
              className="h-10 w-10 rounded-full border-2 border-white/40 object-contain bg-white p-0.5 shadow-sm"
            />
            <img
              src="/images/logos/logos.gif"
              alt="RYMEC Official Crest"
              title="RYMEC Official Crest"
              className="h-10 w-10 rounded-full border-2 border-white/40 object-contain bg-white p-0.5 shadow-sm"
            />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-tight text-white leading-tight">V.V. Sangha, Ballari</p>
            <p className="text-[10px] text-silver-300 font-medium">Rao Bahadur Y.M.E.C.</p>
          </div>
        </div>

        {/* Right Corner: Accreditation & 47-Year Legacy Seals */}
        <div className="ios-glass-card rounded-2xl p-2 px-3.5 flex items-center gap-3 shadow-lg">
          <div className="text-right">
            <p className="text-[11px] font-bold tracking-tight text-white leading-tight">NAAC "A+" Accredited</p>
            <p className="text-[10px] text-amber-300 font-semibold">47+ Years of Legacy</p>
          </div>
          <div className="flex items-center -space-x-2">
            <img
              src="/images/logos/naac-logo.jpg"
              alt="NAAC A+ Accreditation"
              title="NAAC 'A+' Grade Accreditation"
              className="h-10 w-10 rounded-full border-2 border-white/40 object-contain bg-white p-0.5 shadow-sm"
            />
            <img
              src="/images/logos/anniversary-47.jpg"
              alt="47 Years Excellence"
              title="47 Years of Excellence Emblem"
              className="h-10 w-10 rounded-full border-2 border-white/40 object-cover shadow-sm"
            />
          </div>
        </div>

      </div>

      {/* ── Central Hero Section ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-14 text-center max-w-4xl mx-auto">

        {/* Dynamic Island Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-medium tracking-wide">NAAC A+ Accredited · VTU Affiliated · Estd. 1980</span>
        </div>

        {/* Institution Identity */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-silver-300/90">
            Veerasaiva Vidyavardhaka Sangha, Ballari
          </p>

          <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-silver-100 leading-snug drop-shadow-sm">
            Rao Bahadur Y. Mahabaleswarappa Engineering College
          </h2>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mt-1 drop-shadow-md">
            RYMEC Grievance Desk
          </h1>
        </div>

        {/* Campus Location Pin */}
        <div className="flex items-center justify-center gap-1.5 mb-6 text-silver-300 text-xs">
          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>V.V. Sangha Campus, Cantonment, Ballari — 583 104, Karnataka</span>
        </div>

        {/* Institutional Purpose Statement */}
        <p className="text-sm sm:text-base text-silver-200/90 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
          The institutional grievance redressal system for students, faculty, and administration —
          providing confidential reporting, direct departmental routing, and time-bound resolution tracking.
        </p>

        {/* Apple-grade Liquid Glass Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-6">
          <button
            onClick={onGetStarted}
            className="ios-glass-btn-primary rounded-2xl px-7 py-3.5 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer"
          >
            <span>Submit Grievance</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onTrack}
            className="ios-glass-btn-secondary rounded-2xl px-6 py-3.5 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer"
          >
            <Search className="h-4 w-4 text-silver-300" />
            <span>Track Status</span>
          </button>
        </div>

        {/* Floating Capsule for Transparency Wall */}
        <button
          onClick={onViewTransparency}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-silver-300 hover:text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-xl transition-all cursor-pointer shadow-sm"
        >
          <span>Public Transparency Wall</span>
          <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />
        </button>

      </div>

      {/* ── iOS Frosted Glass Widgets Grid ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Lock,
              title: 'Confidential Reporting',
              desc: 'Submit sensitive concerns with anonymous protection without disclosing identity to non-committee members.',
              tag: 'Confidential'
            },
            {
              icon: ShieldCheck,
              title: 'Automated Routing',
              desc: 'Matters automatically dispatch to the responsible department head, hostel warden, or academic counselor.',
              tag: 'Automated'
            },
            {
              icon: Clock,
              title: 'Time-Bound SLA',
              desc: 'Standard issues handled within 7 days. Urgent matters prioritized for 3-day turnaround with escalation.',
              tag: 'Guaranteed'
            },
            {
              icon: FileCheck,
              title: 'Verified Audit Trail',
              desc: 'Every committee action, status update, and remark is recorded with timestamped institutional accountability.',
              tag: 'Audit Log'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <GlassCard key={idx} className="p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-white/5 border border-white/10 text-silver-300">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5 tracking-tight">{item.title}</h3>
                <p className="text-xs text-silver-300 leading-relaxed font-normal">{item.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>

    </div>
  );
};
