import api from '../api/axiosInstance'

export const applyToProject = (projectId, data) =>
  api.post(`/projects/${projectId}/apply/`, data)
export const getApplications = (params) => api.get('/applications/', { params })
export const getApplicationById = (id) => api.get(`/applications/${id}/`)
export const acceptApplication = (id) => api.post(`/applications/${id}/accept/`)
export const rejectApplication = (id) => api.post(`/applications/${id}/reject/`)
export const withdrawApplication = (id) => api.delete(`/applications/${id}/`)
