import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/25 blur-3xl" />
      </div>

      <Link
        to="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span>Docs Chatter</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-2xl shadow-violet-500/10 backdrop-blur-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </motion.div>
    </div>
  )
}
