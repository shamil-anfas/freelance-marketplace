import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,
}

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.applications = action.payload
    },
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload
    },
    addApplication: (state, action) => {
      state.applications.unshift(action.payload)
    },
    updateApplicationStatus: (state, action) => {
      const { id, status } = action.payload
      const app = state.applications.find((a) => a.id === id)
      if (app) app.status = status
    },
    removeApplication: (state, action) => {
      state.applications = state.applications.filter((a) => a.id !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setApplications,
  setSelectedApplication,
  addApplication,
  updateApplicationStatus,
  removeApplication,
  setLoading,
  setError,
} = applicationSlice.actions
export default applicationSlice.reducer
