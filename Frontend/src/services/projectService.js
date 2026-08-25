import api from '../api/axiosInstance'

/**
 * POST /api/v1/projects/ – Create a new project (CLIENT only)
 * Accepts FormData for file attachments
 */
export const createProject = (data) =>
  api.post('/projects/', data, {
    headers:
      data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
  })

/** GET /api/v1/projects/list/ – List projects (role-aware) */
export const getProjects = (params = {}) => api.get('/projects/list/', { params })

/** GET /api/v1/projects/<uuid>/ – Get project detail */
export const getProjectById = (id) => api.get(`/projects/${id}/`)

/** PATCH /api/v1/projects/update/<uuid>/ – Update project (owner CLIENT only) */
export const updateProject = (id, data) =>
  api.patch(`/projects/update/${id}/`, data, {
    headers:
      data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
  })

/** DELETE /api/v1/projects/delete/<uuid>/ – Delete project (owner CLIENT only) */
export const deleteProject = (id) => api.delete(`/projects/delete/${id}/`)
