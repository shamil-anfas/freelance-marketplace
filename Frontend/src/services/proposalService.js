import api from '../api/axiosInstance'

/** POST /api/v1/proposals/ – Submit proposal (FREELANCER only) */
export const createProposal = (data) => api.post('/proposals/', data)

/** GET /api/v1/proposals/list/ – List proposals (role-aware) */
export const getProposals = (params = {}) => api.get('/proposals/list/', { params })

/** GET /api/v1/proposals/<uuid>/ – Get proposal detail */
export const getProposalById = (id) => api.get(`/proposals/${id}/`)

/** PATCH /api/v1/proposals/update/<uuid>/ – Update proposal (FREELANCER owner, PENDING only) */
export const updateProposal = (id, data) => api.patch(`/proposals/update/${id}/`, data)

/** DELETE /api/v1/proposals/withdraw/<uuid>/ – Withdraw proposal (FREELANCER owner, PENDING only) */
export const withdrawProposal = (id) => api.delete(`/proposals/withdraw/${id}/`)

/** PATCH /api/v1/proposals/accept/<uuid>/ – Accept proposal (CLIENT project owner) */
export const acceptProposal = (id) => api.patch(`/proposals/accept/${id}/`)

/** PATCH /api/v1/proposals/reject/<uuid>/ – Reject proposal (CLIENT project owner) */
export const rejectProposal = (id) => api.patch(`/proposals/reject/${id}/`)
