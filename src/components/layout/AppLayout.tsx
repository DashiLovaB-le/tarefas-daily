import { useState, createContext, useContext } from "react"
import { useMobile } from "@/hooks/use-mobile"
import AppSidebar from "./AppSidebar"

interface AppLayoutContextType {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
}

const AppLayoutContext = createContext<AppLayoutContextType | undefined>(undefined)

export const useAppLayout = () => {
  const context = useContext(AppLayoutContext)
  if (!context) {
    throw new Error("useAppLayout must be used within AppLayout")
  }
  return context
}

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useMobile()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const contextValue = {
    isMobileMenuOpen,
    toggleMobileMenu
  }

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - hidden on mobile, overlay when open */}
        {!isMobile && (
          <AppSidebar 
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar Overlay */}
        {isMobile && (
          <AppSidebar 
            isCollapsed={false}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </AppLayoutContext.Provider>
  )
}

export default AppLayout