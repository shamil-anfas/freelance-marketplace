import { Link } from 'react-router-dom'
import {
  Briefcase, ArrowRight, Search, FileCheck, Wallet,
  Star, ShieldCheck, Zap, Heart, Menu, X,
} from 'lucide-react'
import { useState } from 'react'

const categories = [
  { name: 'Web Development', gigs: '12k+ gigs', emoji: '💻' },
  { name: 'Design & Creative', gigs: '9k+ gigs', emoji: '🎨' },
  { name: 'Writing & Content', gigs: '7k+ gigs', emoji: '✍️' },
  { name: 'Marketing & SEO', gigs: '5k+ gigs', emoji: '📈' },
  { name: 'Video & Animation', gigs: '4k+ gigs', emoji: '🎬' },
  { name: 'Data & AI', gigs: '3k+ gigs', emoji: '🤖' },
]

const steps = [
  { icon: Search, title: 'Post or find work', text: 'Clients share what they need in minutes. Freelancers browse projects that actually fit their skills.' },
  { icon: FileCheck, title: 'Agree & collaborate', text: 'Send a proposal, chat directly, and agree on scope and price — no middlemen, no confusion.' },
  { icon: Wallet, title: 'Get paid securely', text: 'Work gets approved, payment gets released. Simple, transparent, and on time — every time.' },
]

