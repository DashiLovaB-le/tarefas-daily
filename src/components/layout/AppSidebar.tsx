import { useState, useEffect } from "react"
import {
  Home,
  Plus,
  Calendar,
  Folder,
  Settings,
  User,
  CheckSquare,
  Clock,
  Star,
  Archive,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate, useLocation } from "react-router-dom"
import { useMobile } from "@/hooks/use-mobile"

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

const AppSidebar = ({
  isCollapsed,
  onToggle,
  isMobileMenuOpen = false,
  onMobileMenuClose
}: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMobile()

  const mainItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "today", label: "Hoje", icon: Calendar, path: "/today" },
    { id: "upcoming", label: "Próximas", icon: Clock, path: "/upcoming" },
    { id: "starred", label: "Favoritas", icon: Star, path: "/starred" },
    { id: "completed", label: "Concluídas", icon: CheckSquare, path: "/completed" },
  ]

  const projectItems = [
    { id: "personal", label: "Pessoal", icon: User, count: 12, path: "/projects/personal" },
    { id: "work", label: "Trabalho", icon: Folder, count: 8, path: "/projects/work" },
    { id: "shopping", label: "Compras", icon: Archive, count: 3, path: "/projects/shopping" },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    // Fecha o menu mobile após navegação
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose()
    }
  }

  // Fecha o menu mobile quando clica no backdrop
  const handleBackdropClick = () => {
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose()
    }
  }

  // Previne o fechamento quando clica dentro da sidebar
  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Adiciona/remove classe no body para prevenir scroll quando overlay está aberto
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isMobileMenuOpen])

  // Renderização condicional para mobile vs desktop
  if (isMobile) {
    return (
      <>
        {/* Backdrop/Overlay para mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={handleBackdropClick}
          />
        )}

        {/* Sidebar mobile como overlay */}
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-72 nm-card border-0 z-50 transition-transform duration-300 ease-in-out flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={handleSidebarClick}
        >
          {/* Conteúdo da sidebar mobile */}
          <SidebarContent
            isCollapsed={false}
            onToggle={onToggle}
            mainItems={mainItems}
            projectItems={projectItems}
            handleNavigation={handleNavigation}
            location={location}
            isMobile={true}
          />
        </div>
      </>
    )
  }

  // Sidebar desktop
  return (
    <div className={cn(
      "relative h-screen nm-card border-0 transition-all duration-300 ease-in-out m-6 mr-0 rounded-r-none flex flex-col",
      isCollapsed ? "w-16" : "w-72"
    )}>
      <SidebarContent
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        mainItems={mainItems}
        projectItems={projectItems}
        handleNavigation={handleNavigation}
        location={location}
        isMobile={false}
      />
    </div>
  )
}

// Componente reutilizável para o conteúdo da sidebar
interface SidebarContentProps {
  isCollapsed: boolean
  onToggle: () => void
  mainItems: Array<{
    id: string
    label: string
    icon: React.ComponentType<any>
    path: string
  }>
  projectItems: Array<{
    id: string
    label: string
    icon: React.ComponentType<any>
    count: number
    path: string
  }>
  handleNavigation: (path: string) => void
  location: { pathname: string }
  isMobile: boolean
}

const SidebarContent = ({
  isCollapsed,
  onToggle,
  mainItems,
  projectItems,
  handleNavigation,
  location,
  isMobile
}: SidebarContentProps) => {
  return (
    <>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border/20">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="DashiTask Logo" 
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-inter font-semibold text-sidebar-foreground">DashiTask</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="nm-btn p-3 text-sidebar-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-4">
        <button
          className={cn(
            "w-full gradient-button font-medium min-h-[44px]",
            isCollapsed ? "p-3" : "p-3 px-4"
          )}
          aria-label="Nova tarefa"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>Nova Tarefa</span>}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-2 space-y-1 flex-1 overflow-y-auto">
        {/* Main Items */}
        <div className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full sidebar-item min-h-[44px]",
                  location.pathname === item.path && "active"
                )}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Projects Section */}
        {!isCollapsed && (
          <div className="pt-6">
            <h3 className="px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
              Projetos
            </h3>
            <div className="space-y-1">
              {projectItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full sidebar-item min-h-[44px]",
                      location.pathname === item.path && "active"
                    )}
                    aria-label={item.label}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>
                    <span className="text-xs nm-badge text-sidebar-accent-foreground px-2 py-1">
                      {item.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-2 border-t border-sidebar-border/20">
        <button
          onClick={() => handleNavigation("/settings")}
          className={cn(
            "w-full sidebar-item min-h-[44px]",
            location.pathname === "/settings" && "active"
          )}
          aria-label="Configurações"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
        </button>
      </div>
    </>
  )
}

export default AppSidebar