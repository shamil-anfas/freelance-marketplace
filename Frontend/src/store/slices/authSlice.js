import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '../../services/authService'

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await registerApi(formData)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Registration failed.' })
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await loginApi(credentials)
      return res.data // { data: { user, access, refresh }, message }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Login failed.' })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await logoutApi(refresh)
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCurrentUser()
      return res.data
    } catch (err) {
      // Treat 401 or 403 on /me/ as a stale/invalid token — clear it
      const status = err.response?.status
      if (status === 401 || status === 403) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
      return rejectWithValue(err.response?.data)
    }
  }
)

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  role: null,
  accessToken: localStorage.getItem('access_token') || null,
  // Don't trust isAuthenticated from token alone — fetchCurrentUser will confirm it
  isAuthenticated: false,
  loading: !!localStorage.getItem('access_token'), // show loading if token exists
  error: null,
}

// ─── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, role, accessToken } = action.payload
      state.user = user
      state.role = role
      state.accessToken = accessToken
      state.isAuthenticated = true
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ── Register ────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ── Login ───────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        const { user, access, refresh } = action.payload.data
        state.user = user
        state.role = user.role
        state.accessToken = access
        state.isAuthenticated = true
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ── Logout ──────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.role = null
        state.accessToken = null
        state.isAuthenticated = false
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })

    // ── Fetch current user ──────────────────────────────────────────────────
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        const user = action.payload?.data
        if (user) {
          state.user = user
          state.role = user.role
          state.isAuthenticated = true
        } else {
          state.user = null
          state.role = null
          state.isAuthenticated = false
          state.accessToken = null
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false
        state.user = null
        state.role = null
        state.isAuthenticated = false
        state.accessToken = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
  },
})

export const { setCredentials, clearError } = authSlice.actions
export default authSlice.reducer
