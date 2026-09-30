import { Link } from 'react-router-dom'
import { Briefcase, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex">
      {/* ── Left: brand panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-stone-900 text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Freelance<span className="text-teal-400">Hub</span>
          </span>
        </Link>

        <div className="relative">
          <p className="text-3xl font-extrabold leading-tight tracking-tight">
            Great work finds<br />its people here. ✨
          </p>
          <p className="mt-4 text-stone-400 leading-relaxed max-w-sm">
            Join thousands of clients and freelancers getting real projects done —
            fairly, quickly, and without the awkward bits.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Post a project in under 2 minutes',
              'First proposals in about an hour',
              'Payment released only when you approve',
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-stone-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-stone-500">
          Made with care for clients & freelancers everywhere 💛
        </p>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative">
        <div className="absolute top-24 -right-24 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-teal-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>

          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-stone-900">
              Freelance<span className="text-teal-600">Hub</span>
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xl shadow-stone-900/5">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">{title}</h1>
            <p className="text-stone-500 text-sm mt-1 mb-7">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Shared warm input style
export const inputClass =
  'w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/40 focus:border-teal-600 transition'

export const labelClass = 'text-sm font-semibold text-stone-700'

export const submitClass =
  'w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all shadow-lg shadow-teal-700/25'
