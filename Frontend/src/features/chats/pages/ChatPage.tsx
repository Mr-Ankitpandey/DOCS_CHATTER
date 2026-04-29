import { Loader2 } from "lucide-react"
import { useParams } from "react-router-dom"

import MessageInput from "../components/MessageInput"
import MessageList from "../components/MessageList"
import StatusBadge from "../components/StatusBadge"
import { useChat } from "../hooks/useChats"
import { useStreamMessage } from "../hooks/useStreamMessage"

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const { data: chat, isLoading } = useChat(chatId)
  const stream = useStreamMessage(chatId ?? "")

  if (!chatId || isLoading || !chat) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading chat…
      </div>
    )
  }

  const isReady = chat.document.status === "ready"
  const isFailed = chat.document.status === "failed"
  const isProcessing =
    chat.document.status === "pending" || chat.document.status === "processing"

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border/60 px-4 py-3 pl-16 md:px-6 md:py-4 md:pl-6">
        <h1 className="truncate text-base font-semibold">
          {chat.title ?? chat.document.filename}
        </h1>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <StatusBadge status={chat.document.status} />
          <span>·</span>
          <span className="truncate">{chat.document.filename}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-4xl flex-col px-2 md:px-0">
          {chat.document.summary && (
            <section className="mx-4 mt-6 rounded-xl border border-border/60 bg-card/40 p-5 md:mx-6">
              <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Summary
              </p>
              <p className="text-sm leading-relaxed">{chat.document.summary}</p>
            </section>
          )}

          {isFailed && (
            <section className="mx-4 mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-5 md:mx-6">
              <p className="text-sm text-red-400">
                Processing failed: {chat.document.error_message ?? "unknown error"}
              </p>
            </section>
          )}

          {isProcessing && (
            <section className="mx-4 mt-6 rounded-xl border border-border/60 bg-card/40 p-5 md:mx-6">
              <p className="text-sm text-muted-foreground">
                We're reading your document. This usually takes a few seconds.
              </p>
            </section>
          )}

          <div className="flex-1" />

          {isReady && <MessageList chatId={chatId} streaming={stream.streaming} />}
        </div>
      </div>

      {isReady && <MessageInput onSend={stream.send} disabled={stream.pending} />}
    </div>
  )
}
