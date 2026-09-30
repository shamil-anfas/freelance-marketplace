import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Edit3, Trash2, ArrowRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import { getProjects, deleteProject } from '../../services/projectService'

export default function MyProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await getProjects()
      const data = res.data?.data?.results ?? res.data?.data ?? []
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteProject(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      toast.success('Project deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Layout><Spinner text="Loading projects…" /></Layout>

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Projects</h1>
          <p className="text-stone-500 text-sm mt-1">{projects.length} project(s) total</p>
        </div>
        <Link
          to="/client/projects/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Post Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={search ? 'No matching projects' : 'No projects yet'}
          description={search ? 'Try a different search term.' : 'Post your first project to find talented freelancers.'}
          action={
            !search && (
              <Link
                to="/client/projects/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Post Project
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-stone-900 group-hover:text-teal-700 transition-colors truncate">
                      {proj.title}
                    </h3>
                    <Badge label={proj.status_display || proj.status} variant={proj.status} />
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-3">{proj.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="text-stone-600">Category:</span> {proj.category?.name || '—'}
                    </span>
                    <span>•</span>
                    <span>Budget: ₹{proj.budget_min}–₹{proj.budget_max}</span>
                    <span>•</span>
                    <span>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                  </div>
                  {proj.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {proj.skills.slice(0, 5).map((s) => (
                        <span key={s.id} className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 text-xs rounded-md">
                          {s.name}
                        </span>
                      ))}
                      {proj.skills.length > 5 && (
                        <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 text-xs rounded-md">
                          +{proj.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/client/projects/${proj.id}/edit`)}
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    title="Edit project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(proj)}
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/client/projects/${proj.id}`}
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-teal-700 hover:border-teal-600/30 hover:bg-teal-600/10 transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  )
}
