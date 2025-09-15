import { useState, useEffect } from "react"
import { 
  CheckSquare, 
  Clock, 
  Star, 
  Plus,
  Filter,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import TaskCard from "@/components/tasks/TaskCard"
import TaskModal from "@/components/tasks/TaskModal"
import StatsCard from "@/components/dashboard/StatsCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AppLayout from "@/components/layout/AppLayout"
import AppHeader from "@/components/layout/AppHeader"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  isCompleted: boolean;
  isStarred: boolean;
  assignee?: string;
  project?: string;
}

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Preparar apresentação do projeto",
    description: "Criar slides para reunião com stakeholders",
    priority: "high",
    dueDate: "2024-01-20",
    isCompleted: false,
    isStarred: true,
    assignee: "João Silva",
    project: "Projeto Alpha"
  },
  {
    id: "2",
    title: "Revisar código da feature X",
    description: "Code review das alterações implementadas",
    priority: "medium",
    dueDate: "2024-01-18",
    isCompleted: false,
    isStarred: false,
    assignee: "Maria Santos",
    project: "Sistema Web"
  },
  {
    id: "3",
    title: "Atualizar documentação",
    description: "Documentar novas funcionalidades",
    priority: "low",
    dueDate: "2024-01-25",
    isCompleted: true,
    isStarred: false,
    project: "Documentação"
  }
]

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const isMobile = useMobile()

  useEffect(() => {
    // Simula carregamento dos dados
    const loadTasks = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simula delay
      setTasks(mockTasks)
      setLoading(false)
    }
    
    loadTasks()
  }, [])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && task.isCompleted) ||
                         (filterStatus === "pending" && !task.isCompleted)
    
    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleToggleComplete = async (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, isCompleted: !task.isCompleted }
        : task
    )
    setTasks(updatedTasks)
    
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      toast.success(
        task.isCompleted 
          ? "Tarefa marcada como pendente!" 
          : "Tarefa concluída!"
      )
    }
  }

  const handleToggleStar = async (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, isStarred: !task.isStarred }
        : task
    )
    setTasks(updatedTasks)
  }

  const handleDeleteTask = async (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast.success("Tarefa excluída!")
  }

  const handleCreateTask = async (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      isCompleted: false,
      isStarred: false,
      assignee: taskData.assignee,
      project: taskData.project
    }
    
    setTasks([newTask, ...tasks])
    setIsTaskModalOpen(false)
    toast.success("Tarefa criada com sucesso!")
  }

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...taskData }
        : task
    )
    setTasks(updatedTasks)
    toast.success("Tarefa atualizada!")
  }

  // Calculate stats
  const completedTasks = tasks.filter(task => task.isCompleted)
  const pendingTasks = tasks.filter(task => !task.isCompleted)
  const overdueTasks = pendingTasks.filter(task => new Date(task.dueDate) < new Date())
  const starredTasks = tasks.filter(task => task.isStarred)

  if (loading) {
    return (
      <AppLayout>
        <AppHeader title="Dashboard" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <AppHeader title="Dashboard" />
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Tarefas"
            value={tasks.length}
            icon={<CheckSquare className="h-6 w-6" />}
            color="primary"
          />
          <StatsCard
            title="Pendentes"
            value={pendingTasks.length}
            icon={<Clock className="h-6 w-6" />}
            color="warning"
          />
          <StatsCard
            title="Concluídas"
            value={completedTasks.length}
            icon={<CheckSquare className="h-6 w-6" />}
            color="success"
          />
          <StatsCard
            title="Favoritas"
            value={starredTasks.length}
            icon={<Star className="h-6 w-6" />}
            color="primary"
          />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setIsTaskModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filterPriority !== "all" || filterStatus !== "all" 
                  ? "Nenhuma tarefa encontrada" 
                  : "Nenhuma tarefa ainda"
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterPriority !== "all" || filterStatus !== "all"
                  ? "Tente ajustar os filtros para encontrar o que procura."
                  : "Comece criando sua primeira tarefa!"
                }
              </p>
              {(!searchTerm && filterPriority === "all" && filterStatus === "all") && (
                <Button onClick={() => setIsTaskModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  dueDate={task.dueDate}
                  isCompleted={task.isCompleted}
                  isStarred={task.isStarred}
                  assignee={task.assignee}
                  project={task.project}
                  onToggleComplete={() => handleToggleComplete(task.id)}
                  onToggleStar={() => handleToggleStar(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onEdit={() => {}} // Placeholder para edit
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </AppLayout>
  )
}

export default Dashboard