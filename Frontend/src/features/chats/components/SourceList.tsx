import { useState } from "react"

import { cn } from "@/lib/utils"

import type { MessageSource } from "../types-message"

export default function SourceList({ sources }: { sources: MessageSource[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!sources?.length) return null

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <button
            key={s.chunk.id}
            onClick={() => setExpanded(expanded === s.chunk.id ? null : s.chunk.id)}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs ring-1 transition",
              expanded === s.chunk.id
                ? "bg-violet-500/20 text-violet-200 ring-violet-500/40"
                : "bg-violet-500/10 text-violet-300 ring-violet-500/30 hover:bg-violet-500/15",
            )}
          >
            {s.chunk.page_number != null ? `Page. ${s.chunk.page_number + 1}` : `Source ${i + 1}`}
          </button>
        ))}
      </div>

      {expanded && (
        <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
          {sources?.find((s) => s.chunk?.id === expanded)?.chunk.content}
        </div>
      )}
    </div>
  )
}
