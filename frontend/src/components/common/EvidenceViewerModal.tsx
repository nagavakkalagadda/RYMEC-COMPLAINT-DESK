import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Film, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export interface EvidenceItem {
  id?: string | number;
  file_name: string;
  file_url: string;
  mime_type?: string;
  file_size?: number;
}

interface EvidenceViewerModalProps {
  item: EvidenceItem | null;
  items?: EvidenceItem[];
  currentIndex?: number;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  item,
  items = [],
  currentIndex = 0,
  onClose,
  onNavigate
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNavigate && currentIndex < items.length - 1) {
        onNavigate(currentIndex + 1);
      }
      if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  if (!item) return null;

  const isVideo = item.mime_type?.startsWith('video/') || item.file_name?.match(/\.(mp4|webm|mov|3gp)$/i);
  const isImage = item.mime_type?.startsWith('image/') || item.file_name?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = item.file_url;
    a.download = item.file_name || 'evidence-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-navy-950/85 backdrop-blur-2xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border border-white/20 bg-navy-900/95 shadow-2xl overflow-hidden backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2.5 truncate mr-3">
              {isVideo ? (
                <Film className="h-4 w-4 text-purple-400 shrink-0" />
              ) : (
                <ImageIcon className="h-4 w-4 text-cyan-400 shrink-0" />
              )}
              <div className="truncate">
                <h3 className="text-xs sm:text-sm font-semibold text-white truncate" title={item.file_name}>
                  {item.file_name}
                </h3>
                {item.file_size && (
                  <span className="text-[10px] text-silver-400 font-mono">
                    {formatSize(item.file_size)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all cursor-pointer"
                title="Download file"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-silver-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Media Content Preview Container - themed to match college dark navy glass */}
          <div className="relative flex-1 min-h-[300px] max-h-[74vh] overflow-hidden bg-navy-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            {isVideo ? (
              <video
                src={item.file_url}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              >
                Your browser does not support playing this video format.
              </video>
            ) : isImage ? (
              <img
                src={item.file_url}
                alt={item.file_name}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-silver-300">
                <p className="text-sm font-semibold mb-3">Document Attachment</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="ios-glass-btn-primary px-5 py-2 text-xs font-semibold rounded-xl text-white inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Document</span>
                </button>
              </div>
            )}

            {/* Navigation Arrows if multiple items */}
            {items.length > 1 && onNavigate && (
              <>
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate(currentIndex - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/80 border border-white/20 text-white hover:bg-navy-800 transition-all cursor-pointer backdrop-blur-md shadow-lg"
                    title="Previous file"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {currentIndex < items.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onNavigate(currentIndex + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/80 border border-white/20 text-white hover:bg-navy-800 transition-all cursor-pointer backdrop-blur-md shadow-lg"
                    title="Next file"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer Info */}
          {items.length > 1 && (
            <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center justify-center text-xs text-silver-400">
              <span className="tabular-nums">{currentIndex + 1} of {items.length} items</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
