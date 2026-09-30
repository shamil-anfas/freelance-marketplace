import { AlertTriangle, Loader2 } from 'lucide-react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading = false, danger = true }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
          <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              danger
                ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-60'
                : 'bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-60'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
