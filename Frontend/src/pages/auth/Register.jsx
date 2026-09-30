import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerUser, clearError } from '../../store/slices/authSlice'
import AuthLayout, { inputClass, labelClass, submitClass } from './AuthLayout'

const ROLES = [
  { value: 'CLIENT', label: 'I want to hire 🤝', description: 'Post projects, meet talent' },
  { value: 'FREELANCER', label: 'I want work ✨', description: 'Find projects, get paid' },
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
      toast.success('You’re in! Let’s get you signed in 🎉')
      navigate('/login')
    } else {
      const payload = result.payload
      const msg =
        payload?.detail ||
        payload?.message ||
        payload?.email?.[0] ||
        payload?.password?.[0] ||
        'Something didn’t look right — mind checking your details?'
      toast.error(msg)
    }
  }

  const fieldError = (field) => error?.[field]?.[0] || null

  return (
    <AuthLayout title="Join us — it's free 🎉" subtitle="Takes under a minute. No credit card, no fuss.">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            id={`role-${r.value.toLowerCase()}`}
            onClick={() => setForm((prev) => ({ ...prev, role: r.value }))}
            className={`flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all ${
              form.role === r.value
                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600/30'
                : 'border-stone-200 bg-stone-50 hover:border-stone-300'
            }`}
          >
            <span className="text-sm font-bold text-stone-900">{r.label}</span>
            <span className="text-xs text-stone-500 mt-0.5">{r.description}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="register-first-name" className={labelClass}>
              First name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                id="register-first-name"
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                required
                className={inputClass}
              />
            </div>
            {fieldError('first_name') && (
              <p className="text-red-600 text-xs">{fieldError('first_name')}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="register-last-name" className={labelClass}>
              Last name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                id="register-last-name"
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                required
                className={inputClass}
              />
            </div>
            {fieldError('last_name') && (
              <p className="text-red-600 text-xs">{fieldError('last_name')}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className={labelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>
          {fieldError('email') && (
            <p className="text-red-600 text-xs">{fieldError('email')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className={labelClass}>
            Password
            <span className="text-stone-400 font-normal ml-1">(min 8 characters)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldError('password') && (
            <p className="text-red-600 text-xs">{fieldError('password')}</p>
          )}
        </div>

        {error && !fieldError('email') && !fieldError('password') && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error.detail || error.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button id="register-submit" type="submit" disabled={loading} className={submitClass}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating your account…
            </>
          ) : (
            'Create free account'
          )}
        </button>
      </form>

      <p className="text-center text-stone-500 text-sm mt-6">
        Already a member?{' '}
        <Link to="/login" className="text-teal-700 hover:text-teal-800 font-bold transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
