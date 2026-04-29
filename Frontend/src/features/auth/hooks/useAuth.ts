import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"

import { authApi } from "../api/authApi"
import { clearToken, setToken } from "../authSlice"
import type { LoginRequest, SignupRequest } from "../types"

interface ApiError {
  detail?: string
}

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiError>
  return axiosError.response?.data?.detail ?? fallback
}

export function useCurrentUser() {
  const token = useAppSelector((state) => state.auth.token)
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      dispatch(setToken(data.access_token))
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      toast.success("Welcome back!")
      navigate("/dashboard")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Login failed"))
    },
  })
}

export function useSignup() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: () => {
      toast.success("Account created — please sign in")
      navigate("/login")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Signup failed"))
    },
  })
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return () => {
    dispatch(clearToken())
    queryClient.clear()
    window.location.replace("/")
  }
}
