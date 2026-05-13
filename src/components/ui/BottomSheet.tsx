import { useEffect, ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-t-2xl p-6 shadow-xl animate-slide-up">
        {/* 拖拽条 */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
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
