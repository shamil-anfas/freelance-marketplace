import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import { getProjectById, updateProject } from '../../services/projectService'
import { getCategories, getSkills } from '../../services/mastersService'

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [skills, setSkills] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', category: '', skills: [], budget_min: '', budget_max: '', deadline: '', status: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, catRes, skillRes] = await Promise.all([
          getProjectById(id),
          getCategories(),
          getSkills(),
        ])
        const proj = projRes.data?.data
        const cats = catRes.data?.data?.results ?? catRes.data?.data ?? catRes.data?.results ?? []
        const skls = skillRes.data?.data?.results ?? skillRes.data?.data ?? skillRes.data?.results ?? []
        setCategories(Array.isArray(cats) ? cats : [])
        setSkills(Array.isArray(skls) ? skls : [])
        setForm({
          title: proj.title || '',
          description: proj.description || '',
          category: proj.category?.id || '',
          skills: proj.skills?.map((s) => s.id) || [],
          budget_min: proj.budget_min || '',
          budget_max: proj.budget_max || '',
          deadline: proj.deadline || '',
          status: proj.status || '',
        })
      } catch {
        toast.error('Failed to load project')
        navigate('/client/projects')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleSkill = (skillId) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId) ? prev.skills.filter((s) => s !== skillId) : [...prev.skills, skillId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await updateProject(id, form)
      toast.success('Project updated!')
      navigate(`/client/projects/${id}`)
    } catch (err) {
      const data = err.response?.data
      const msg = data?.message || data?.detail || 'Failed to update'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Layout><Spinner text="Loading…" /></Layout>

  const STATUS_CHOICES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Edit Project</h1>
            <p className="text-slate-400 text-sm">Update your project details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            {[
              { label: 'Title', name: 'title', placeholder: 'Project title', required: true },
            ].map(({ label, name, placeholder, required }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
                <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} required={required}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition">
                {STATUS_CHOICES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-400" /> Category & Skills
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition">
                <option value="" className="bg-slate-900">Select category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Skills</label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const selected = form.skills.includes(skill.id)
                  return (
                    <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selected ? 'bg-violet-600/30 border border-violet-500/50 text-violet-300' : 'bg-slate-800/60 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}>
                      {selected && <span className="mr-1">✓</span>}{skill.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Budget & Timeline</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Min Budget (₹)', name: 'budget_min' },
                { label: 'Max Budget (₹)', name: 'budget_max' },
              ].map(({ label, name }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
                  <input type="number" name={name} value={form[name]} onChange={handleChange} min={0}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
