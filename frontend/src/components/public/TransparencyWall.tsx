import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Star, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { GlassCard } from '../3d/GlassCard';

export const TransparencyWall: React.FC = () => {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    api.getPublicFeed()
      .then((data) => setFeed(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = categoryFilter 
    ? feed.filter(item => item.category === categoryFilter)
    : feed;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-silver-300 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
              Public Institutional Transparency Board
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Resolved Grievances Feed
            </h1>
            <p className="text-xs sm:text-sm text-silver-400">
              Anonymized public record of resolved issues. Complainant identities are strictly shielded while institutional accountability is maintained.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-silver-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-navy-900 py-1.5 px-3 text-xs text-white focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="hostel">Hostel & Facilities</option>
              <option value="academic">Academic & Labs</option>
              <option value="harassment">Safety & Security</option>
              <option value="admin">Administration</option>
              <option value="other">General Amenities</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
          <span className="h-6 w-6 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-silver-500">Loading feed...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-silver-400 text-xs">
          No resolved grievances on record yet. Completed resolutions will automatically appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <GlassCard key={idx} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-silver-200">
                    {item.complaint_number}
                  </span>
                  <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-silver-400">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Resolved in ~{item.resolution_days || 3} days</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                {item.title}
              </h3>

              <div className="flex items-center justify-between text-[11px] text-silver-400 border-t border-white/10 pt-3 mt-3">
                <span>Office: <b className="text-silver-200">{item.department_name || 'Central Office'}</b></span>
                {item.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{item.rating} / 5</span>
                  </span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
