/** Status badge with color variants mapped from project/proposal statuses */
const VARIANTS = {
  OPEN: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-stone-500/15 text-stone-500 border-stone-500/20',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/20',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/20',
  WITHDRAWN: 'bg-stone-500/15 text-stone-500 border-stone-500/20',
  CLIENT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  FREELANCER: 'bg-teal-600/15 text-teal-700 border-teal-600/20',
}

export default function Badge({ label, variant }) {
  const cls = VARIANTS[variant] || VARIANTS[label] || 'bg-stone-500/15 text-stone-500 border-stone-500/20'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}
