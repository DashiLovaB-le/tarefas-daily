import { useState } from "react"
import { 
  CheckSquare, 
  Clock, 
  Star, 
  TrendingUp,
  Plus,
  Filter,
  Search
} from "lucide-react"
import AppSidebar from "@/components/layout/AppSidebar"
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

// Mock data - será substituído por dados do Supabase
const mockTasks = [
  {
    id: "1",
    title: "Finalizar apresentação do projeto",
    description: "Preparar slides e ensaiar apresentação para o cliente",
    priority: "high" as const,
    dueDate: "2024-01-20",
    isCompleted: false,
    isStarred: true,
    assignee: "João Silva",
    project: "Trabalho"
  },
  {
    id: "2", 
    title: "Comprar ingredientes para jantar",
    description: "Lista: tomate, cebola, alho, carne",
    priority: "medium" as const,
    dueDate: "2024-01-18",
    isCompleted: false,
    isStarred: false,
    assignee: "",
    project: "Pessoal"
  },
  {
    id: "3",
    title: "Revisar código do frontend",
    description: "Fazer code review do PR #123",
    priority: "low" as const,
    dueDate: "2024-01-22",
    isCompleted: true,
    isStarred: false,
    assignee: "Maria Santos", 
    project: "Trabalho"
  }
]

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tasks, setTasks] = useState(mockTasks)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Task handlers
  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ))
  }

  const handleToggleStar = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, isStarred: !task.isStarred } : task
    ))
  }

  const handleEditTask = (id: string) => {
    console.log("Edit task:", id)
    // TODO: Implementar edição
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      isCompleted: false,
      isStarred: false
    }
    setTasks(prev => [newTask, ...prev])
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && task.isCompleted) ||
                         (filterStatus === "pending" && !task.isCompleted)
    
    return matchesSearch && matchesPriority && matchesStatus
  })

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const pendingTasks = totalTasks - completedTasks
  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.dueDate).toDateString()
    const today = new Date().toDateString()
    return taskDate === today
  }).length

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AppSidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="nm-card px-6 py-4 border-0 mx-6 mt-6 mb-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo de volta! Você tem {pendingTasks} tarefas pendentes.
              </p>
            </div>
            
            <Button 
              onClick={() => setIsTaskModalOpen(true)}
              className="gradient-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total de Tarefas"
              value={totalTasks}
              icon={<CheckSquare />}
              color="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Pendentes"
              value={pendingTasks}
              icon={<Clock />}
              color="primary"
            />
            <StatsCard
              title="Concluídas"
              value={completedTasks}
              icon={<CheckSquare />}
              color="success"
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Hoje"
              value={todayTasks}
              icon={<Star />}
              color="primary"
            />
          </div>

          {/* Filters */}
          <div className="nm-card p-6 mb-6 border-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="nm-input pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Tarefas ({filteredTasks.length})
            </h2>
            
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterPriority !== "all" || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando sua primeira tarefa"
                  }
                </p>
                <Button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="gradient-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    {...task}
                    onToggleComplete={handleToggleComplete}
                    onToggleStar={handleToggleStar}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  )
}

export default Dashboard