import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import applicationReducer from './slices/applicationSlice'
import userReducer from './slices/userSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    applications: applicationReducer,
    user: userReducer,
  },
})

export default store
