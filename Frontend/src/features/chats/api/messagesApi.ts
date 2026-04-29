import { api } from "@/lib/axios"

import type { Message } from "../types-message"

export const messagesApi = {
  list: async (chatId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/api/chats/${chatId}/messages`)
    return response.data
  },
}
