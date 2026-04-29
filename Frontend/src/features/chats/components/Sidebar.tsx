import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { FileText, LogOut, Plus, Sparkles, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"

import { useSidebar } from "@/components/layout/sidebarContext"
import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth"
import { cn } from "@/lib/utils"

import { useChats } from "../hooks/useChats"
import DeleteChatDialog from "./DeleteChatDialog"
import StatusBadge from "./StatusBadge"

export default function Sidebar() {
  const { data: chats, isLoading } = useChats()
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()
  const { isMobileOpen, closeMobile } = useSidebar()
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null)

  const handleNewChat = () => {
    navigate("/dashboard")
    closeMobile()
  }

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-border/60 bg-card backdrop-blur-md transition-transform duration-300 ease-out",
          "md:relative md:translate-x-0 md:bg-card/40",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/dashboard" onClick={closeMobile} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Docs Chatter</span>
          </Link>
          <button
            onClick={closeMobile}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/30 transition hover:shadow-lg hover:shadow-violet-500/40"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <p className="px-2 pt-2 pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Recent
          </p>

          {isLoading ? (
            <div className="space-y-1.5 px-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/40" />
              ))}
            </div>
          ) : !chats || chats.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground">
              No chats yet. Upload a document to start.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {chats.map((chat, idx) => {
                const title = chat.title ?? chat.document.filename
                return (
                  <motion.li
                    key={chat.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className="relative"
                  >
                    <NavLink
                      to={`/dashboard/chats/${chat.id}`}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        cn(
                          "flex flex-col gap-1 rounded-lg px-3 py-2.5 transition",
                          isActive
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                        )
                      }
                    >
                      <div className="flex items-center gap-2 pr-7">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate text-sm font-medium">{title}</span>
                      </div>
                      <div className="flex items-center justify-between pl-6">
                        <StatusBadge status={chat.document.status} />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </NavLink>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setChatToDelete({ id: chat.id, title })
                      }}
                      aria-label={`Delete ${title}`}
                      className="absolute top-2 right-2 rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/15 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-sm font-semibold ring-1 ring-violet-500/30">
              {(user?.full_name ?? user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.full_name ?? "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {chatToDelete && (
        <DeleteChatDialog
          open={Boolean(chatToDelete)}
          onOpenChange={(open) => !open && setChatToDelete(null)}
          chatId={chatToDelete.id}
          chatTitle={chatToDelete.title}
        />
      )}
    </>
  )
}
