import { useState } from "react"
import { X, Calendar, Flag, User, Folder, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal"
import { Label } from "@/components/ui/label"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: TaskFormData) => void
  initialData?: Partial<TaskFormData>
  mode?: "create" | "edit"
}

interface TaskFormData {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  dueDate: string
  assignee: string
  project: string
  tags: string[]
}

const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  mode = "create" 
}: TaskModalProps) => {
  const isMobile = useMobile()
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "medium",
    dueDate: initialData?.dueDate || "",
    assignee: initialData?.assignee || "",
    project: initialData?.project || "",
    tags: initialData?.tags || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório"
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Data de vencimento é obrigatória"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
      onClose()
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignee: "",
        project: "",
        tags: []
      })
    }
  }

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <ResponsiveModal isOpen={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent className={cn(
        "nm-card border-0",
        // Desktop: modal tradicional
        "sm:max-w-2xl sm:max-h-[90vh]",
        // Mobile: drawer ocupa mais espaço
        isMobile && "max-h-[85vh]"
      )}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-xl font-semibold">
            {mode === "create" ? "Nova Tarefa" : "Editar Tarefa"}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <form onSubmit={handleSubmit} className={cn(
          "space-y-4 sm:space-y-6",
          // Padding responsivo
          "px-4 sm:px-6",
          // Scroll para mobile
          isMobile && "overflow-y-auto flex-1"
        )}>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Título da tarefa..."
              className={cn(
                errors.title ? "border-destructive" : "",
                // Altura mínima para touch em mobile
                isMobile && "min-h-[44px]"
              )}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva a tarefa..."
              rows={isMobile ? 2 : 3}
              className="resize-none"
            />
          </div>

          {/* Grid Layout for smaller fields */}
          <div className={cn(
            "grid gap-4",
            // Mobile: sempre 1 coluna, Desktop: 2 colunas
            "grid-cols-1 sm:grid-cols-2"
          )}>
            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Prioridade
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") => 
                  handleInputChange("priority", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Baixa
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Alta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Vencimento *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className={cn(
                  errors.dueDate ? "border-destructive" : "",
                  // Altura mínima para touch em mobile
                  isMobile && "min-h-[44px]"
                )}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate}</p>
              )}
            </div>

            {/* Project */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Projeto
              </Label>
              <Select
                value={formData.project}
                onValueChange={(value) => handleInputChange("project", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="work">Trabalho</SelectItem>
                  <SelectItem value="shopping">Compras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Responsável
              </Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleInputChange("assignee", e.target.value)}
                placeholder="Nome do responsável"
                className={cn(
                  // Altura mínima para touch em mobile
                  isMobile && "min-h-[44px]"
                )}
              />
            </div>
          </div>

          {/* Attachments placeholder */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Anexos
            </Label>
            <div className={cn(
              "border-2 border-dashed border-muted-foreground/25 rounded-lg text-center",
              // Padding responsivo
              "p-4 sm:p-8"
            )}>
              <Paperclip className={cn(
                "text-muted-foreground mx-auto mb-2",
                // Ícone menor em mobile
                "w-6 h-6 sm:w-8 sm:h-8"
              )} />
              <p className="text-sm text-muted-foreground">
                {isMobile ? "Toque para selecionar" : "Arraste arquivos aqui ou clique para selecionar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, PDF até 10MB
              </p>
            </div>
          </div>

        </form>

        {/* Action Buttons */}
        <ResponsiveModalFooter className={cn(
          "gap-3 pt-4 border-t",
          // Mobile: botões empilhados, Desktop: lado a lado
          isMobile ? "flex-col-reverse" : "flex-row justify-end"
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className={cn(
              // Botões full-width em mobile
              isMobile && "w-full"
            )}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className={cn(
              "gradient-button",
              // Botões full-width em mobile
              isMobile && "w-full"
            )}
            onClick={handleSubmit}
          >
            {mode === "create" ? "Criar Tarefa" : "Salvar Alterações"}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

export default TaskModal