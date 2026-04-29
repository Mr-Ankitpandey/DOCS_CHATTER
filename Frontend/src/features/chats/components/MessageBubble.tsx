import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

import type { MessageSource } from "../types-message"
import SourceList from "./SourceList"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  sources?: MessageSource[]
  isStreaming?: boolean
}

const NO_ANSWER_PATTERNS = [
  /does(?:n't| not) (?:contain|include|provide|mention|cover|address|have|specify|state)/i,
  /no (?:information|details|mention|reference) (?:about|on|in|regarding|of)/i,
  /cannot (?:find|answer|determine)|can't (?:find|answer|determine)/i,
]

function isNoAnswerResponse(content: string): boolean {
  const opening = content.slice(0, 200)
  return NO_ANSWER_PATTERNS.some((p) => p.test(opening))
}

export default function MessageBubble({
  role,
  content,
  sources,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === "user"

  if (isStreaming && !content) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex w-full justify-start"
      >
        <span className="animate-pulse px-2 text-sm text-muted-foreground">
          Searching…
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "max-w-[85%] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
            : "max-w-full border border-border/60 bg-card/60 text-foreground lg:max-w-[85%]",
        )}
      >
        <div
          className={cn(
            "prose prose-sm max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0",
            isUser
              ? "prose-invert [&_p]:text-white [&_strong]:text-white"
              : "[&_p]:text-foreground [&_strong]:text-foreground",
            "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5",
            "[&_code]:rounded [&_code]:bg-black/20 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
            "[&_pre]:rounded-md [&_pre]:bg-black/30 [&_pre]:p-3 [&_pre]:text-xs",
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {!isUser && !isStreaming && !isNoAnswerResponse(content) && sources && sources.length > 0 && (
          <SourceList sources={sources} />
        )}
      </div>
    </motion.div>
  )
}
