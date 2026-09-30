import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Briefcase,
  LayoutDashboard,
  FolderOpen,
  Search,
  FileText,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logoutUser } from '../../store/slices/authSlice'

const clientLinks = [
  { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/client/projects', label: 'My Projects', icon: FolderOpen },
]

const freelancerLinks = [
  { to: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/freelancer/browse', label: 'Browse Projects', icon: Search },
  { to: '/freelancer/proposals', label: 'My Proposals', icon: FileText },
  { to: '/freelancer/saved', label: 'Saved', icon: Heart },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role } = useSelector((state) => state.auth)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const links = role === 'CLIENT' ? clientLinks : freelancerLinks

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-teal-700/20 border border-teal-600/30 rounded-xl flex items-center justify-center group-hover:bg-teal-700/30 transition-colors">
              <Briefcase className="w-5 h-5 text-teal-700" />
            </div>
            <span className="text-stone-900 font-bold text-lg tracking-tight hidden sm:block">
              Freelance<span className="text-teal-700">Hub</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-teal-700/20 text-teal-700 border border-teal-600/30'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span
              className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                role === 'CLIENT'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-teal-600/15 text-teal-700 border border-teal-600/20'
              }`}
            >
              {role}
            </span>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-100 transition-colors text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-teal-700/30 border border-teal-600/40 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <span className="text-stone-600 hidden sm:block max-w-[100px] truncate">
                  {user?.first_name || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-2xl shadow-black/40 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-stone-200">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(to)
                  ? 'bg-teal-700/20 text-teal-700'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Overlay to close dropdowns */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  )
}
