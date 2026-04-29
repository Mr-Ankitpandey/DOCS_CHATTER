import { cn } from "@/lib/utils"

import type { DocumentStatus } from "../types"

const styles: Record<DocumentStatus, { dot: string; label: string; pulse?: boolean }> = {
  pending: { dot: "bg-amber-400", label: "Queued", pulse: true },
  processing: { dot: "bg-violet-400", label: "Processing", pulse: true },
  ready: { dot: "bg-emerald-400", label: "Ready" },
  failed: { dot: "bg-red-400", label: "Failed" },
}

export default function StatusBadge({
  status,
  size = "sm",
}: {
  status: DocumentStatus
  size?: "sm" | "md"
}) {
  const s = styles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground",
        size === "sm" ? "text-xs" : "text-sm",
      )}
    >
      <span className="relative flex h-2 w-2">
        {s.pulse && (
          <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", s.dot)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
      </span>
      {s.label}
    </span>
  )
}
