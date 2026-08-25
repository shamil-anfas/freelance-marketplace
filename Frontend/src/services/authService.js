import api from '../api/axiosInstance'

/**
 * POST /api/v1/auth/register/
 * Body: { email, password, first_name, last_name, role }
 * Returns: { message }
 */
export const register = (data) => api.post('/auth/register/', data)

/**
 * POST /api/v1/auth/login/
 * Body: { email, password }
 * Returns: { data: { user, access, refresh }, message }
 */
export const login = (credentials) => api.post('/auth/login/', credentials)

/**
 * POST /api/v1/auth/logout/
 * Body: { refresh }
 */
export const logout = (refresh) => api.post('/auth/logout/', { refresh })

/**
 * GET /api/v1/auth/me/
 * Returns: { data: { id, email, first_name, last_name, role, is_active, is_email_verified } }
 */
export const getCurrentUser = () => api.get('/auth/me/')

/**
 * POST /api/v1/auth/refresh/
 * Body: { refresh }
 * Returns: { access }
 */
export const refreshToken = (refresh) => api.post('/auth/refresh/', { refresh })
