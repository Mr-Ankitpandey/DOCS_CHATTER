import axios from "axios"

import { store } from "@/app/store"
import { markSessionExpired } from "@/features/auth/authSlice"

import { TOKEN_STORAGE_KEY } from "./constants"

export { TOKEN_STORAGE_KEY }

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(markSessionExpired())
    }
    return Promise.reject(error)
  },
)
