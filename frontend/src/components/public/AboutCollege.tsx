import React from 'react';
import { 
  Building2, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  GraduationCap 
} from 'lucide-react';
import { GlassCard } from '../3d/GlassCard';

export const AboutCollege: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* College Heritage Banner */}
      <GlassCard className="p-6 sm:p-8" glow>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-glass-glow text-white">
            <Building2 className="h-10 w-10" />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              VEERASAIVA VIDYAVARDHAKA SANGHA, BALLARI
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rao Bahadur Y. Mahabaleswarappa Engineering College
            </h1>
            <p className="text-xs sm:text-sm text-silver-300">
              Affiliated to Visvesvaraya Technological University (VTU), Belagavi • Approved by AICTE, New Delhi • Accredited with NAAC A+ Grade
            </p>
          </div>
        </div>
      </GlassCard>

      {/* History and Institutional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <GlassCard className="md:col-span-2 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <span>Legacy of Technical Excellence (Estd. 1980)</span>
          </h2>
          <p className="text-xs text-silver-300 leading-relaxed">
            Rao Bahadur Y. Mahabaleswarappa Engineering College (formerly Vijayanagara Engineering College), was established in the year 1980 by the Veerasaiva Vidyavardhaka Sangha, Ballari. Over the past four decades, RYMEC has evolved into a premier engineering destination in the Kalyana-Karnataka region, nurturing thousands of visionary technocrats and researchers.
          </p>
          <p className="text-xs text-silver-300 leading-relaxed">
            The institution boasts a sprawling lush green campus in Cantonment, Ballari, featuring the state-of-the-art Dr. A.P.J. Abdul Kalam Administrative Block, Aryabhata Academic Block, New Age Innovation Network (NAIN) center for startups, high-performance computing centers, central library, and hygienic residential hostels.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-cyan-400">1980</span>
              <span className="text-[10px] text-silver-400 block">Established</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-emerald-400">NAAC A+</span>
              <span className="text-[10px] text-silver-400 block">Accreditation</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <span className="font-mono text-xl font-bold text-indigo-400">NBA</span>
              <span className="text-[10px] text-silver-400 block">Accredited Depts</span>
            </div>
          </div>
        </GlassCard>

        {/* Contact Coordinates */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Campus Information</h3>
          <div className="space-y-3 text-xs text-silver-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Cantonment, Ballari - 583104, Karnataka, India</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>+91 8392 244809 / 244810</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>principal@rymec.edu.in</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <span className="text-[10px] font-bold uppercase text-silver-400 block mb-2">Verified Visual Asset</span>
            <p className="text-[11px] text-silver-400">
              Campus tour video reference: <a href="https://youtu.be/LvCaovzU9OY" target="_blank" rel="noreferrer" className="text-cyan-400 underline">RYMEC Official Tour (YouTube)</a>
            </p>
          </div>
        </GlassCard>

      </div>

      {/* Statutory Redressal Bodies */}
      <GlassCard className="p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <span>Statutory Redressal & Student Protection Committees</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            {
              title: 'Student Grievance Redressal Committee (SGRC)',
              desc: 'Constituted under AICTE regulations to adjudicate student academic and administrative complaints.'
            },
            {
              title: 'Internal Complaints Committee (ICC)',
              desc: 'Enforces POSH guidelines and protects women students and faculty with zero tolerance.'
            },
            {
              title: 'Anti-Ragging Squad & Flying Committee',
              desc: '24x7 surveillance team covering hostels, bus stops, canteen and campus perimeter to prevent ragging.'
            },
            {
              title: 'SC / ST / OBC Redressal Cell',
              desc: 'Safeguards equal opportunity and addresses any instances of discrimination or scholarship delays.'
            }
          ].map((comm, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-bold text-white mb-1">{comm.title}</h3>
              <p className="text-silver-400 leading-relaxed text-[11px]">{comm.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
};
