import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import { TOKEN_STORAGE_KEY } from "@/lib/constants"

interface AuthState {
  token: string | null
  sessionExpired: boolean
}

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_STORAGE_KEY),
  sessionExpired: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
      state.sessionExpired = false
      localStorage.setItem(TOKEN_STORAGE_KEY, action.payload)
    },
    clearToken(state) {
      state.token = null
      state.sessionExpired = false
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    },
    markSessionExpired(state) {
      state.token = null
      state.sessionExpired = true
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    },
    dismissSessionExpired(state) {
      state.sessionExpired = false
    },
  },
})

export const { setToken, clearToken, markSessionExpired, dismissSessionExpired } =
  authSlice.actions
export default authSlice.reducer
