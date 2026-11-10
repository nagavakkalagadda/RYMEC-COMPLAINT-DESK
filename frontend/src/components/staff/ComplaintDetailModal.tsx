import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Clock, 
  User, 
  CheckCircle
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdated
}) => {
  if (!complaint) return null;

  const [status, setStatus] = useState(complaint.status);
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      await api.updateStatus(complaint.id, status, remarks);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-navy-900 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-silver-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-sm font-bold text-white">
            {complaint.complaint_number}
          </span>
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-silver-300">
            {complaint.priority} Priority
          </span>
          {complaint.is_escalated && (
            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
              Escalated Level {complaint.escalation_level}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-4">{complaint.title}</h2>

        {/* Complainant metadata */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-silver-500 block text-[10px] uppercase font-semibold">Complainant</span>
            <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 text-silver-400" />
              {complaint.is_anonymous ? 'Anonymous Student' : complaint.student_name_snapshot || 'Student'}
            </span>
            {!complaint.is_anonymous && complaint.student_usn && (
              <span className="text-[11px] text-silver-400 block mt-0.5 font-mono">
                USN: {complaint.student_usn}
              </span>
            )}
          </div>

          <div>
            <span className="text-silver-500 block text-[10px] uppercase font-semibold">Category & Department</span>
            <span className="font-semibold text-white block mt-0.5 uppercase">
              {complaint.category} • {complaint.department_name || 'General'}
            </span>
            <span className="text-[11px] text-silver-400 block mt-0.5">
              SLA Deadline: {new Date(complaint.sla_deadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
            Grievance Description
          </label>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-silver-200 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleUpdate} className="space-y-4 border-t border-white/10 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-silver-300">
            Administrative Action & Status Update
          </h3>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-silver-300 block mb-1">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-navy-800 py-2 px-3 text-xs text-white focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-silver-300 block mb-1">SLA Deadline</label>
              <div className="rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-silver-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-silver-400" />
                <span>{new Date(complaint.sla_deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-silver-300 block mb-1">
              Official Remark / Action Taken Report
            </label>
            <textarea
              rows={3}
              required
              placeholder="State action taken or response for student..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-silver-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-silver-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating || !remarks.trim()}
              className="pebble-pill flex items-center gap-2 rounded-xl bg-brand-royal px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {updating ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
