import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 text-red-600' : 'bg-violet-50 text-violet-600'}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 justify-center"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 justify-center py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              isDanger 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200' 
                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
            } disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