const testimonials = [
  { name: 'Sarah M.', role: 'Startup founder', quote: 'I posted on Monday morning and had a designer delivering by Friday. It honestly felt too easy.', initials: 'SM', color: 'bg-amber-100 text-amber-700' },
  { name: 'Daniel K.', role: 'Freelance developer', quote: 'This is the first platform where I actually keep what I earn and clients treat me like a partner.', initials: 'DK', color: 'bg-teal-100 text-teal-700' },
  { name: 'Priya R.', role: 'Marketing lead', quote: 'We stopped using agencies entirely. Our go-to writer and editor both came from here.', initials: 'PR', color: 'bg-rose-100 text-rose-700' },
]

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans antialiased">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-lg border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-stone-900">
              Freelance<span className="text-teal-600">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <a href="#how" className="hover:text-teal-700 transition-colors">How it works</a>
            <a href="#categories" className="hover:text-teal-700 transition-colors">Categories</a>
            <a href="#stories" className="hover:text-teal-700 transition-colors">Stories</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-stone-700 hover:text-teal-700 px-4 py-2 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-teal-700 transition-all shadow-md">
              Join free
            </Link>
          </div>

          <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 text-stone-600">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 px-4 py-4 space-y-2 bg-[#FDFBF7]">
            <a href="#how" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">How it works</a>
            <a href="#categories" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">Categories</a>
            <a href="#stories" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">Stories</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center text-sm font-semibold border border-stone-300 px-4 py-2.5 rounded-full">Log in</Link>
              <Link to="/register" className="flex-1 text-center text-sm font-semibold bg-stone-900 text-white px-4 py-2.5 rounded-full">Join free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-32 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full pl-1.5 pr-4 py-1.5 text-xs font-medium text-stone-600 shadow-sm mb-6">
              <span className="bg-teal-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">NEW</span>
              Zero commission week for new freelancers 🎉
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.08] tracking-tight text-stone-900">
              Great work finds <span className="text-teal-700 underline decoration-amber-400 decoration-4 underline-offset-4">its people</span> here.
            </h1>
            <p className="mt-5 text-lg text-stone-600 leading-relaxed max-w-lg">
              Whether you're hiring for a weekend project or building your freelance career —
              meet real people, agree fair prices, and get things done without the awkward bits.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-teal-700 text-white font-semibold px-7 py-3.5 rounded-full hover:bg-teal-800 transition-all shadow-lg shadow-teal-700/25">
                Start hiring — it's free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-stone-900 text-stone-900 font-semibold px-7 py-3.5 rounded-full hover:bg-stone-900 hover:text-white transition-all">
                Find work <Heart className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {['SM', 'DK', 'PR', '+'].map((t, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-[#FDFBF7] flex items-center justify-center text-xs font-bold ${i === 3 ? 'bg-stone-900 text-white' : 'bg-gradient-to-br from-teal-100 to-amber-100 text-stone-700'}`}>
                    {i === 3 ? '9k' : t}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  <span className="ml-1 font-bold text-stone-900">4.9</span>
                </div>
                <p className="text-stone-500">Loved by 9,000+ members</p>
              </div>
            </div>
          </div>

          {/* Hero card visual */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl shadow-stone-900/10 p-6 rotate-1">
              <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">SM</div>
                <div>
                  <p className="font-semibold text-sm text-stone-900">Sarah needs a logo ✨</p>
                  <p className="text-xs text-stone-500">Posted 2 hours ago · $250 budget</p>
                </div>
                <span className="ml-auto text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">OPEN</span>
              </div>
              <div className="py-4 space-y-3">
                {[
                  { n: 'Daniel K.', b: '$220 · 5.0 ★ · can start today', hot: true },
                  { n: 'Priya R.', b: '$240 · 4.9 ★ · logo specialist', hot: false },
                ].map((p) => (
                  <div key={p.n} className={`flex items-center gap-3 p-3 rounded-2xl border ${p.hot ? 'border-teal-500 bg-teal-50/60' : 'border-stone-200'}`}>
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">{p.n[0]}</div>
                    <div className="text-sm"><p className="font-semibold text-stone-900">{p.n}</p><p className="text-xs text-stone-500">{p.b}</p></div>
                    {p.hot && <span className="ml-auto text-[11px] font-bold bg-teal-700 text-white px-2.5 py-1 rounded-full">HIRE</span>}
                  </div>
                ))}
              </div>
              <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                <p className="text-xs leading-relaxed"><span className="font-bold">Payment protected.</span> Money is only released when you approve the work. 🤝</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl border border-stone-200 shadow-xl px-4 py-3 flex items-center gap-2.5 -rotate-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <p className="text-xs font-semibold text-stone-800">Avg. first proposal in <span className="text-teal-700">47 minutes</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-stone-200/80 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-stone-500 font-medium">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-teal-600" /> Secure payments</span>
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> Verified reviews</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-teal-600" /> Fast matching</span>
          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-400" /> Human support, 7 days</span>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-widest text-center">How it works</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-center text-stone-900 tracking-tight">No jargon. Just three easy steps.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-white rounded-3xl border border-stone-200 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-700/25">
                <s.icon className="w-6 h-6" />
              </div>
              <p className="mt-5 text-xs font-bold text-stone-400">STEP {i + 1}</p>
              <h3 className="mt-1 text-lg font-bold text-stone-900">{s.title}</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="bg-stone-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-amber-400 uppercase tracking-widest">Explore</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Whatever you need, someone here does it brilliantly.</h2>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200 shrink-0">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link key={c.name} to="/register" className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-5 hover:bg-stone-800 hover:border-amber-400/50 hover:-translate-y-1 transition-all group">
                <span className="text-3xl">{c.emoji}</span>
                <p className="mt-3 text-sm font-bold group-hover:text-amber-300 transition-colors">{c.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{c.gigs}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stories ── */}
      <section id="stories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-widest text-center">Real stories</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-center text-stone-900 tracking-tight">People like you, getting things done 💛</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure key={t.name} className="bg-white rounded-3xl border border-stone-200 p-7 shadow-sm">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-stone-700 leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${t.color}`}>{t.initials}</div>
                <div><p className="text-sm font-bold text-stone-900">{t.name}</p><p className="text-xs text-stone-500">{t.role}</p></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden bg-teal-800 rounded-[2rem] px-8 py-14 sm:p-14 text-center shadow-2xl">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Ready when you are. Come say hi 👋</h2>
            <p className="mt-3 text-teal-100 max-w-xl mx-auto">Join free in under a minute. Post your first project or land your first client today.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-amber-400 text-stone-900 font-bold px-8 py-3.5 rounded-full hover:bg-amber-300 transition-all shadow-lg">
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all">
                Log in
              </Link>
            </div>
            <p className="mt-4 text-xs text-teal-200">Free forever plan · No credit card needed</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900">FreelanceHub</span>
          </div>
          <p className="text-xs text-stone-500">Made with care for clients & freelancers everywhere 💛 · © 2026</p>
          <div className="flex gap-2 text-sm font-medium">
            <Link to="/login" className="text-stone-600 hover:text-teal-700 px-3 py-1">Log in</Link>
            <Link to="/register" className="text-stone-600 hover:text-teal-700 px-3 py-1">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
