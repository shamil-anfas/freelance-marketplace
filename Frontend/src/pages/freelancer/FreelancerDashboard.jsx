import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Search, FileText, Clock, CheckCircle2, TrendingUp, ArrowRight, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { getProposals } from '../../services/proposalService'
import { getSavedProjects } from '../../services/wishlistService'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export default function FreelancerDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [proposals, setProposals] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [propRes, savedRes] = await Promise.all([getProposals(), getSavedProjects()])
        const props = propRes.data?.data?.results ?? propRes.data?.data ?? []
        const svd = savedRes.data?.data?.results ?? savedRes.data?.data ?? []
        setProposals(Array.isArray(props) ? props : [])
        setSaved(Array.isArray(svd) ? svd : [])
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Layout><Spinner text="Loading dashboard…" /></Layout>

  const pending = proposals.filter((p) => p.status === 'PENDING').length
  const accepted = proposals.filter((p) => p.status === 'ACCEPTED').length

  const recentProposals = [...proposals].slice(0, 5)

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user?.first_name}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your freelancing activity</p>
        </div>
        <Link
          to="/freelancer/browse"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" /> Browse Projects
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Proposals" value={proposals.length} color="bg-violet-500/15 text-violet-400" />
        <StatCard icon={Clock} label="Pending" value={pending} color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={CheckCircle2} label="Accepted" value={accepted} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={Heart} label="Saved Projects" value={saved.length} color="bg-pink-500/15 text-pink-400" />
      </div>

      {/* Recent proposals */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Recent Proposals</h2>
          <Link to="/freelancer/proposals" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProposals.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No proposals yet</p>
            <Link to="/freelancer/browse" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-sm rounded-xl transition-colors">
              <Search className="w-4 h-4" /> Browse open projects
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentProposals.map((prop) => (
              <div key={prop.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {prop.project?.title || 'Project'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bid: ₹{prop.bid_amount} • {prop.estimated_days} days
                  </p>
                </div>
                <Badge label={prop.status} variant={prop.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
