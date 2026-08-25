import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    clearProfile: (state) => {
      state.profile = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setProfile, updateProfile, clearProfile, setLoading, setError } =
  userSlice.actions
export default userSlice.reducer
