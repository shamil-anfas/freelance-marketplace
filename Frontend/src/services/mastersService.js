import api from '../api/axiosInstance'

/** GET /api/v1/masters/categories/ */
export const getCategories = () => api.get('/masters/categories/')

/** GET /api/v1/masters/skills/ */
export const getSkills = () => api.get('/masters/skills/')
