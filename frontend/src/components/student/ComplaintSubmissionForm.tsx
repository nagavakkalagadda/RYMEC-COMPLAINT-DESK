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
  ExternalLink,
  Film,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  X,
  Building2,
  BookOpen,
  ShieldAlert,
  Landmark,
  MessageSquare,
  Zap,
  GraduationCap,
  UserCheck,
  Award,
  Laptop,
  Lock,
  BarChart3,
  Globe,
  Cpu,
  Radio,
  Settings,
  HardHat,
  FileText,
  Flame,
  AlertOctagon
} from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintCategory, Department } from '../../types';
import { GlassCard } from '../3d/GlassCard';
import { GlassSelect, GlassSelectOption } from '../common/GlassSelect';
import { EvidenceViewerModal, EvidenceItem } from '../common/EvidenceViewerModal';

interface ComplaintSubmissionFormProps {
  onSuccess?: (complaintNumber: string) => void;
  onGoToTrack?: (id: string) => void;
}

interface PhotoItem {
  file: File;
  id: string;
  preview: string;
  size: number;
}

interface VideoItem {
  file: File;
  preview: string;
  size: number;
}

const MAX_PHOTO_SIZE = 200 * 1024; // 200 KB per photo
const MAX_VIDEO_SIZE = 2 * 1024 * 1024; // 2 MB per video

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const ComplaintSubmissionForm: React.FC<ComplaintSubmissionFormProps> = ({
  onSuccess,
  onGoToTrack
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('hostel');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('auto');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Evidence attachments state (both photos and video supported together)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videoFile, setVideoFile] = useState<VideoItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<EvidenceItem | null>(null);
  const [previewModalIndex, setPreviewModalIndex] = useState<number>(0);

  // AI & Feedback states
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedPriority, setDetectedPriority] = useState<string>('normal');
  const [priority, setPriority] = useState<string>('normal');
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
      setPriority('urgent');
      setDetectedCategory('harassment');
    } else if (text.includes('exam') || text.includes('marks') || text.includes('syllabus') || text.includes('professor')) {
      setDetectedCategory('academic');
      const p = text.includes('tomorrow') ? 'high' : 'normal';
      setDetectedPriority(p);
      setPriority(p);
    } else if (text.includes('hostel') || text.includes('room') || text.includes('water') || text.includes('mess') || text.includes('food')) {
      setDetectedCategory('hostel');
      const p = text.includes('poison') || text.includes('shock') ? 'urgent' : 'normal';
      setDetectedPriority(p);
      setPriority(p);
    } else if (text.includes('fee') || text.includes('scholarship') || text.includes('certificate')) {
      setDetectedCategory('admin');
      const p = text.includes('deadline') ? 'high' : 'normal';
      setDetectedPriority(p);
      setPriority(p);
    }
  }, [title, description]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      if (videoFile) URL.revokeObjectURL(videoFile.preview);
    };
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError(null);
    setError(null);

    const incoming = Array.from(e.target.files);
    const rejected: string[] = [];
    const accepted: PhotoItem[] = [];

    incoming.forEach((file) => {
      if (file.size > MAX_PHOTO_SIZE) {
        rejected.push(`"${file.name}" (${formatFileSize(file.size)})`);
      } else {
        accepted.push({
          file,
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          preview: URL.createObjectURL(file),
          size: file.size
        });
      }
    });

    if (rejected.length > 0) {
      setUploadError(
        `Max size is 200 KB per photo. Excluded: ${rejected.join(', ')}. Please compress before uploading.`
      );
    }

    if (accepted.length > 0) {
      setPhotos((prev) => [...prev, ...accepted]);
    }

    e.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError(null);
    setError(null);

    const file = e.target.files[0];
    if (file.size > MAX_VIDEO_SIZE) {
      setUploadError(
        `Video "${file.name}" (${formatFileSize(file.size)}) exceeds the 2 MB limit. Please compress or choose a shorter video.`
      );
      e.target.value = '';
      return;
    }

    if (videoFile) {
      URL.revokeObjectURL(videoFile.preview);
    }

    setVideoFile({
      file,
      preview: URL.createObjectURL(file),
      size: file.size
    });

    e.target.value = '';
  };

  const handleRemoveVideo = () => {
    if (videoFile) {
      URL.revokeObjectURL(videoFile.preview);
      setVideoFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and detailed description.');
      return;
    }

    // Validate photo sizes if any
    for (const p of photos) {
      if (p.size > MAX_PHOTO_SIZE) {
        setError(`Photo "${p.file.name}" exceeds the 200 KB limit (${formatFileSize(p.size)}). Please remove or replace it.`);
        return;
      }
    }

    // Validate video size if any
    if (videoFile && videoFile.size > MAX_VIDEO_SIZE) {
      setError(`Video exceeds 2 MB limit (${formatFileSize(videoFile.size)}). Please compress or choose a shorter video.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('target_role', targetRole);
    formData.append('priority', priority);
    if (departmentId) formData.append('department_id', departmentId);
    formData.append('is_anonymous', String(isAnonymous));

    // Append all photos
    photos.forEach((p) => {
      formData.append('attachments', p.file);
    });

    // Append video if present
    if (videoFile) {
      formData.append('attachments', videoFile.file);
    }

    // Fallback single attachment for backward compatibility
    if (photos.length > 0) {
      formData.append('attachment', photos[0].file);
    } else if (videoFile) {
      formData.append('attachment', videoFile.file);
    }

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

  const resetForm = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    if (videoFile) URL.revokeObjectURL(videoFile.preview);
    setPhotos([]);
    setVideoFile(null);
    setSubmittedData(null);
    setTitle('');
    setDescription('');
    setTargetRole('auto');
    setUploadError(null);
    setError(null);
  };

  const categoryOptions: GlassSelectOption[] = [
    { value: 'hostel', label: 'Hostel & Facilities', icon: <Building2 className="h-3.5 w-3.5 text-sky-400" />, description: 'Rooms, food, water, hygiene, maintenance' },
    { value: 'academic', label: 'Academic & Curriculum', icon: <BookOpen className="h-3.5 w-3.5 text-indigo-400" />, description: 'Classes, labs, faculty, marks, exams' },
    { value: 'harassment', label: 'Harassment & Safety', icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />, description: 'Ragging, bullying, campus safety concerns' },
    { value: 'admin', label: 'Administration & Transport', icon: <Landmark className="h-3.5 w-3.5 text-amber-400" />, description: 'Fees, bus routes, certificates, office' },
    { value: 'other', label: 'Other / General Grievance', icon: <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />, description: 'Miscellaneous campus matters' },
  ];

  const authorityOptions: GlassSelectOption[] = [
    { value: 'auto', label: 'Auto-Route by Category', icon: <Zap className="h-3.5 w-3.5 text-cyan-400" />, description: 'Institutional routing system allocates' },
    { value: 'mentor', label: 'Class Mentor / Proctor', icon: <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />, description: 'Directly to your assigned faculty mentor' },
    { value: 'hod', label: 'Head of Department (HOD)', icon: <Landmark className="h-3.5 w-3.5 text-amber-400" />, description: 'Departmental leadership resolution' },
    { value: 'warden', label: 'Hostel Chief Warden', icon: <Building2 className="h-3.5 w-3.5 text-sky-400" />, description: 'Hostel mess & resident authority' },
    { value: 'lecturer', label: 'Course Lecturer / Faculty', icon: <UserCheck className="h-3.5 w-3.5 text-emerald-400" />, description: 'Subject teacher or lab in-charge' },
    { value: 'principal', label: 'Principal / Central Office', icon: <Award className="h-3.5 w-3.5 text-purple-400" />, description: 'Senior institutional executive' },
  ];

  // Comprehensive Branch & Department list matching Registration exactly
  const ALL_REGISTRATION_BRANCHES = [
    { label: 'Computer Science (CSE)', code: 'CSE', altName: 'Computer Science & Engineering', icon: <Laptop className="h-3.5 w-3.5 text-sky-400" /> },
    { label: 'CSE - Cyber Security', code: 'CSE-CS', altName: 'CSE - Cyber Security', icon: <Lock className="h-3.5 w-3.5 text-rose-400" /> },
    { label: 'Data Science', code: 'DS', altName: 'Data Science', icon: <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> },
    { label: 'Information Science (ISE)', code: 'ISE', altName: 'Information Science & Engineering', icon: <Globe className="h-3.5 w-3.5 text-cyan-400" /> },
    { label: 'AI & Machine Learning (AIML)', code: 'AIML', altName: 'Artificial Intelligence & Machine Learning', icon: <Cpu className="h-3.5 w-3.5 text-purple-400" /> },
    { label: 'Electronics & Comm. (ECE)', code: 'ECE', altName: 'Electronics & Communication Engineering', icon: <Radio className="h-3.5 w-3.5 text-amber-400" /> },
    { label: 'Electrical & Electronics (EEE)', code: 'EEE', altName: 'Electrical & Electronics Engineering', icon: <Zap className="h-3.5 w-3.5 text-yellow-400" /> },
    { label: 'Mechanical Engineering (ME)', code: 'ME', altName: 'Mechanical Engineering', icon: <Settings className="h-3.5 w-3.5 text-slate-400" /> },
    { label: 'Civil Engineering (CIVIL)', code: 'CV', altName: 'Civil Engineering', icon: <HardHat className="h-3.5 w-3.5 text-orange-400" /> },
    { label: 'Hostel & Facilities', code: 'HOSTEL', altName: 'Hostel & Residential Facilities', icon: <Building2 className="h-3.5 w-3.5 text-sky-400" /> },
    { label: 'Student Welfare & Mentorship', code: 'MENTOR', altName: 'Student Welfare & Mentorship', icon: <GraduationCap className="h-3.5 w-3.5 text-indigo-400" /> },
    { label: 'Examination & Registrar', code: 'EXAM', altName: 'Examination & Registrar Office', icon: <FileText className="h-3.5 w-3.5 text-teal-400" /> },
    { label: 'Safety & Anti-Ragging (ICC)', code: 'ICC', altName: 'Internal Complaints Committee (Anti-Ragging/Safety)', icon: <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> }
  ];

  const departmentOptions: GlassSelectOption[] = [
    { value: '', label: 'Auto-Route by Category', icon: <Zap className="h-3.5 w-3.5 text-cyan-400" />, description: 'Institutional routing system allocates' },
    ...ALL_REGISTRATION_BRANCHES.map((b) => {
      const matchedDept = departments.find(
        (d) => d.code === b.code || d.name.toLowerCase().includes(b.code.toLowerCase()) || d.name.toLowerCase() === b.altName.toLowerCase()
      );
      return {
        value: matchedDept ? String(matchedDept.id) : b.code,
        label: b.label,
        icon: b.icon,
        description: b.altName
      };
    })
  ];

  const submissionPriorityOptions: GlassSelectOption[] = [
    { value: 'normal', label: 'Normal / Standard (7-Day SLA)', icon: <Check className="h-3.5 w-3.5 text-emerald-400" />, description: 'Routine maintenance, admin, general inquiries' },
    { value: 'high', label: 'High Priority (48h SLA)', icon: <Flame className="h-3.5 w-3.5 text-amber-400" />, description: 'Time-critical exam, essential facilities, lab issues' },
    { value: 'urgent', label: 'Urgent (Emergency — 24h SLA)', icon: <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />, description: 'Critical safety, harassment, health, or hazard' }
  ];

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
              Your complaint has been recorded and assigned to the relevant department for official action.
            </p>

            {/* Tracking ID Badge */}
            <div className="my-6 inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <span className="text-[10px] font-semibold tracking-wide text-silver-400">Tracking reference ID</span>
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white tabular-nums">
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
                    <QrCode className="h-3.5 w-3.5 text-cyan-400" /> Scan to Track
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
                  <p>Routing: <b className="text-white uppercase">{submittedData.complaint.target_role && submittedData.complaint.target_role !== 'auto' ? submittedData.complaint.target_role : 'Automatic'}</b></p>
                  <p>Evidence: <b className="text-white">
                    {[
                      photos.length > 0 ? `${photos.length} Photo${photos.length > 1 ? 's' : ''}` : null,
                      videoFile ? '1 Video Clip' : null
                    ].filter(Boolean).join(' + ') || 'None'}
                  </b></p>
                  <p>Anonymous: <b className="text-white">{submittedData.complaint.is_anonymous ? 'Yes' : 'No'}</b></p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onGoToTrack && onGoToTrack(submittedData.complaint.complaint_number)}
                className="ios-glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <span>Track Status</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={resetForm}
                className="ios-glass-btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-semibold text-silver-300 hover:text-white cursor-pointer"
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
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
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
                  className="mt-0.5 h-4 w-4 rounded-md border-white/20 bg-navy-800 text-brand-royal focus:ring-cyan-400 cursor-pointer"
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Category, Authority Routing, Department & Priority (Frosted Liquid Glass Selects) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <GlassSelect
                  label="Grievance Category"
                  badge={detectedCategory ? `Auto: ${detectedCategory}` : undefined}
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => setCategory(val as ComplaintCategory)}
                />

                <GlassSelect
                  label="Route to Faculty / Authority"
                  options={authorityOptions}
                  value={targetRole}
                  onChange={(val) => setTargetRole(val)}
                />

                <GlassSelect
                  label="Routing Department (Optional)"
                  options={departmentOptions}
                  value={departmentId}
                  onChange={(val) => setDepartmentId(val)}
                />

                <GlassSelect
                  label="Urgency & Priority Tier"
                  badge={detectedPriority !== 'normal' ? `AI: ${detectedPriority.toUpperCase()}` : undefined}
                  options={submissionPriorityOptions}
                  value={priority}
                  onChange={(val) => setPriority(val)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed facts: date, location, specific problem, and affected individuals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none resize-y"
                />
              </div>

              {/* Supporting Evidence Section: Photos (≤ 200 KB) and/or Video (≤ 2 MB) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-silver-200">
                    Supporting Evidence (Optional)
                  </label>
                  <span className="text-[10px] text-silver-400">
                    Photos ≤ 200 KB each • Video ≤ 2 MB
                  </span>
                </div>

                {/* Upload Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Photo Upload Button */}
                  <label className="pebble-pill flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white transition-all">
                    <ImageIcon className="h-4 w-4 text-cyan-400" />
                    <span>{photos.length > 0 ? `Add Photos (${photos.length} added)` : 'Add Photos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Video Upload Button */}
                  {!videoFile ? (
                    <label className="pebble-pill flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white transition-all">
                      <Film className="h-4 w-4 text-purple-400" />
                      <span>Add Video</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/3gpp"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200">
                      <Film className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="truncate max-w-[130px] font-medium" title={videoFile.file.name}>
                        {videoFile.file.name}
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono">
                        ({formatFileSize(videoFile.size)})
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="text-rose-400 hover:text-rose-300 ml-1 p-0.5 cursor-pointer"
                        title="Remove Video"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Photo Thumbnails */}
                {photos.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-silver-400 px-0.5">
                      <span>Attached Photos ({photos.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          photos.forEach(p => URL.revokeObjectURL(p.preview));
                          setPhotos([]);
                        }}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove All Photos
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {photos.map((item, index) => (
                        <div
                          key={item.id}
                          className="group relative rounded-xl border border-white/10 bg-black/40 overflow-hidden flex flex-col hover:border-cyan-400/50 transition-all cursor-pointer"
                          onClick={() => {
                            setPreviewModalIndex(index);
                            setPreviewModalItem({
                              file_name: item.file.name,
                              file_url: item.preview,
                              mime_type: item.file.type,
                              file_size: item.size
                            });
                          }}
                        >
                          <div className="aspect-square w-full overflow-hidden bg-black/60 relative">
                            <img
                              src={item.preview}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition-opacity">
                              Click to Preview
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(item.id);
                              }}
                              className="absolute top-1 right-1 rounded-md bg-rose-500/80 p-1 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer z-10"
                              title="Remove photo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="p-1 flex items-center justify-between text-[9px] text-silver-300 bg-white/5">
                            <span className="truncate max-w-[55px]" title={item.file.name}>
                              {item.file.name}
                            </span>
                            <span className="font-mono text-emerald-400">
                              {formatFileSize(item.size)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Preview */}
                {videoFile && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-2.5 max-w-sm">
                    <div 
                      className="aspect-video w-full rounded-lg overflow-hidden bg-black/80 flex items-center justify-center relative cursor-pointer group"
                      onClick={() => {
                        setPreviewModalIndex(0);
                        setPreviewModalItem({
                          file_name: videoFile.file.name,
                          file_url: videoFile.preview,
                          mime_type: videoFile.file.type,
                          file_size: videoFile.size
                        });
                      }}
                    >
                      <video
                        src={videoFile.preview}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-silver-400 mt-1 px-1">
                      <span>Click to preview full-screen</span>
                      <span className="text-cyan-400 font-mono">{formatFileSize(videoFile.size)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Evidence Preview Modal */}
              {previewModalItem && (
                <EvidenceViewerModal
                  item={previewModalItem}
                  items={photos.length > 0 ? photos.map(p => ({
                    file_name: p.file.name,
                    file_url: p.preview,
                    mime_type: p.file.type,
                    file_size: p.size
                  })) : [previewModalItem]}
                  currentIndex={previewModalIndex}
                  onClose={() => setPreviewModalItem(null)}
                  onNavigate={(idx) => {
                    setPreviewModalIndex(idx);
                    const p = photos[idx];
                    if (p) {
                      setPreviewModalItem({
                        file_name: p.file.name,
                        file_url: p.preview,
                        mime_type: p.file.type,
                        file_size: p.size
                      });
                    }
                  }}
                />
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full pebble-pill flex items-center justify-center gap-2 rounded-xl bg-brand-royal py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all"
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
