import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintCategory, Department } from '../../types';
import { GlassCard } from '../3d/GlassCard';

interface ComplaintSubmissionFormProps {
  onSuccess?: (complaintNumber: string) => void;
  onGoToTrack?: (id: string) => void;
}

export const ComplaintSubmissionForm: React.FC<ComplaintSubmissionFormProps> = ({
  onSuccess,
  onGoToTrack
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('hostel');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  // AI & Feedback states
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedPriority, setDetectedPriority] = useState<string>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('ragging') || text.includes('harass') || text.includes('unsafe') || text.includes('emergency')) {
      setDetectedPriority('urgent');
      setDetectedCategory('harassment');
    } else if (text.includes('exam') || text.includes('marks') || text.includes('syllabus') || text.includes('professor')) {
      setDetectedCategory('academic');
      setDetectedPriority(text.includes('tomorrow') ? 'high' : 'normal');
    } else if (text.includes('hostel') || text.includes('room') || text.includes('water') || text.includes('mess') || text.includes('food')) {
      setDetectedCategory('hostel');
      setDetectedPriority(text.includes('poison') || text.includes('shock') ? 'urgent' : 'normal');
    } else if (text.includes('fee') || text.includes('scholarship') || text.includes('certificate')) {
      setDetectedCategory('admin');
      setDetectedPriority(text.includes('deadline') ? 'high' : 'normal');
    }
  }, [title, description]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and detailed description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    if (departmentId) formData.append('department_id', departmentId);
    formData.append('is_anonymous', String(isAnonymous));
    if (attachment) formData.append('attachment', attachment);

    try {
      const res = await api.submitComplaint(formData);
      setSubmittedData(res);
      if (onSuccess) onSuccess(res.complaint.complaint_number);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = () => {
    if (submittedData?.complaint?.complaint_number) {
      navigator.clipboard.writeText(submittedData.complaint.complaint_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {submittedData ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-3xl border border-white/10 bg-navy-900/95 p-8 shadow-2xl backdrop-blur-2xl text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <Check className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold text-white">Grievance Registered Successfully</h2>
            <p className="mt-1 text-xs text-silver-400">
              Your complaint has been recorded and assigned to the relevant department head for official action.
            </p>

            {/* Tracking ID Badge */}
            <div className="my-6 inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver-400">Tracking Reference ID</span>
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white">
                  {submittedData.complaint.complaint_number}
                </p>
              </div>
              <button
                onClick={copyId}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* QR Code and Prediction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left mb-6">
              {submittedData.qrCode && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <img
                    src={submittedData.qrCode}
                    alt="Tracking QR Code"
                    className="h-28 w-28 rounded-xl border border-white/10"
                  />
                  <span className="mt-2 text-[11px] font-semibold text-silver-400 flex items-center gap-1">
                    <QrCode className="h-3.5 w-3.5 text-brand-accent" /> Scan to Track
                  </span>
                </div>
              )}

              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver-400">
                  Resolution Target
                </span>
                <p className="mt-1 text-sm font-semibold text-white">
                  {submittedData.prediction?.displayText || '~3-4 business days'}
                </p>
                <div className="mt-2 text-silver-400 space-y-1">
                  <p>Priority: <b className="text-white uppercase">{submittedData.complaint.priority}</b></p>
                  <p>Category: <b className="text-white uppercase">{submittedData.complaint.category}</b></p>
                  <p>Anonymous: <b className="text-white">{submittedData.complaint.is_anonymous ? 'Yes' : 'No'}</b></p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onGoToTrack && onGoToTrack(submittedData.complaint.complaint_number)}
                className="pebble-pill inline-flex items-center gap-2 bg-brand-royal px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-600"
              >
                <span>Track Status</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setSubmittedData(null);
                  setTitle('');
                  setDescription('');
                  setAttachment(null);
                }}
                className="pebble-pill inline-flex items-center gap-2 bg-white/5 px-5 py-2.5 text-xs font-semibold text-silver-300 hover:bg-white/10"
              >
                <span>Submit Another</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Register a Grievance
                </h1>
                <p className="mt-0.5 text-xs text-silver-400">
                  Submissions are recorded with formal institutional timestamping and SLA monitoring.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-silver-300">
                <Clock className="h-3.5 w-3.5 text-silver-400" />
                <span>Target SLA: 3 to 7 Days</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anonymous Checkbox */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-navy-800 text-brand-royal focus:ring-brand-accent"
                />
                <label htmlFor="anonCheck" className="text-xs text-silver-300 cursor-pointer">
                  <span className="font-semibold text-white block">File as Anonymous Grievance</span>
                  Your identity is shielded from department staff and reviewers.
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                  Complaint Subject <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the issue clearly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none"
                />
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-silver-200">Grievance Category</label>
                    {detectedCategory && (
                      <span className="text-[10px] text-silver-400 font-semibold">
                        Auto: {detectedCategory}
                      </span>
                    )}
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 py-2.5 px-3 text-sm text-white focus:border-brand-accent focus:outline-none"
                  >
                    <option value="hostel">Hostel & Facilities</option>
                    <option value="academic">Academic & Curriculum</option>
                    <option value="harassment">Harassment & Safety</option>
                    <option value="admin">Administration & Transport</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                    Routing Department (Optional)
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 py-2.5 px-3 text-sm text-white focus:border-brand-accent focus:outline-none"
                  >
                    <option value="">Auto-Route by Category</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide detailed facts: date, location, specific problem, and affected individuals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-brand-accent focus:outline-none resize-y"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                  Supporting Document (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="pebble-pill flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white">
                    <Paperclip className="h-4 w-4 text-silver-400" />
                    <span>{attachment ? attachment.name : 'Choose File (PDF, PNG, JPG)'}</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                  {attachment && (
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full pebble-pill flex items-center justify-center gap-2 rounded-xl bg-brand-royal py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        )}
      </AnimatePresence>
    </div>
  );
};
