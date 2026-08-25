import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCurrentUser } from '../store/slices/authSlice'

// Auth
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// Profile
import ProfilePage from '../pages/profile/ProfilePage'

// Client
import ClientDashboard from '../pages/client/ClientDashboard'
import MyProjects from '../pages/client/MyProjects'
import CreateProject from '../pages/client/CreateProject'
import EditProject from '../pages/client/EditProject'
import ClientProjectDetail from '../pages/client/ClientProjectDetail'

// Freelancer
import FreelancerDashboard from '../pages/freelancer/FreelancerDashboard'
import BrowseProjects from '../pages/freelancer/BrowseProjects'
import FreelancerProjectDetail from '../pages/freelancer/FreelancerProjectDetail'
import MyProposals from '../pages/freelancer/MyProposals'
import SavedProjects from '../pages/freelancer/SavedProjects'

/** Redirects authenticated users away from public-only routes (login/register) */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth)
  if (isAuthenticated) {
    if (role === 'CLIENT') return <Navigate to="/client/dashboard" replace />
    if (role === 'FREELANCER') return <Navigate to="/freelancer/dashboard" replace />
    return <Navigate to="/profile" replace />
  }
  return children
}

/** Protects routes that require authentication */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/** Protects routes based on user role */
const RoleRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole } = useSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (userRole !== role) return <Navigate to="/" replace />
  return children
}

/** Smart root redirect – sends user to their dashboard or login */
const RootRedirect = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role === 'CLIENT') return <Navigate to="/client/dashboard" replace />
  if (role === 'FREELANCER') return <Navigate to="/freelancer/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function AppRoutes() {
  const dispatch = useDispatch()
  const { accessToken, user, loading } = useSelector((state) => state.auth)

  // On page reload: if a token exists but user isn't hydrated yet, fetch the user
  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchCurrentUser())
    }
  }, [accessToken, user, dispatch])

  // While validating an existing token, show nothing to avoid flash redirects
  if (loading && accessToken && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public / Guest-only routes ──────────────────────────────── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* ── Protected routes – any authenticated user ───────────────── */}
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* ── Client-only routes ──────────────────────────────────────── */}
        <Route path="/client/dashboard" element={<RoleRoute role="CLIENT"><ClientDashboard /></RoleRoute>} />
        <Route path="/client/projects" element={<RoleRoute role="CLIENT"><MyProjects /></RoleRoute>} />
        <Route path="/client/projects/create" element={<RoleRoute role="CLIENT"><CreateProject /></RoleRoute>} />
        <Route path="/client/projects/:id/edit" element={<RoleRoute role="CLIENT"><EditProject /></RoleRoute>} />
        <Route path="/client/projects/:id" element={<RoleRoute role="CLIENT"><ClientProjectDetail /></RoleRoute>} />

        {/* ── Freelancer-only routes ──────────────────────────────────── */}
        <Route path="/freelancer/dashboard" element={<RoleRoute role="FREELANCER"><FreelancerDashboard /></RoleRoute>} />
        <Route path="/freelancer/browse" element={<RoleRoute role="FREELANCER"><BrowseProjects /></RoleRoute>} />
        <Route path="/freelancer/projects/:id" element={<RoleRoute role="FREELANCER"><FreelancerProjectDetail /></RoleRoute>} />
        <Route path="/freelancer/proposals" element={<RoleRoute role="FREELANCER"><MyProposals /></RoleRoute>} />
        <Route path="/freelancer/saved" element={<RoleRoute role="FREELANCER"><SavedProjects /></RoleRoute>} />

        {/* ── Default ─────────────────────────────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
