import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthTokens } from './authTypes'

const storageKey = 'auth'

const loadTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

const persistTokens = (tokens: AuthTokens | null) => {
  if (!tokens) {
    localStorage.removeItem(storageKey)
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(tokens))
}

const initialTokens = loadTokens()

const initialState: AuthState = {
  tokens: initialTokens,
  isAuthenticated: Boolean(initialTokens?.accessToken)
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload
      state.isAuthenticated = true
      persistTokens(action.payload)
    },
    clearTokens: (state) => {
      state.tokens = null
      state.isAuthenticated = false
      persistTokens(null)
    }
  }
})

export const { setTokens, clearTokens } = authSlice.actions
export default authSlice.reducer