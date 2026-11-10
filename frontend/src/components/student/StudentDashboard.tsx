import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { GlassCard } from '../3d/GlassCard';

interface StudentDashboardProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await api.getMyComplaints();
      setComplaints(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const inReview = complaints.filter(c => c.status === 'review' || c.status === 'reopened').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const rejected = complaints.filter(c => c.status === 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-silver-300">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
              RYMEC Student Grievance Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-silver-400">
              {user?.department || 'Engineering Student'} • USN: <span className="font-mono text-silver-200 font-semibold">{user?.usn_roll || 'Not Set'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('submit')}
              className="pebble-pill inline-flex items-center gap-2 bg-brand-royal px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 active:scale-98"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit Grievance</span>
            </button>
            <button
              onClick={() => onNavigate('track')}
              className="pebble-pill inline-flex items-center gap-2 bg-white/5 px-4 py-2.5 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white"
            >
              <Search className="h-4 w-4" />
              <span>Track By ID</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Filed', count: total },
          { label: 'Pending Triage', count: pending },
          { label: 'Under Review', count: inReview },
          { label: 'Resolved', count: resolved },
          { label: 'Rejected', count: rejected },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-4 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
              {stat.label}
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {stat.count}
            </span>
          </GlassCard>
        ))}
      </div>

      {/* Recent Complaints List */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-silver-400" />
            <h2 className="text-base font-semibold text-white">My Grievances Registry</h2>
          </div>
          {complaints.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
            >
              <span>View All ({complaints.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-silver-500 flex flex-col items-center justify-center gap-2">
            <span className="h-6 w-6 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            <span>Loading registry...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-silver-400 space-y-3">
            <ShieldCheck className="h-10 w-10 text-silver-600 mx-auto" />
            <p className="text-sm font-semibold text-silver-300">No grievances recorded.</p>
            <p className="text-xs text-silver-500 max-w-sm mx-auto">
              You currently have no active or historical grievances on record. Any institutional, hostel, academic, or facility issues can be registered officially.
            </p>
            <button
              onClick={() => onNavigate('submit')}
              className="pebble-pill inline-flex items-center gap-2 bg-brand-royal text-white px-4 py-2 text-xs font-semibold hover:bg-blue-600"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit Grievance</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-silver-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Subject / Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SLA Deadline</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {complaints.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => onNavigate('track', c.complaint_number)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-silver-200">
                      {c.complaint_number}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] text-silver-400 font-semibold">
                      {c.category}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-white/10 text-silver-300">
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-white/10 text-silver-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-silver-400 font-mono text-[11px]">
                      {new Date(c.sla_deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="pebble-pill inline-flex px-3 py-1 text-[11px] font-semibold text-silver-300 bg-white/5 group-hover:bg-white/10">
                        Track →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
