import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Heart, HeartOff, Calendar, DollarSign, ArrowRight, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { getProjects } from '../../services/projectService'
import { getCategories } from '../../services/mastersService'
import { saveProject, getSavedProjects, unsaveProject } from '../../services/wishlistService'

export default function BrowseProjects() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [savedMap, setSavedMap] = useState({}) // projectId -> savedProjectId
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    budget_min: '',
    budget_max: '',
    ordering: '-created_at',
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.budget_min) params.budget_min = filters.budget_min
      if (filters.budget_max) params.budget_max = filters.budget_max
      if (filters.ordering) params.ordering = filters.ordering

      const [projRes, catRes, savedRes] = await Promise.all([
        getProjects(params),
        getCategories(),
        getSavedProjects(),
      ])

      const projs = projRes.data?.data?.results ?? projRes.data?.data ?? []
      const cats = catRes.data?.data?.results ?? catRes.data?.data ?? catRes.data?.results ?? []
      const svd = savedRes.data?.data?.results ?? savedRes.data?.data ?? []

      setProjects(Array.isArray(projs) ? projs : [])
      setCategories(Array.isArray(cats) ? cats : [])

      // Build saved map: projectId -> savedProjectId
      const map = {}
      ;(Array.isArray(svd) ? svd : []).forEach((s) => {
        const projId = s.project?.id || s.project
        if (projId) map[projId] = s.id
      })
      setSavedMap(map)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const t = setTimeout(() => loadData(), 400)
    return () => clearTimeout(t)
  }, [loadData])

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSave = async (project) => {
    const savedId = savedMap[project.id]
    setSavingId(project.id)
    try {
      if (savedId) {
        await unsaveProject(savedId)
        setSavedMap((prev) => { const n = { ...prev }; delete n[project.id]; return n })
        toast.success('Removed from saved projects')
      } else {
        const res = await saveProject(project.id)
        const newSavedId = res.data?.data?.id
        setSavedMap((prev) => ({ ...prev, [project.id]: newSavedId }))
        toast.success('Project saved!')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Failed to save project'
      toast.error(msg)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Browse Projects</h1>
          <p className="text-stone-500 text-sm mt-1">
            {loading ? '…' : `${projects.length} open project(s) available`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
            showFilters
              ? 'border-teal-600/50 bg-teal-700/20 text-teal-700'
              : 'border-stone-300 text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search projects by title or description…"
          className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-stone-500 uppercase tracking-wide">Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}
              className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition">
              <option value="" className="bg-white">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white">{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-stone-500 uppercase tracking-wide">Min Budget</label>
            <input type="number" name="budget_min" value={filters.budget_min} onChange={handleFilterChange} placeholder="₹0"
              className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-stone-500 uppercase tracking-wide">Max Budget</label>
            <input type="number" name="budget_max" value={filters.budget_max} onChange={handleFilterChange} placeholder="₹∞"
              className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-stone-500 uppercase tracking-wide">Sort By</label>
            <select name="ordering" value={filters.ordering} onChange={handleFilterChange}
              className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/60 transition">
              <option value="-created_at" className="bg-white">Newest First</option>
              <option value="created_at" className="bg-white">Oldest First</option>
              <option value="budget_min" className="bg-white">Budget: Low to High</option>
              <option value="-budget_max" className="bg-white">Budget: High to Low</option>
              <option value="deadline" className="bg-white">Deadline: Soonest</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner text="Finding projects…" />
      ) : projects.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No projects found" description="Try adjusting your search filters." />
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => {
            const isSaved = !!savedMap[proj.id]
            return (
              <div key={proj.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">
                        {proj.title}
                      </h3>
                      <Badge label={proj.status_display || proj.status} variant={proj.status} />
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-3">{proj.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-3">
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
                      <span>•</span>
                      <span>by {proj.client_name}</span>
                    </div>

                    {proj.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
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

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => toggleSave(proj)}
                      disabled={savingId === proj.id}
                      title={isSaved ? 'Remove from saved' : 'Save project'}
                      className={`p-2 rounded-lg border transition-all ${
                        isSaved
                          ? 'border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'
                          : 'border-stone-300 text-stone-500 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/10'
                      }`}
                    >
                      {isSaved ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
                    </button>
                    <Link
                      to={`/freelancer/projects/${proj.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-teal-700/20 hover:bg-teal-700/30 border border-teal-600/30 text-teal-700 text-xs font-medium rounded-lg transition-colors"
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
