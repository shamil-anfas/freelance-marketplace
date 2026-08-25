import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Calendar, DollarSign, Tag, Clock,
  User, FileText, CheckCircle2, XCircle, Loader2, Edit3
} from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import ConfirmModal from '../../components/common/ConfirmModal'
import { getProjectById } from '../../services/projectService'
import { getProposals, acceptProposal, rejectProposal } from '../../services/proposalService'

export default function ClientProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionTarget, setActionTarget] = useState(null) // { proposal, action: 'accept'|'reject' }
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, propRes] = await Promise.all([
          getProjectById(id),
          getProposals(),
        ])
        setProject(projRes.data?.data)
        const all = propRes.data?.data?.results ?? propRes.data?.data ?? []
        // Filter proposals for this project
        const filtered = (Array.isArray(all) ? all : []).filter((p) => p.project?.id === id || p.project === id)
        setProposals(filtered)
      } catch {
        toast.error('Failed to load project')
        navigate('/client/projects')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleAction = async () => {
    if (!actionTarget) return
    const { proposal, action } = actionTarget
    try {
      setActioning(true)
      if (action === 'accept') {
        await acceptProposal(proposal.id)
        toast.success('Proposal accepted! Project is now In Progress.')
      } else {
        await rejectProposal(proposal.id)
        toast.success('Proposal rejected.')
      }
      // Update local state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id
            ? { ...p, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
            : p
        )
      )
      setActionTarget(null)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Action failed'
      toast.error(msg)
    } finally {
      setActioning(false)
    }
  }

  if (loading) return <Layout><Spinner text="Loading project…" /></Layout>
  if (!project) return null

  const pendingProposals = proposals.filter((p) => p.status === 'PENDING')
  const otherProposals = proposals.filter((p) => p.status !== 'PENDING')

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Project Details</h1>
            <Badge label={project.status_display || project.status} variant={project.status} />
          </div>
          <Link
            to={`/client/projects/${id}/edit`}
            className="ml-auto flex items-center gap-2 px-3 py-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm rounded-xl transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Project info */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-3">{project.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{project.description}</p>
              {project.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <span key={s.id} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs rounded-lg">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" /> Attachments
                </h3>
                <div className="space-y-2">
                  {project.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={`http://localhost:8000${att.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      {att.file.split('/').pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proposals section */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl">
              <div className="px-5 py-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white">
                  Proposals <span className="text-slate-500 font-normal">({proposals.length})</span>
                </h3>
              </div>

              {proposals.length === 0 ? (
                <div className="py-10 text-center">
                  <User className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No proposals received yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {[...pendingProposals, ...otherProposals].map((prop) => (
                    <div key={prop.id} className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-violet-400" />
                            </div>
                            <span className="text-sm font-medium text-white">
                              {prop.freelancer_name || prop.freelancer?.first_name || 'Freelancer'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Bid: <span className="text-emerald-400 font-medium">₹{prop.bid_amount}</span></span>
                            <span>•</span>
                            <span>Est. {prop.estimated_days} days</span>
                          </div>
                        </div>
                        <Badge label={prop.status} variant={prop.status} />
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{prop.cover_letter}</p>

                      {prop.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActionTarget({ proposal: prop, action: 'accept' })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => setActionTarget({ proposal: prop, action: 'reject' })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Project Info</h3>
              {[
                { icon: Tag, label: 'Category', value: project.category?.name },
                { icon: DollarSign, label: 'Budget', value: `₹${project.budget_min} – ₹${project.budget_max}` },
                { icon: Calendar, label: 'Deadline', value: new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { icon: Clock, label: 'Posted', value: new Date(project.created_at).toLocaleDateString('en-IN') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{label}</p>
                    <p className="text-sm text-white">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Proposal Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total', value: proposals.length, color: 'text-white' },
                  { label: 'Pending', value: pendingProposals.length, color: 'text-amber-400' },
                  { label: 'Accepted', value: proposals.filter((p) => p.status === 'ACCEPTED').length, color: 'text-emerald-400' },
                  { label: 'Rejected', value: proposals.filter((p) => p.status === 'REJECTED').length, color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!actionTarget}
        title={actionTarget?.action === 'accept' ? 'Accept Proposal' : 'Reject Proposal'}
        message={
          actionTarget?.action === 'accept'
            ? 'Accepting this proposal will move the project to "In Progress" and reject all other pending proposals.'
            : 'Are you sure you want to reject this proposal?'
        }
        onConfirm={handleAction}
        onCancel={() => setActionTarget(null)}
        loading={actioning}
        danger={actionTarget?.action === 'reject'}
      />
    </Layout>
  )
}
