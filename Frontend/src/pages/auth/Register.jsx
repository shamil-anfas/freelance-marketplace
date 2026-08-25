import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerUser, clearError } from '../../store/slices/authSlice'

const ROLES = [
  { value: 'CLIENT', label: 'Client', description: 'I want to hire freelancers' },
  { value: 'FREELANCER', label: 'Freelancer', description: 'I want to find work' },
]

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    dispatch(clearError())
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please sign in. 🎉')
      navigate('/login')
    } else {
      // Backend can return field-level errors or a detail string
      const payload = result.payload
      const msg =
        payload?.detail ||
        payload?.message ||
        payload?.email?.[0] ||
        payload?.password?.[0] ||
        'Registration failed. Please check your details.'
      toast.error(msg)
    }
  }

  // Extract field-specific errors from payload
  const fieldError = (field) => error?.[field]?.[0] || null

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-violet-600/20 border border-violet-500/30 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Join the freelance marketplace</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                id={`role-${r.value.toLowerCase()}`}
                onClick={() => setForm((prev) => ({ ...prev, role: r.value }))}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                  form.role === r.value
                    ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/40'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
                }`}
              >
                <span className="text-sm font-semibold text-white">{r.label}</span>
                <span className="text-xs text-slate-400 mt-0.5">{r.description}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="register-first-name" className="text-xs font-medium text-slate-300">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="register-first-name"
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                  />
                </div>
                {fieldError('first_name') && (
                  <p className="text-red-400 text-xs">{fieldError('first_name')}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="register-last-name" className="text-xs font-medium text-slate-300">
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="register-last-name"
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                  />
                </div>
                {fieldError('last_name') && (
                  <p className="text-red-400 text-xs">{fieldError('last_name')}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-xs font-medium text-slate-300">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                />
              </div>
              {fieldError('email') && (
                <p className="text-red-400 text-xs">{fieldError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-xs font-medium text-slate-300">
                Password
                <span className="text-slate-500 font-normal ml-1">(min 8 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldError('password') && (
                <p className="text-red-400 text-xs">{fieldError('password')}</p>
              )}
            </div>

            {/* Global error */}
            {error && !fieldError('email') && !fieldError('password') && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error.detail || error.message || 'Something went wrong. Please try again.'}
              </p>
            )}

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
