import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  User, Phone, MapPin, GitBranch, Link2, Globe,
  Edit3, Save, X, CheckCircle2, AlertCircle, Loader2, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { getProfile, updateProfile } from '../../services/profileService'

const Field = ({ label, name, value, onChange, type = 'text', placeholder, icon: Icon, textarea = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      )}
      {textarea ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-slate-800/60 border border-slate-700 rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 transition`}
        />
      )}
    </div>
  </div>
)

export default function ProfilePage() {
  const { user, role } = useSelector((state) => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await getProfile()
      setProfile(res.data.data)
      setForm(res.data.data)
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = new FormData()
      const fields = ['bio', 'phone_number', 'location', 'state', 'city', 'address', 'pincode', 'github_url', 'linkedin_url', 'portfolio_url']
      fields.forEach((f) => {
        if (form[f] !== undefined && form[f] !== null) data.append(f, form[f])
      })
      if (imageFile) data.append('profile_image', imageFile)

      const res = await updateProfile(data)
      setProfile(res.data.data)
      setForm(res.data.data)
      setEditing(false)
      setImageFile(null)
      setImagePreview(null)
      toast.success('Profile updated successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
    setImageFile(null)
    setImagePreview(null)
  }

  if (loading) return <Layout><Spinner text="Loading profile…" /></Layout>

  const avatarUrl = imagePreview || (profile?.profile_image ? `http://localhost:8000${profile.profile_image}` : null)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile card */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Top banner */}
          <div className="h-24 bg-gradient-to-r from-violet-900/40 to-indigo-900/40 relative">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed30 0%, transparent 50%), radial-gradient(circle at 80% 50%, #4f46e530 0%, transparent 50%)' }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-12 mb-4 w-fit">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-4 border-slate-900 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-600" />
                )}
              </div>
              {editing && (
                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </label>
              )}
            </div>

            {/* User info */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={role} variant={role} />
                  {profile?.is_profile_completed ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Profile Complete
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Profile Incomplete
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">About</h3>
                {editing ? (
                  <Field label="Bio" name="bio" value={form.bio} onChange={handleChange} textarea placeholder="Tell us about yourself…" />
                ) : (
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {profile?.bio || <span className="italic text-slate-600">No bio added yet.</span>}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800" />

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Contact & Location</h3>
                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} icon={Phone} placeholder="+91 9876543210" />
                    <Field label="Location" name="location" value={form.location} onChange={handleChange} icon={MapPin} placeholder="City, Country" />
                    <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
                    <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                    <Field label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
                    <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: Phone, label: 'Phone', value: profile?.phone_number },
                      { icon: MapPin, label: 'Location', value: [profile?.city, profile?.state, profile?.location].filter(Boolean).join(', ') },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-600">{label}</p>
                          <p className="text-sm text-slate-300">{value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800" />

              {/* Links */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Online Presence</h3>
                {editing ? (
                  <div className="space-y-4">
                    <Field label="GitHub URL" name="github_url" value={form.github_url} onChange={handleChange} type="url" icon={GitBranch} placeholder="https://github.com/username" />
                    <Field label="LinkedIn URL" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} type="url" icon={Link2} placeholder="https://linkedin.com/in/username" />
                    <Field label="Portfolio URL" name="portfolio_url" value={form.portfolio_url} onChange={handleChange} type="url" icon={Globe} placeholder="https://yourportfolio.com" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: GitBranch, label: 'GitHub', value: profile?.github_url },
                      { icon: Link2, label: 'LinkedIn', value: profile?.linkedin_url },
                      { icon: Globe, label: 'Portfolio', value: profile?.portfolio_url },
                    ].map(({ icon: Icon, label, value }) =>
                      value ? (
                        <a
                          key={label}
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </a>
                      ) : null
                    )}
                    {!profile?.github_url && !profile?.linkedin_url && !profile?.portfolio_url && (
                      <p className="text-sm text-slate-600 italic">No links added yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
