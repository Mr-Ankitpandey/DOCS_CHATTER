import { useQuery } from "@tanstack/react-query"

import { messagesApi } from "../api/messagesApi"

export function useMessages(chatId: string | undefined) {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => messagesApi.list(chatId!),
    enabled: Boolean(chatId),
  })
}
