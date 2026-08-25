import api from '../api/axiosInstance'

export const getMyProfile = () => api.get('/users/me/')
export const updateMyProfile = (data) => api.put('/users/me/', data)
export const getUserById = (id) => api.get(`/users/${id}/`)
export const uploadAvatar = (formData) =>
  api.post('/users/me/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
