import { Loader2, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({
  onSend,
  disabled,
  placeholder = "Ask anything about the document…",
}: MessageInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const submit = () => {
    const content = value.trim()
    if (!content || disabled) return
    onSend(content)
    setValue("")
  }

  return (
    <div className="border-t border-border/60 bg-card/40 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border/60 bg-background/80 p-2 transition focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20",
            disabled && "opacity-70",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30 transition hover:shadow-lg hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Answers come from your document only
        </p>
      </div>
    </div>
  )
}
