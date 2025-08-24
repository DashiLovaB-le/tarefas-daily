import { 
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
        "task-card animate-fade-in group",
        // Padding responsivo
        "p-3 sm:p-4",
        isCompleted && "opacity-75",
        isOverdue && "border-l-4 border-l-red-500"
      )}

    >
      {/* Header */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <button
          onClick={() => onToggleComplete(id)}
          className={cn(
            "transition-colors flex-shrink-0 rounded-md",
            // Área de toque adequada para mobile (44px mínimo)
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            "p-2 -m-2 sm:p-1 sm:-m-1"
          )}
          aria-label={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
        
        <div className="flex-1 min-w-0 pr-2">
          <h3 className={cn(
            "font-medium text-foreground leading-snug break-words",
            // Tamanho de fonte responsivo
            "text-sm sm:text-base",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
          
          {description && (
            <p className={cn(
              "text-muted-foreground mt-1 line-clamp-2 break-words",
              // Tamanho de fonte responsivo para descrição
              "text-xs sm:text-sm"
            )}>
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleStar(id)}
            className={cn(
              "rounded-md transition-colors flex-shrink-0",
              // Área de toque adequada para mobile (44px mínimo)
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              "p-2 -m-2 sm:p-1 sm:-m-1",
              isStarred ? "text-orange-400" : "text-muted-foreground hover:text-orange-400"
            )}
            aria-label={isStarred ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star className={cn("w-4 h-4", isStarred && "fill-current")} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className={cn(
                  "flex-shrink-0",
                  // Tamanho de toque adequado para mobile (44px mínimo)
                  "min-w-[44px] min-h-[44px]"
                )}
                aria-label="Mais opções"
              >
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
      <div className={cn(
        "text-sm",
        // Layout responsivo: vertical em mobile, horizontal em desktop
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      )}>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Priority Badge */}
          <div className={cn(
            "inline-flex items-center gap-1 font-medium flex-shrink-0",
            // Tamanho responsivo do badge
            "text-xs px-2 py-1",
            priorityStyle.color,
            priorityStyle.bg
          )}>
            <Flag className="w-3 h-3" />
            <span className="hidden sm:inline">{priorityStyle.label}</span>
            <span className="sm:hidden">
              {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
            </span>
          </div>

          {/* Project Tag */}
          {project && (
            <span className={cn(
              "text-muted-foreground nm-badge flex-shrink-0",
              "text-xs px-2 py-1"
            )}>
              {project}
            </span>
          )}
        </div>

        <div className={cn(
          "flex items-center text-muted-foreground",
          // Gap responsivo
          "gap-2 sm:gap-3"
        )}>
          {/* Assignee */}
          {assignee && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <User className="w-3 h-3" />
              <span className="text-xs truncate max-w-[100px] sm:max-w-none">
                {assignee}
              </span>
            </div>
          )}
          
          {/* Due Date */}
          {dueDate && (
            <div className={cn(
              "flex items-center gap-1 flex-shrink-0",
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