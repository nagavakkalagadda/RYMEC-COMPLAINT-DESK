import React from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-navy-950/95 pt-12 pb-28 text-silver-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: College Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 border border-white/15 text-white">
                <Building2 className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">RYMEC GRIEVANCE DESK</h3>
                <p className="text-xs text-silver-400 font-medium">Veerasaiva Vidyavardhaka Sangha, Ballari</p>
              </div>
            </div>
            <p className="text-xs text-silver-400 leading-relaxed max-w-md">
              Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), established in 1980, is affiliated to VTU Belagavi, approved by AICTE New Delhi, and accredited with NAAC A+ Grade. This institutional grievance platform ensures swift, transparent, and audited redressal for all students and scholars.
            </p>
            <div className="flex items-center gap-3 text-xs text-silver-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-silver-300 border border-white/10">
                <Award className="h-3.5 w-3.5 text-silver-400" /> NAAC A+ Accredited
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-silver-300 border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> VTU Affiliated
              </span>
            </div>
          </div>

          {/* Col 2: Statutory Redressal Cells */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Statutory Cells</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Internal Complaints Committee (ICC)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Anti-Ragging Squad & Cell</li>
              <li className="hover:text-white transition-colors cursor-pointer">SC/ST/OBC Grievance Committee</li>
              <li className="hover:text-white transition-colors cursor-pointer">Women Protection & Safety Desk</li>
              <li className="hover:text-white transition-colors cursor-pointer">Chief Proctor & Student Welfare</li>
            </ul>
          </div>

          {/* Col 3: Campus Coordinates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Campus Contact</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-silver-400 shrink-0 mt-0.5" />
                <span>Cantonment, Ballari - 583104, Karnataka, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-silver-400 shrink-0" />
                <span>+91 8392 244809 / 244810</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-silver-400 shrink-0" />
                <span>principal@rymec.edu.in</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-silver-500">
          <p>© {new Date().getFullYear()} RYMEC Grievance Redressal Mechanism. All Rights Reserved.</p>
          <p className="font-mono text-[11px]">RYMEC-iSMART Grievance Portal v2.0</p>
        </div>
      </div>
    </footer>
  );
};
