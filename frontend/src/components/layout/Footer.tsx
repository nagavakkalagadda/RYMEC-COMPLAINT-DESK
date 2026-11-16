import React from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-navy-950/95 pt-12 pb-28 text-silver-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: College Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 overflow-hidden p-0.5 shadow-sm shrink-0">
                <img 
                  src="/images/vvs-logo.jpg" 
                  alt="RYMEC VVS Emblem" 
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">RYMEC GRIEVANCE DESK</h3>
                <p className="text-xs text-silver-400 font-medium">Veerasaiva Vidyavardhaka Sangha, Ballari</p>
              </div>
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              Rao Bahadur Y. Mahabaleswarappa Engineering College (RYMEC), Estd. 1980, affiliated to VTU Belagavi, AICTE approved, NAAC A+ accredited. Providing confidential, audited institutional redressal.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-silver-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-silver-300 border border-white/10 text-[11px]">
                <Award className="h-3 w-3 text-silver-400" /> NAAC A+
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-silver-300 border border-white/10 text-[11px]">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> VTU Affiliated
              </span>
            </div>
          </div>

          {/* Col 2: Statutory Redressal Cells */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Statutory Cells</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Student Grievance Redressal (SGRC)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Internal Complaints Committee (ICC)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Anti-Ragging Squad & Cell</li>
              <li className="hover:text-white transition-colors cursor-pointer">SC/ST/OBC Grievance Cell</li>
              <li className="hover:text-white transition-colors cursor-pointer">Women Protection & Safety Desk</li>
            </ul>
          </div>

          {/* Col 3: Campus Coordinates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Campus Contact</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-silver-400 shrink-0 mt-0.5" />
                <span>Cantonment, Ballari - 583104, Karnataka</span>
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

          {/* Col 4: Official Grievance & Report Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Grievance & Report Helpdesk</h4>
            <div className="space-y-2 text-xs">
              <p className="text-silver-400 leading-relaxed text-[11px]">
                For direct complaint filing, status inquiries, or urgent committee escalation:
              </p>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                  Direct Grievance Email
                </span>
                <a 
                  href="mailto:rymec.ismart12@gmail.com" 
                  className="font-medium text-white hover:text-blue-300 transition-colors flex items-center gap-1.5 break-all text-xs"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>rymec.ismart12@gmail.com</span>
                </a>
              </div>
              <p className="text-[11px] text-silver-500">
                Operating Hours: Mon–Sat 9:00 AM – 5:00 PM IST
              </p>
            </div>
          </div>

        </div>

        {/* Project Contributors & Engineering Team Attribution */}
        <div className="border-t border-white/10 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-silver-300">
            <span className="font-semibold text-white">Engineered by CSE Capstone Team:</span>
            <span className="text-silver-400">RYMEC Ballari</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: 'V. Naga Phanendra', user: 'nagavakkalagadda' },
              { name: 'Sumanth Godinal', user: 'sumanthgodinal9369' },
              { name: 'Vinay Reddy', user: 'vinayreddy0224' },
              { name: 'Sharanabasavaraj S', user: 'ssharanabasavaraj371-dev' }
            ].map((m, idx) => (
              <a
                key={idx}
                href={`https://github.com/${m.user}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/15 px-2.5 py-1 text-silver-300 hover:text-white border border-white/10 text-[11px] transition-all"
                title={`${m.name} (@${m.user})`}
              >
                <span className="text-cyan-400 font-mono text-[10px]">@</span>
                <span>{m.user}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-silver-500">
          <p>© {new Date().getFullYear()} RYMEC Grievance Redressal Mechanism. All Rights Reserved.</p>
          <p className="font-mono text-[11px]">RYMEC-iSMART Grievance Portal v2.0</p>
        </div>
      </div>
    </footer>
  );
};
