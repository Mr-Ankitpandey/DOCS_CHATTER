import { motion } from "framer-motion"
import { ArrowRight, FileText, MessageSquare, Sparkles, Zap } from "lucide-react"
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <BackgroundOrbs />
      <GridOverlay />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Docs Chatter</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/80" />
            <span className="text-xs font-medium text-muted-foreground">
              RAG-powered · Hybrid retrieval · Streaming responses
            </span>
          </motion.div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Chat with your <span className="text-violet-400">documents</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Upload a PDF or Word doc, and ask anything. Get accurate answers with citations,
            powered by hybrid semantic search and modern LLMs.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Start chatting free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/40 px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-card"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mx-auto mt-24 max-w-5xl"
        >
          <ChatPreview />
        </motion.div>

        <div className="mt-32 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<FileText className="h-5 w-5" />}
            title="Upload anything"
            body="PDF and Word documents. We extract, chunk, and index in seconds."
            delay={0}
          />
          <Feature
            icon={<MessageSquare className="h-5 w-5" />}
            title="Ask in natural language"
            body="No keywords needed. Ask follow-ups. Cited answers from your source."
            delay={0.1}
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Streamed in real time"
            body="Tokens stream as they generate. No waiting for full responses."
            delay={0.2}
          />
        </div>
      </main>
    </div>
  )
}

function BackgroundOrbs() {
  return (
    <motion.div
      animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl"
    />
  )
}

function GridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
  )
}

function Feature({
  icon,
  title,
  body,
  delay,
}: {
  icon: React.ReactNode
  title: string
  body: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm transition hover:border-violet-500/40"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </motion.div>
  )
}

function ChatPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-border/60 bg-card/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        <span className="ml-3 text-xs text-muted-foreground">research-paper.pdf</span>
      </div>

      <div className="space-y-4 p-6">
        <Bubble role="user">What were the main findings on hybrid retrieval?</Bubble>
        <Bubble role="assistant">
          The paper reports that hybrid retrieval (combining dense embeddings with BM25) outperformed
          either method alone by <span className="font-semibold text-violet-300">8.4%</span> on
          domain-specific QA. Reciprocal Rank Fusion gave the most consistent gains across datasets.
        </Bubble>
        <div className="flex gap-2">
          <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300 ring-1 ring-violet-500/30">
            page 4
          </span>
          <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300 ring-1 ring-violet-500/30">
            page 7
          </span>
        </div>
      </div>
    </div>
  )
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-violet-600 text-white"
            : "border border-border/60 bg-card/60 text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
