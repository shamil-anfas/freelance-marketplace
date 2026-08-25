import api from '../api/axiosInstance'

/** POST /api/v1/saved-projects/ – Save a project { project: uuid } */
export const saveProject = (projectId) => api.post('/saved-projects/', { project: projectId })

/** GET /api/v1/saved-projects/list/ – List saved projects */
export const getSavedProjects = () => api.get('/saved-projects/list/')

/** DELETE /api/v1/saved-projects/<uuid>/ – Remove saved project (by saved_project uuid, not project uuid) */
export const unsaveProject = (savedProjectId) => api.delete(`/saved-projects/${savedProjectId}/`)
