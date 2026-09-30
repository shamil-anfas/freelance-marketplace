import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FolderOpen, FileText, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { getProjects } from '../../services/projectService'
import { getProposals } from '../../services/proposalService'

function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-stone-900 mb-1">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  )
}

export default function ClientDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [projects, setProjects] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, propRes] = await Promise.all([
          getProjects(),
          getProposals(),
        ])
        const projs = projRes.data?.data?.results ?? projRes.data?.data ?? []
        const props = propRes.data?.data?.results ?? propRes.data?.data ?? []
        setProjects(Array.isArray(projs) ? projs : [])
        setProposals(Array.isArray(props) ? props : [])
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Layout><Spinner text="Loading dashboard…" /></Layout>

  const openProjects = projects.filter((p) => p.status === 'OPEN').length
  const inProgressProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length
  const recentProjects = [...projects].slice(0, 4)

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Good day, {user?.first_name}! 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">Here's what's happening with your projects</p>
        </div>
        <Link
          to="/client/projects/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-teal-900/30"
        >
          <Plus className="w-4 h-4" />
          Post Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderOpen} label="Total Projects" value={projects.length} color="bg-teal-600/15 text-teal-700" />
        <StatCard icon={Clock} label="Open Projects" value={openProjects} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={TrendingUp} label="In Progress" value={inProgressProjects} color="bg-blue-500/15 text-blue-400" />
        <StatCard icon={FileText} label="Pending Proposals" value={pendingProposals} color="bg-amber-500/15 text-amber-400" />
      </div>

      {/* Recent projects */}
      <div className="bg-white border border-stone-200 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-base font-semibold text-stone-900">Recent Projects</h2>
          <Link
            to="/client/projects"
            className="flex items-center gap-1 text-sm text-teal-700 hover:text-teal-700 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No projects yet</p>
            <Link
              to="/client/projects/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-700/20 hover:bg-teal-700/30 border border-teal-600/30 text-teal-700 text-sm rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Post your first project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {recentProjects.map((proj) => (
              <Link
                key={proj.id}
                to={`/client/projects/${proj.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-stone-100 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 group-hover:text-teal-700 transition-colors truncate">
                    {proj.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {proj.category?.name} • Budget: ₹{proj.budget_min}–₹{proj.budget_max}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <Badge label={proj.status_display || proj.status} variant={proj.status} />
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-stone-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
