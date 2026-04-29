import { Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"

import { useMessages } from "../hooks/useMessages"
import type { MessageSource } from "../types-message"
import MessageBubble from "./MessageBubble"

interface MessageListProps {
  chatId: string
  streaming: { content: string; sources: MessageSource[] } | null
}

export default function MessageList({ chatId, streaming }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(chatId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages?.length, streaming?.content])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages…
      </div>
    )
  }

  if ((!messages || messages.length === 0) && !streaming) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div className="text-sm text-muted-foreground">
          Ask anything about the document below.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-6 py-4">
      {messages?.map((m) => (
        <MessageBubble
          key={m.id}
          role={m.role}
          content={m.content}
          sources={m.sources}
        />
      ))}
      {streaming && (
        <MessageBubble
          role="assistant"
          content={streaming.content}
          sources={streaming.sources}
          isStreaming
        />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
