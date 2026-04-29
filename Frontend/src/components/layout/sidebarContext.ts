import { createContext, useContext } from "react"

export interface SidebarContextValue {
  isMobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
}

export const SidebarContext = createContext<SidebarContextValue>({
  isMobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
})

export const useSidebar = () => useContext(SidebarContext)
