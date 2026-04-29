import { api } from "@/lib/axios"

import type { Chat } from "../types"

export const chatsApi = {
  list: async (): Promise<Chat[]> => {
    const response = await api.get<Chat[]>("/api/chats")
    return response.data
  },

  get: async (id: string): Promise<Chat> => {
    const response = await api.get<Chat>(`/api/chats/${id}`)
    return response.data
  },

  upload: async (file: File): Promise<Chat> => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post<Chat>("/api/chats", formData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/chats/${id}`)
  },
}
