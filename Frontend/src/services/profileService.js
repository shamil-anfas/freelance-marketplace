import api from '../api/axiosInstance'

/** GET /api/v1/profile/ – Get authenticated user's profile */
export const getProfile = () => api.get('/profile/')

/** PATCH /api/v1/profile/update/ – Partially update profile */
export const updateProfile = (data) =>
  api.patch('/profile/update/', data, {
    headers:
      data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
  })
