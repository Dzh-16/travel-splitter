import { useEffect, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 内容 */}
      <div className="relative w-full sm:max-w-sm max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-slide-up">
        {title && (
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
