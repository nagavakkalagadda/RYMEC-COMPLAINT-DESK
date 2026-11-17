import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Clock, 
  User, 
  CheckCircle,
  Film,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { EvidenceViewerModal, EvidenceItem } from '../common/EvidenceViewerModal';

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
  const [viewingAttachment, setViewingAttachment] = useState<EvidenceItem | null>(null);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-navy-950/85 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        className="relative z-10 w-full max-w-xl rounded-2xl sm:rounded-3xl border border-white/15 bg-navy-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[82vh] flex flex-col my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                {complaint.complaint_number}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-silver-300">
                {complaint.priority} Priority
              </span>
              {complaint.is_escalated && (
                <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                  Escalated L{complaint.escalation_level}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
              {complaint.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-silver-400 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-3 custom-scrollbar">
          
          {/* Complainant & Category Metadata */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-silver-500 block text-[10px] uppercase font-semibold">Complainant</span>
              <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5 text-silver-400 shrink-0" />
                <span className="truncate">{complaint.is_anonymous ? 'Anonymous Student' : complaint.student_name_snapshot || 'Student'}</span>
              </span>
              {!complaint.is_anonymous && complaint.student_usn && (
                <span className="text-[10px] text-silver-400 block mt-0.5 font-mono">
                  USN: {complaint.student_usn}
                </span>
              )}
            </div>

            <div>
              <span className="text-silver-500 block text-[10px] uppercase font-semibold">Department &amp; SLA</span>
              <span className="font-semibold text-white block mt-0.5 uppercase truncate text-[11px]">
                {complaint.category} • {complaint.department_name || 'General'}
              </span>
              <span className="text-[10px] text-silver-400 block mt-0.5 font-mono">
                SLA: {new Date(complaint.sla_deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
              Grievance Description
            </label>
            <div className="rounded-xl border border-white/10 bg-black/30 p-2.5 sm:p-3 text-xs text-silver-200 leading-relaxed whitespace-pre-wrap max-h-24 sm:max-h-28 overflow-y-auto custom-scrollbar">
              {complaint.description}
            </div>
          </div>

          {/* Supporting Evidence Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
                Supporting Evidence ({complaint.attachments.length} file{complaint.attachments.length > 1 ? 's' : ''})
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                {complaint.attachments.map((att: any) => {
                  const isVideo = att.mime_type?.startsWith('video/') || att.file_name?.match(/\.(mp4|webm|mov|3gp)$/i);
                  return (
                    <button
                      key={att.id || att.file_url}
                      type="button"
                      onClick={() => setViewingAttachment(att)}
                      className="group relative flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-silver-300 hover:border-cyan-400/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-left"
                    >
                      {isVideo ? (
                        <Film className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[120px] text-[11px] font-medium">{att.file_name}</span>
                      {att.file_size && (
                        <span className="text-[9px] text-silver-500 font-mono">
                          {att.file_size > 1048576 
                            ? `${(att.file_size / 1048576).toFixed(1)}MB` 
                            : `${Math.round(att.file_size / 1024)}KB`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evidence Fullscreen Lightbox Modal */}
          {viewingAttachment && (
            <EvidenceViewerModal
              item={viewingAttachment}
              items={complaint.attachments}
              currentIndex={complaint.attachments.findIndex((a: any) => a.id === viewingAttachment.id || a.file_url === viewingAttachment.file_url)}
              onClose={() => setViewingAttachment(null)}
              onNavigate={(idx) => setViewingAttachment(complaint.attachments?.[idx] || null)}
            />
          )}

          {/* Action Form */}
          <form id="complaintReviewForm" onSubmit={handleUpdate} className="space-y-3 border-t border-white/10 pt-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              Administrative Action &amp; Status Update
            </h3>

            {error && (
              <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-silver-300 block mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-navy-800 py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="pending">Pending</option>
                  <option value="review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-silver-300 block mb-1">Target Resolution</label>
                <div className="rounded-xl border border-white/10 bg-white/5 py-1.5 px-2.5 text-xs text-silver-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-silver-400 shrink-0" />
                  <span>{new Date(complaint.sla_deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-silver-300 block mb-1">
                Official Remark / Action Taken Report
              </label>
              <textarea
                rows={2}
                required
                placeholder="State official action taken or redressal response for student..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-silver-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </form>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10 mt-auto shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-silver-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="complaintReviewForm"
            disabled={updating || !remarks.trim()}
            className="pebble-pill flex items-center gap-1.5 rounded-xl bg-brand-royal px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-600 disabled:opacity-50 transition-all cursor-pointer"
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

      </motion.div>
    </div>
  );
};
