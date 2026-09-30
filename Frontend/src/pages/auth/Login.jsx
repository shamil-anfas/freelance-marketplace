import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginUser, clearError } from '../../store/slices/authSlice'
import AuthLayout, { inputClass, labelClass, submitClass } from './AuthLayout'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    dispatch(clearError())
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! Good to see you 👋')
      const userRole = result.payload?.data?.user?.role
      if (userRole === 'CLIENT') navigate('/client/dashboard')
      else if (userRole === 'FREELANCER') navigate('/freelancer/dashboard')
      else navigate('/')
    } else {
      const msg =
        result.payload?.detail ||
        result.payload?.message ||
        'Hmm, that email and password didn’t match. Want to try again?'
      toast.error(msg)
    }
  }

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Pick up right where you left off.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className={labelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className={labelClass}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
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
        </div>

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error.detail || error.message || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button id="login-submit" type="submit" disabled={loading} className={submitClass}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing you in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-stone-500 text-sm mt-6">
        New here?{' '}
        <Link to="/register" className="text-teal-700 hover:text-teal-800 font-bold transition-colors">
          Create a free account
        </Link>
      </p>
    </AuthLayout>
  )
}
