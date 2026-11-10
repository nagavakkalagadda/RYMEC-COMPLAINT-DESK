import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Clock, 
  Search, 
  ShieldAlert, 
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint, TrendAlert } from '../../types';
import { GlassCard } from '../3d/GlassCard';
import { TrendAlertBanner } from './TrendAlertBanner';
import { ComplaintDetailModal } from './ComplaintDetailModal';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [trends, setTrends] = useState<TrendAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const data = await api.getAllComplaints(params);
      setComplaints(data || []);

      const analytics = await api.getAnalytics().catch(() => null);
      if (analytics?.trendAlerts) {
        setTrends(analytics.trendAlerts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const roleTitleMap: Record<string, { title: string; scope: string }> = {
    lecturer: { title: 'Lecturer Academic Redressal Desk', scope: 'Academic & Curriculum Grievances' },
    warden: { title: 'Chief Warden Residential Office', scope: 'Hostel, Mess & Residential Facilities' },
    hod: { title: 'Head of Department (HOD) Portal', scope: 'Department Grievances & Escalations' },
    mentor: { title: 'Student Welfare & Mentorship Desk', scope: 'Personal, Counseling & Campus Amenities' },
    principal: { title: 'Principal Executive Oversight Desk', scope: 'Institutional Authority Across All Departments' },
  };

  const roleInfo = user?.role ? roleTitleMap[user.role] : { title: 'Administrative Desk', scope: 'Authorized Grievances' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-silver-300 mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-brand-accent" />
              {user?.role?.toUpperCase()} JURISDICTION
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {roleInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-silver-400">
              Authority: <b>{user?.full_name}</b> • Scope: <span className="text-silver-300">{roleInfo.scope}</span>
            </p>
          </div>

          <button
            onClick={loadData}
            className="pebble-pill inline-flex items-center gap-2 bg-white/5 px-4 py-2 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </GlassCard>

      {/* Dynamic Trend Detection Alerts */}
      <TrendAlertBanner alerts={trends} />

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 sm:p-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-silver-500" />
            <input
              type="text"
              placeholder="Search by ID, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-navy-900 py-2 px-3 text-xs text-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="review">In Review</option>
              <option value="reopened">Reopened</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-navy-900 py-2 px-3 text-xs text-white focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </form>
      </GlassCard>

      {/* Complaints Queue Table */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-silver-400" />
            <h2 className="text-base font-semibold text-white">
              Grievance Action Queue ({complaints.length})
            </h2>
          </div>
          <span className="text-xs text-silver-400">
            Click row to review & update
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-silver-500 flex flex-col items-center justify-center gap-2">
            <span className="h-6 w-6 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            <span>Loading complaints queue...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-silver-400 text-xs">
            Queue is currently clear. No pending complaints in your jurisdiction.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-silver-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Grievance ID</th>
                  <th className="py-2.5 px-3">Subject / Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Complainant</th>
                  <th className="py-2.5 px-3">SLA Deadline</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
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
                    <td className="py-3 px-3 text-silver-300">
                      {c.is_anonymous ? 'Anonymous' : c.student_name_snapshot || 'Student'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-silver-400">
                      {new Date(c.sla_deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(c);
                        }}
                        className="pebble-pill inline-flex px-3 py-1 text-[11px] font-semibold text-silver-300 bg-white/5 hover:bg-white/10"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdated={loadData}
      />

    </div>
  );
};
