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
import { supabase } from "@/integrations/supabase/client"

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

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const isMobile = useMobile()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Mapear dados do Supabase para o formato esperado
      const mappedTasks = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: (task.priority || 'medium') as "high" | "medium" | "low",
        dueDate: task.due_date || '',
        isCompleted: task.status === 'completed',
        isStarred: task.is_starred || false,
        assignee: '', // Campo não existe na tabela tasks
        project: task.project_id || ''
      }))

      setTasks(mappedTasks)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Task handlers
  const handleToggleComplete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const task = tasks.find(t => t.id === id)
      if (!task) return

      const newStatus = task.isCompleted ? 'pending' : 'completed'
      const completedAt = task.isCompleted ? null : new Date().toISOString()

      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      ))
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleToggleStar = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const task = tasks.find(t => t.id === id)
      if (!task) return

      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_starred: !task.isStarred,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, isStarred: !task.isStarred } : task
      ))
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleEditTask = (id: string) => {
    console.log("Edit task:", id)
    // TODO: Implementar edição
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  const handleCreateTask = async (taskData: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            due_date: taskData.dueDate,
            status: 'pending',
            is_starred: false,
            project_id: null, // Por enquanto, não associar a projetos até implementarmos seleção de projetos
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      
      // Mapear dados do Supabase para o formato esperado
      const newTask = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        priority: (data.priority || 'medium') as "high" | "medium" | "low",
        dueDate: data.due_date || '',
        isCompleted: data.status === 'completed',
        isStarred: data.is_starred || false,
        assignee: '',
        project: data.project_id || ''
      }

      setTasks(prev => [newTask, ...prev])
      setIsTaskModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
    }
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
    <AppLayout>
      <AppHeader 
        title="Dashboard" 
        subtitle={`Bem-vindo de volta! Você tem ${pendingTasks} tarefas pendentes.`}
      >
        <Button 
          onClick={() => setIsTaskModalOpen(true)}
          className="gradient-button"
          size={isMobile ? "sm" : "default"}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </Button>
      </AppHeader>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
          <div className={cn(
            "nm-card border-0 mb-4 sm:mb-6",
            // Padding responsivo
            "p-4 sm:p-6"
          )}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "nm-input pl-10",
                      // Largura total em mobile
                      "w-full"
                    )}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className={cn(
                    // Largura total em mobile, fixa em desktop
                    "w-full sm:w-[150px]"
                  )}>
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
                  <SelectTrigger className={cn(
                    // Largura total em mobile, fixa em desktop
                    "w-full sm:w-[150px]"
                  )}>
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
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Tarefas ({filteredTasks.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando tarefas...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
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

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </AppLayout>
  )
}

export default Dashboard
