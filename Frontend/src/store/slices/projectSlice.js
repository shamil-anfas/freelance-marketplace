import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload.results ?? action.payload
      state.pagination = {
        count: action.payload.count ?? 0,
        next: action.payload.next ?? null,
        previous: action.payload.previous ?? null,
      }
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload
    },
    addProject: (state, action) => {
      state.projects.unshift(action.payload)
    },
    updateProject: (state, action) => {
      const idx = state.projects.findIndex((p) => p.id === action.payload.id)
      if (idx !== -1) state.projects[idx] = action.payload
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload)
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
  setProjects,
  setSelectedProject,
  addProject,
  updateProject,
  removeProject,
  setLoading,
  setError,
} = projectSlice.actions
export default projectSlice.reducer
