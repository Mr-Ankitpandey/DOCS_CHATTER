import { api } from "@/lib/axios"

import type { LoginRequest, SignupRequest, TokenResponse, User } from "../types"

export const authApi = {
  signup: async (data: SignupRequest): Promise<User> => {
    const response = await api.post<User>("/api/users/signup", data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const params = new URLSearchParams()
    params.append("username", data.email)
    params.append("password", data.password)
    const response = await api.post<TokenResponse>("/api/users/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/api/users/me")
    return response.data
  },
}
