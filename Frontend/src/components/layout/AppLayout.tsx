import { Menu } from "lucide-react"
import { useState } from "react"
import { Outlet } from "react-router-dom"

import Sidebar from "@/features/chats/components/Sidebar"

import { SidebarContext, type SidebarContextValue } from "./sidebarContext"

export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const value: SidebarContextValue = {
    isMobileOpen,
    openMobile: () => setIsMobileOpen(true),
    closeMobile: () => setIsMobileOpen(false),
  }

  return (
    <SidebarContext.Provider value={value}>
      <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />

        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}

        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          className="fixed top-3 left-3 z-20 rounded-lg border border-border/60 bg-card/80 p-2 text-foreground backdrop-blur-md transition hover:bg-card md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
