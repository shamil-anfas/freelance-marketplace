import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Calendar, DollarSign, Tag, Clock, User,
  FileText, Send, Loader2, Heart, HeartOff, CheckCircle2, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { getProjectById } from '../../services/projectService'
import { createProposal, getProposals } from '../../services/proposalService'
import { getProfile } from '../../services/profileService'
import { saveProject, getSavedProjects, unsaveProject } from '../../services/wishlistService'

export default function FreelancerProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [savingToggle, setSavingToggle] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [existingProposal, setExistingProposal] = useState(null)
  const [form, setForm] = useState({ cover_letter: '', bid_amount: '', estimated_days: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, propRes, savedRes, profRes] = await Promise.allSettled([
          getProjectById(id),
          getProposals(),
          getSavedProjects(),
          getProfile(),
        ])

        if (projRes.status === 'fulfilled') {
          setProject(projRes.value.data?.data)
        } else {
          throw new Error('Failed to load project')
        }

        if (profRes.status === 'fulfilled') {
          setUserProfile(profRes.value.data?.data)
        }

        // Check if already applied
        if (propRes.status === 'fulfilled') {
          const allProps = propRes.value.data?.data?.results ?? propRes.value.data?.data ?? []
          const myProp = (Array.isArray(allProps) ? allProps : []).find(
            (p) => p.project?.id === id || p.project === id
          )
          if (myProp) { setHasApplied(true); setExistingProposal(myProp) }
        }

        // Check if saved
        if (savedRes.status === 'fulfilled') {
          const svd = savedRes.value.data?.data?.results ?? savedRes.value.data?.data ?? []
          const savedEntry = (Array.isArray(svd) ? svd : []).find(
            (s) => (s.project?.id || s.project) === id
          )
          if (savedEntry) setSavedId(savedEntry.id)
        }
      } catch {
        toast.error('Failed to load project')
        navigate('/freelancer/browse')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await createProposal({
        project: id,
        cover_letter: form.cover_letter,
        bid_amount: parseFloat(form.bid_amount),
        estimated_days: parseInt(form.estimated_days),
      })
      setHasApplied(true)
      setExistingProposal(res.data?.data)
      toast.success('Proposal submitted successfully! 🎉')
    } catch (err) {
      const data = err.response?.data
      const firstError =
        (typeof data?.errors === 'string' && data.errors) ||
        (data?.errors && typeof data.errors === 'object' && Object.values(data.errors).flat()[0])
      const msg = data?.message || firstError || data?.detail || 'Failed to submit proposal'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSave = async () => {
    setSavingToggle(true)
    try {
      if (savedId) {
        await unsaveProject(savedId)
        setSavedId(null)
        toast.success('Removed from saved')
      } else {
        const res = await saveProject(id)
        setSavedId(res.data?.data?.id)
        toast.success('Project saved!')
      }
    } catch {
      toast.error('Failed to update saved projects')
    } finally {
      setSavingToggle(false)
    }
  }

  if (loading) return <Layout><Spinner text="Loading project…" /></Layout>
  if (!project) return null

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{project.title}</h1>
            <Badge label={project.status_display || project.status} variant={project.status} />
          </div>
          <button
            onClick={toggleSave}
            disabled={savingToggle}
            className={`p-2.5 rounded-xl border transition-all ${savedId ? 'border-pink-500/30 bg-pink-500/10 text-pink-400' : 'border-slate-700 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10'}`}
          >
            <Heart className={`w-4 h-4 ${savedId ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Project info */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
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
                    <a key={att.id} href={`http://localhost:8000${att.file}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      {att.file.split('/').pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Proposal form / Status */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
              {hasApplied ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Proposal Submitted</h3>
                  <p className="text-sm text-slate-400 mb-4">You've already applied to this project.</p>
                  {existingProposal && (
                    <div className="bg-slate-800/60 rounded-xl p-4 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Status</span>
                        <Badge label={existingProposal.status} variant={existingProposal.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Bid Amount</span>
                        <span className="text-sm text-white font-medium">₹{existingProposal.bid_amount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Estimated Days</span>
                        <span className="text-sm text-white">{existingProposal.estimated_days} days</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : project.status !== 'OPEN' ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">This project is no longer accepting proposals.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-violet-400" /> Submit a Proposal
                  </h3>

                  {userProfile && (!userProfile.bio || !userProfile.phone_number || !userProfile.location) && (
                    <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-300">Profile Incomplete</p>
                        <p className="text-amber-200/80 text-xs mt-0.5">
                          You must fill in your <strong>Bio</strong>, <strong>Phone Number</strong>, and <strong>Location</strong> on your profile before you can submit a proposal.
                        </p>
                        <Link
                          to="/profile"
                          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
                        >
                          Complete Profile Now &rarr;
                        </Link>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Cover Letter *</label>
                      <textarea
                        name="cover_letter"
                        value={form.cover_letter}
                        onChange={handleChange}
                        placeholder="Introduce yourself and explain why you're the best fit for this project…"
                        required
                        rows={5}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Your Bid (₹) *</label>
                        <input
                          type="number"
                          name="bid_amount"
                          value={form.bid_amount}
                          onChange={handleChange}
                          placeholder="e.g. 15000"
                          required
                          min={0}
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                        />
                        <p className="text-xs text-slate-600">Client budget: ₹{project.budget_min}–₹{project.budget_max}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Est. Days *</label>
                        <input
                          type="number"
                          name="estimated_days"
                          value={form.estimated_days}
                          onChange={handleChange}
                          placeholder="e.g. 14"
                          required
                          min={1}
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Proposal</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Project Info</h3>
              {[
                { icon: User, label: 'Posted by', value: project.client_name },
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
          </div>
        </div>
      </div>
    </Layout>
  )
}
