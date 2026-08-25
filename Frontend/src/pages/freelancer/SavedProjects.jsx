import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight, Calendar, DollarSign, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { getSavedProjects, unsaveProject } from '../../services/wishlistService'

export default function SavedProjects() {
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSavedProjects()
        const data = res.data?.data?.results ?? res.data?.data ?? []
        setSaved(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Failed to load saved projects')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRemove = async (savedEntry) => {
    setRemovingId(savedEntry.id)
    try {
      await unsaveProject(savedEntry.id)
      setSaved((prev) => prev.filter((s) => s.id !== savedEntry.id))
      toast.success('Removed from saved projects')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) return <Layout><Spinner text="Loading saved projects…" /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Saved Projects</h1>
        <p className="text-slate-400 text-sm mt-1">{saved.length} project(s) saved</p>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved projects"
          description="Browse projects and save ones you're interested in to revisit later."
          action={
            <Link to="/freelancer/browse" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
              Browse Projects
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {saved.map((entry) => {
            const proj = entry.project
            if (!proj) return null
            return (
              <div key={entry.id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                        {proj.title}
                      </h3>
                      <Badge label={proj.status_display || proj.status} variant={proj.status} />
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{proj.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{proj.category?.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />₹{proj.budget_min}–₹{proj.budget_max}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due {new Date(proj.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRemove(entry)}
                      disabled={removingId === entry.id}
                      className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/freelancer/projects/${proj.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-xs font-medium rounded-lg transition-colors"
                    >
                      View & Apply <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
