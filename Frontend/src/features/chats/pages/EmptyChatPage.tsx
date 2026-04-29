import { motion } from "framer-motion"
import { FileText, MessageSquare, Sparkles } from "lucide-react"

import UploadZone from "../components/UploadZone"

export default function EmptyChatPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl shadow-violet-500/40">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Start a new chat
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a document and ask anything about it.
        </p>
      </motion.div>

      <UploadZone />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10 grid gap-3 sm:grid-cols-3"
      >
        <Hint
          icon={<FileText className="h-4 w-4" />}
          title="Auto-summary"
          body="See an instant overview as soon as your doc is processed."
        />
        <Hint
          icon={<MessageSquare className="h-4 w-4" />}
          title="Ask anything"
          body="Natural-language queries with cited sources."
        />
        <Hint
          icon={<Sparkles className="h-4 w-4" />}
          title="Hybrid retrieval"
          body="Combines semantic and keyword search for accuracy."
        />
      </motion.div>
    </div>
  )
}

function Hint({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-4">
      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  )
}
