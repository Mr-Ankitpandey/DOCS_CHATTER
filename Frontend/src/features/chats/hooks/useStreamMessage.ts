import { fetchEventSource } from "@microsoft/fetch-event-source"
import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { markSessionExpired } from "@/features/auth/authSlice"
import { TOKEN_STORAGE_KEY } from "@/lib/constants"

import type { Message, MessageSource } from "../types-message"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const SESSION_EXPIRED_MESSAGE =
  "⚠️ Your session has expired. Please log in again to continue."

interface StreamingState {
  content: string
  sources: MessageSource[]
}

export function useStreamMessage(chatId: string) {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired)
  const [streaming, setStreaming] = useState<StreamingState | null>(null)
  const [pending, setPending] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const send = async (content: string) => {
    if (!content.trim() || pending) return

    const optimisticUser: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content,
      sources: [],
      created_at: new Date().toISOString(),
    }
    queryClient.setQueryData<Message[]>(["messages", chatId], (old) =>
      old ? [...old, optimisticUser] : [optimisticUser],
    )

    if (sessionExpired) {
      setStreaming({ content: SESSION_EXPIRED_MESSAGE, sources: [] })
      dispatch(markSessionExpired())
      return
    }

    abortRef.current = new AbortController()
    setPending(true)
    setStreaming({ content: "", sources: [] })

    let didFailWithAuth = false

    try {
      await fetchEventSource(`${API_URL}/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ""}`,
        },
        body: JSON.stringify({ content }),
        signal: abortRef.current.signal,
        openWhenHidden: true,
        async onopen(response) {
          if (response.status === 401) {
            throw new Error("UNAUTHORIZED")
          }
          if (!response.ok) {
            throw new Error(`Stream error: ${response.status}`)
          }
        },
        onmessage(ev) {
          const data = JSON.parse(ev.data)
          if (data.type === "token") {
            setStreaming((s) =>
              s ? { ...s, content: s.content + data.content } : null,
            )
          } else if (data.type === "done") {
            setStreaming((s) => (s ? { ...s, sources: data.sources } : null))
            queryClient.invalidateQueries({ queryKey: ["messages", chatId] })
          }
        },
        onerror(err) {
          throw err
        },
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === "UNAUTHORIZED") {
        didFailWithAuth = true
        setStreaming({ content: SESSION_EXPIRED_MESSAGE, sources: [] })
        dispatch(markSessionExpired())
      } else if ((err as Error).name !== "AbortError") {
        toast.error("Failed to send message")
      }
    } finally {
      setPending(false)
      if (!didFailWithAuth) {
        setTimeout(() => setStreaming(null), 200)
      }
    }
  }

  const cancel = () => {
    abortRef.current?.abort()
    setPending(false)
    setStreaming(null)
  }

  return { send, cancel, streaming, pending }
}
