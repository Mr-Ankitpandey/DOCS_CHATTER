import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { chatsApi } from "../api/chatsApi"
import type { Chat } from "../types"

interface ApiError {
  detail?: string
}

function getErrorMessage(error: unknown, fallback: string): string {
  return (error as AxiosError<ApiError>).response?.data?.detail ?? fallback
}

export function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: chatsApi.list,
    refetchInterval: (query) => {
      const hasInProgress = query.state.data?.some(
        (c) => c.document.status === "pending" || c.document.status === "processing",
      )
      return hasInProgress ? 2000 : false
    },
  })
}

export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: ["chats", chatId],
    queryFn: () => chatsApi.get(chatId!),
    enabled: Boolean(chatId),
    refetchInterval: (query) => {
      const status = query.state.data?.document.status
      return status === "pending" || status === "processing" ? 1500 : false
    },
  })
}

export function useUploadChat() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => chatsApi.upload(file),
    onSuccess: (chat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      toast.success("Document uploaded — processing now")
      navigate(`/dashboard/chats/${chat.id}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Upload failed"))
    },
  })
}

export function useDeleteChat() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (chatId: string) => chatsApi.delete(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      toast.success("Chat deleted")
      navigate("/dashboard")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete chat"))
    },
  })
}
