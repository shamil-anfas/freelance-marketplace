import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Edit3, Trash2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import { getProposals, withdrawProposal, updateProposal } from '../../services/proposalService'

export default function MyProposals() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ cover_letter: '', bid_amount: '', estimated_days: '' })
  const [saving, setSaving] = useState(false)

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const res = await getProposals()
      const data = res.data?.data?.results ?? res.data?.data ?? []
      setProposals(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProposals() }, [])

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true)
      await withdrawProposal(withdrawTarget.id)
      setProposals((prev) =>
        prev.map((p) => p.id === withdrawTarget.id ? { ...p, status: 'WITHDRAWN' } : p)
      )
      toast.success('Proposal withdrawn')
      setWithdrawTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to withdraw')
    } finally {
      setWithdrawing(false)
    }
  }

  const startEdit = (prop) => {
    setEditingId(prop.id)
    setEditForm({
      cover_letter: prop.cover_letter,
      bid_amount: prop.bid_amount,
      estimated_days: prop.estimated_days,
    })
  }

  const handleEditSave = async (propId) => {
    try {
      setSaving(true)
      const res = await updateProposal(propId, editForm)
      setProposals((prev) =>
        prev.map((p) => p.id === propId ? res.data?.data || { ...p, ...editForm } : p)
      )
      setEditingId(null)
      toast.success('Proposal updated!')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><Spinner text="Loading proposals…" /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">My Proposals</h1>
        <p className="text-stone-500 text-sm mt-1">{proposals.length} proposal(s) submitted</p>
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No proposals yet"
          description="Browse open projects and submit your first proposal."
          action={
            <Link to="/freelancer/browse" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium rounded-xl transition-colors">
              Browse Projects
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <div key={prop.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all">
              {editingId === prop.id ? (
                /* Edit mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-stone-900">Editing Proposal</h3>
                    <button onClick={() => setEditingId(null)} className="text-stone-500 hover:text-stone-600 text-xs">Cancel</button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-500 uppercase tracking-wide">Cover Letter</label>
                    <textarea
                      value={editForm.cover_letter}
                      onChange={(e) => setEditForm((f) => ({ ...f, cover_letter: e.target.value }))}
                      rows={4}
                      className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-500 uppercase tracking-wide">Bid Amount (₹)</label>
                      <input type="number" value={editForm.bid_amount}
                        onChange={(e) => setEditForm((f) => ({ ...f, bid_amount: e.target.value }))}
                        className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-500 uppercase tracking-wide">Est. Days</label>
                      <input type="number" value={editForm.estimated_days}
                        onChange={(e) => setEditForm((f) => ({ ...f, estimated_days: e.target.value }))}
                        className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition"
                      />
                    </div>
                  </div>
                  <button onClick={() => handleEditSave(prop.id)} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-stone-900 truncate">
                          {prop.project?.title || 'Project'}
                        </h3>
                        <Badge label={prop.status} variant={prop.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>Bid: <span className="text-emerald-400 font-medium">₹{prop.bid_amount}</span></span>
                        <span>•</span>
                        <span>{prop.estimated_days} days</span>
                        <span>•</span>
                        <span>Submitted {new Date(prop.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {prop.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => startEdit(prop)}
                          className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setWithdrawTarget(prop)}
                          className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-stone-500 line-clamp-3 mb-3">{prop.cover_letter}</p>

                  <Link
                    to={`/freelancer/projects/${prop.project?.id || prop.project}`}
                    className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-700 transition-colors"
                  >
                    View Project <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!withdrawTarget}
        title="Withdraw Proposal"
        message={`Are you sure you want to withdraw your proposal for "${withdrawTarget?.project?.title}"?`}
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawTarget(null)}
        loading={withdrawing}
      />
    </Layout>
  )
}
