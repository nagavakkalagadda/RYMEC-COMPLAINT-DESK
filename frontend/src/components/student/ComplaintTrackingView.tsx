import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  QrCode, 
  Paperclip
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, TimelineEvent, Attachment } from '../../types';
import { GlassCard } from '../3d/GlassCard';

interface ComplaintTrackingViewProps {
  initialId?: string;
}

export const ComplaintTrackingView: React.FC<ComplaintTrackingViewProps> = ({ initialId = '' }) => {
  const [complaintNumber, setComplaintNumber] = useState(initialId);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sla, setSla] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rating state
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Reopen state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch?: string) => {
    const id = idToSearch || complaintNumber;
    if (!id.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.trackComplaint(id.trim());
      setComplaint(data.complaint);
      setTimeline(data.timeline || []);
      setAttachments(data.attachments || []);
      setSla(data.sla || null);
      if (data.rating) {
        setUserRating(data.rating.rating);
        setRatingFeedback(data.rating.feedback || '');
        setRatingSubmitted(true);
      } else {
        setRatingSubmitted(false);
      }
    } catch (err: any) {
      setError(err.message || 'No grievance record found with this ID.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async () => {
    if (!complaint) return;
    try {
      await api.rateComplaint(complaint.id, userRating, ratingFeedback);
      setRatingSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating');
    }
  };

  const handleReopen = async () => {
    if (!complaint || !reopenReason.trim()) return;
    setReopenLoading(true);
    try {
      await api.reopenComplaint(complaint.id, reopenReason);
      setShowReopenModal(false);
      setReopenReason('');
      handleSearch(complaint.complaint_number);
    } catch (err: any) {
      alert(err.message || 'Failed to reopen complaint');
    } finally {
      setReopenLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Search Bar Card */}
      <GlassCard className="p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          Track Grievance Status
        </h1>
        <p className="text-xs text-silver-400 mb-4">
          Enter your unique Tracking ID to view real-time administrative progress and milestone audits.
        </p>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-silver-500" />
            <input
              type="text"
              placeholder="Enter Grievance Tracking ID (e.g., GRV-2026-XXXXX)"
              value={complaintNumber}
              onChange={(e) => setComplaintNumber(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm font-mono text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="pebble-pill inline-flex items-center justify-center gap-2 bg-brand-royal px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Details View */}
      {complaint && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Overview Card */}
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-lg sm:text-xl font-bold text-white">
                    {complaint.complaint_number}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-silver-300">
                    {complaint.status}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-silver-300">
                    {complaint.priority} Priority
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{complaint.title}</h2>
              </div>

              {sla && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-right sm:min-w-44 text-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-silver-400 block">SLA Response</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {sla.displayText}
                  </p>
                  <span className="text-[10px] text-silver-500 block">
                    Target: {new Date(complaint.sla_deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="my-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-1.5">Description</h4>
              <p className="text-sm text-silver-200 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-silver-300 border-t border-white/10 pt-4">
              <div>
                <span className="text-silver-500 block text-[10px]">Category</span>
                <span className="font-semibold text-white uppercase">{complaint.category}</span>
              </div>
              <div>
                <span className="text-silver-500 block text-[10px]">Department</span>
                <span className="font-semibold text-white">{complaint.department_name || 'Central Office'}</span>
              </div>
              <div>
                <span className="text-silver-500 block text-[10px]">Submitted By</span>
                <span className="font-semibold text-white">
                  {complaint.is_anonymous ? 'Protected (Anonymous)' : complaint.student_name_snapshot || 'Student'}
                </span>
              </div>
              <div>
                <span className="text-silver-500 block text-[10px]">Registered On</span>
                <span className="font-semibold text-white">{new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-[11px] font-semibold uppercase text-silver-400 block mb-2">Supporting Documents</span>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-silver-300 hover:bg-white/10 hover:text-white"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>{att.file_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Timeline */}
          <GlassCard className="p-6 sm:p-8">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-silver-400" />
              <span>Grievance Audit Timeline</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/20">
              {timeline.map((event, index) => (
                <div key={event.id || index} className="relative group">
                  <div className="absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 border border-white/40 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-silver-300">
                          {event.status}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          Action by {event.author_name || event.action_role.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-silver-500">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-silver-300 leading-relaxed mt-1">
                      {event.remark}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Reopen Modal */}
          <AnimatePresence>
            {showReopenModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" onClick={() => setShowReopenModal(false)} />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-navy-900 p-6 shadow-2xl backdrop-blur-2xl"
                >
                  <h3 className="text-lg font-bold text-white mb-2">Reopen Grievance</h3>
                  <p className="text-xs text-silver-400 mb-4">
                    Provide reasons why the previous resolution was inadequate or requires further action.
                  </p>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe specific grounds for reopening..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-silver-500 focus:outline-none mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowReopenModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-silver-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReopen}
                      disabled={reopenLoading || reopenReason.trim().length < 10}
                      className="pebble-pill rounded-xl bg-brand-royal px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {reopenLoading ? 'Submitting...' : 'Confirm'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      )}

    </div>
  );
};
