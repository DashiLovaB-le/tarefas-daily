import { useState } from "react"
import { 
  Clock, 
  Star, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle,
  Calendar,
  Flag,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskCardProps {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  isCompleted: boolean
  isStarred: boolean
  assignee?: string
  project?: string
  onToggleComplete: (id: string) => void
  onToggleStar: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const priorityConfig = {
  low: {
    color: "text-green-400",
    bg: "nm-badge",
    label: "Baixa"
  },
  medium: {
    color: "text-orange-400", 
    bg: "nm-badge",
    label: "Média"
  },
  high: {
    color: "text-red-400",
    bg: "nm-badge", 
    label: "Alta"
  }
}

const TaskCard = ({
  id,
  title,
  description,
  priority,
  dueDate,
  isCompleted,
  isStarred,
  assignee,
  project,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete
}: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const priorityStyle = priorityConfig[priority]
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    })
  }

  const isOverdue = dueDate && new Date(dueDate) < new Date() && !isCompleted

  return (
    <div 
      className={cn(
        "task-card p-4 animate-fade-in group",
        isCompleted && "opacity-75",
        isOverdue && "border-l-4 border-l-red-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={() => onToggleComplete(id)}
          className="mt-1 transition-colors"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-foreground leading-snug",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStar(id)}
            className={cn(
              "p-1 rounded transition-colors",
              isStarred ? "text-orange-400" : "text-muted-foreground hover:text-orange-400"
            )}
          >
            <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(id)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* Priority Badge */}
          <div className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            priorityStyle.color,
            priorityStyle.bg
          )}>
            <Flag className="w-3 h-3" />
            {priorityStyle.label}
          </div>

          {/* Project Tag */}
          {project && (
            <span className="text-xs text-muted-foreground nm-badge">
              {project}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          {/* Assignee */}
          {assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="text-xs">{assignee}</span>
            </div>
          )}
          
          {/* Due Date */}
          {dueDate && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-red-600"
            )}>
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{formatDate(dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard