import { useState, useEffect } from "react"
import { CheckSquare, Calendar, RotateCcw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TaskCardAdapter from "@/components/TaskCardAdapter"
import AppLayout from "@/components/layout/AppLayout"
import AppHeader from "@/components/layout/AppHeader"

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  tags: string[]
  completedAt?: string
}

// Mock data for demonstration
const mockCompletedTasks: Task[] = [
  {
    id: "1",
    title: "Concluir relatório mensal",
    description: "Finalizar análise de vendas do mês",
    priority: "high",
    status: "completed",
    dueDate: "2024-01-15",
    tags: ["trabalho", "relatório"],
    completedAt: "2024-01-14"
  },
  {
    id: "2", 
    title: "Revisar documentação do projeto",
    description: "Atualizar docs técnicas",
    priority: "medium",
    status: "completed",
    dueDate: "2024-01-10",
    tags: ["projeto", "documentação"],
    completedAt: "2024-01-09"
  }
]

const Completed = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento dos dados
    const loadTasks = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simula delay
      setTasks(mockCompletedTasks)
      setLoading(false)
    }
    
    loadTasks()
  }, [])

  const markAsIncomplete = async (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'pending' as const, completedAt: undefined }
        : task
    )
    setTasks(updatedTasks.filter(task => task.status === 'completed'))
  }

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const restoreTask = async (taskId: string) => {
    await markAsIncomplete(taskId)
  }

  const stats = {
    totalCompleted: tasks.length,
    thisWeek: tasks.filter(task => {
      if (!task.completedAt) return false
      const completedDate = new Date(task.completedAt)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return completedDate >= weekAgo
    }).length,
    thisMonth: tasks.filter(task => {
      if (!task.completedAt) return false
      const completedDate = new Date(task.completedAt)
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return completedDate >= monthAgo
    }).length
  }

  if (loading) {
    return (
      <AppLayout>
        <AppHeader title="Tarefas Concluídas" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <AppHeader title="Tarefas Concluídas" />
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Concluídas</p>
                <p className="text-2xl font-bold">{stats.totalCompleted}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa concluída ainda</h3>
              <p className="text-muted-foreground mb-4">
                Quando você concluir tarefas, elas aparecerão aqui.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Tarefa
              </Button>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tarefas Concluídas ({tasks.length})</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restaurar Selecionadas
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <TaskCardAdapter
                    key={task.id}
                    task={task}
                    onUpdate={(taskId, updates) => {
                      const updatedTasks = tasks.map(t => 
                        t.id === taskId ? { ...t, ...updates } : t
                      )
                      setTasks(updatedTasks)
                    }}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default Completed