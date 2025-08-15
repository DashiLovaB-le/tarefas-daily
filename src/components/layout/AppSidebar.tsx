import { useState } from "react"
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

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const AppSidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

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
  }

  return (
    <div className={cn(
      "relative h-screen bg-gradient-to-b from-card to-secondary/50 border-r border-border/50 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-72"
    )}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-inter font-semibold text-foreground">TaskFlow</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-4">
        <button className={cn(
          "w-full bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary/90 hover:scale-105",
          isCollapsed ? "p-3" : "p-3 px-4"
        )}>
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>Nova Tarefa</span>}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-2 space-y-1">
        {/* Main Items */}
        <div className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full sidebar-item",
                  location.pathname === item.path && "active"
                )}
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
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                      "w-full sidebar-item",
                      location.pathname === item.path && "active"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
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
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border/50">
        <button
          onClick={() => handleNavigation("/settings")}
          className={cn(
            "w-full sidebar-item",
            location.pathname === "/settings" && "active"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
        </button>
      </div>
    </div>
  )
}

export default AppSidebar