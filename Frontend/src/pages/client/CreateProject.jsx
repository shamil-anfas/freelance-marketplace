import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Upload, X, PlusCircle,
  DollarSign, Calendar, Tag, AlignLeft, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import { createProject } from '../../services/projectService'
import { getCategories, getSkills } from '../../services/mastersService'

export default function CreateProject() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [skills, setSkills] = useState([])
  const [loadingMasters, setLoadingMasters] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    skills: [],
    budget_min: '',
    budget_max: '',
    deadline: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([getCategories(), getSkills()])
        const cats = catRes.data?.data?.results ?? catRes.data?.data ?? catRes.data?.results ?? []
        const skls = skillRes.data?.data?.results ?? skillRes.data?.data ?? skillRes.data?.results ?? []
        setCategories(Array.isArray(cats) ? cats : [])
        setSkills(Array.isArray(skls) ? skls : [])
      } catch {
        toast.error('Failed to load categories and skills')
      } finally {
        setLoadingMasters(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSkill = (skillId) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((s) => s !== skillId)
        : [...prev.skills, skillId],
    }))
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 attachments allowed')
      return
    }
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { toast.error('Please select a category'); return }
    if (form.skills.length === 0) { toast.error('Select at least one skill'); return }

    try {
      setSubmitting(true)
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('category', form.category)
      form.skills.forEach((s) => fd.append('skills', s))
      fd.append('budget_min', form.budget_min)
      fd.append('budget_max', form.budget_max)
      fd.append('deadline', form.deadline)
      attachments.forEach((f) => fd.append('attachments', f))

      await createProject(fd)
      toast.success('Project posted successfully! 🎉')
      navigate('/client/projects')
    } catch (err) {
      const data = err.response?.data
      const msg = data?.message || data?.detail || Object.values(data || {})?.[0]?.[0] || 'Failed to create project'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingMasters) return <Layout><Spinner text="Loading…" /></Layout>

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Post a New Project</h1>
            <p className="text-stone-500 text-sm">Describe what you need done</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-stone-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" /> Project Details
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Build a responsive e-commerce website"
                required
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                <AlignLeft className="w-3.5 h-3.5 inline mr-1" />Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your project requirements, goals, and any specific needs…"
                required
                rows={5}
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition resize-none"
              />
            </div>
          </div>

          {/* Category & Skills */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-stone-600 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-700" /> Category & Skills
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
              >
                <option value="" className="bg-white">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-white">{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                Required Skills * <span className="text-stone-600 normal-case font-normal">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const selected = form.skills.includes(skill.id)
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? 'bg-teal-700/30 border border-teal-600/50 text-teal-700'
                          : 'bg-stone-200/60 border border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-600'
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {skill.name}
                    </button>
                  )
                })}
              </div>
              {form.skills.length > 0 && (
                <p className="text-xs text-teal-700">{form.skills.length} skill(s) selected</p>
              )}
            </div>
          </div>

          {/* Budget & Deadline */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-stone-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-700" /> Budget & Timeline
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Min Budget (₹) *</label>
                <input
                  type="number"
                  name="budget_min"
                  value={form.budget_min}
                  onChange={handleChange}
                  placeholder="5000"
                  required
                  min={0}
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Max Budget (₹) *</label>
                <input
                  type="number"
                  name="budget_max"
                  value={form.budget_max}
                  onChange={handleChange}
                  placeholder="20000"
                  required
                  min={0}
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                min={minDate}
                required
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/60 focus:border-teal-600 transition"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-stone-600 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-700" /> Attachments
              <span className="text-stone-600 font-normal text-xs">(optional, max 5 files, 10MB each)</span>
            </h2>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-stone-100 border border-stone-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-stone-500 shrink-0" />
                      <span className="text-sm text-stone-600 truncate">{f.name}</span>
                      <span className="text-xs text-stone-600 shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button type="button" onClick={() => removeAttachment(i)} className="ml-2 text-stone-500 hover:text-red-400 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachments.length < 5 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-teal-600/50 rounded-xl py-8 cursor-pointer transition-colors group">
                <PlusCircle className="w-6 h-6 text-stone-600 group-hover:text-teal-700 transition-colors mb-2" />
                <p className="text-sm text-stone-500 group-hover:text-stone-500 transition-colors">
                  Click to add files
                </p>
                <p className="text-xs text-stone-300 mt-1">PDF, DOC, DOCX, JPG, PNG</p>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFiles} className="sr-only" />
              </label>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-teal-900/30"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Posting project…</>
            ) : (
              'Post Project'
            )}
          </button>
        </form>
      </div>
    </Layout>
  )
}
