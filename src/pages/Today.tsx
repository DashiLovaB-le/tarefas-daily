import { useState } from "react"
import { Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TaskCardAdapter from "@/components/TaskCardAdapter"
import TaskModalAdapter from "@/components/TaskModalAdapter"
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
}

const Today = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Mock data for today's tasks
  const today = new Date().toISOString().split('T')[0]
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Reunião com cliente às 10h",
      description: "Apresentar proposta do novo projeto",
      priority: "high",
      status: "pending",
      dueDate: today,
      tags: ["Reunião", "Cliente"]
    },
    {
      id: "2",
      title: "Revisar código do PR #123",
      description: "Análise de segurança e performance",
      priority: "medium",
      status: "in-progress",
      dueDate: today,
      tags: ["Desenvolvimento", "Review"]
    },
    {
      id: "3",
      title: "Enviar relatório mensal",
      description: "Compilar dados de vendas e métricas",
      priority: "high",
      status: "completed",
      dueDate: today,
      tags: ["Relatório", "Vendas"]
    },
    {
      id: "4",
      title: "Atualizar documentação da API",
      description: "Incluir novos endpoints e exemplos",
      priority: "low",
      status: "pending",
      dueDate: today,
      tags: ["Documentação", "API"]
    }
  ])

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleCreateTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      dueDate: today // Force today's date for tasks created on this page
    }
    
    setTasks(prev => [task, ...prev])
    setIsModalOpen(false)
  }

  const todayTasks = tasks.filter(task => task.dueDate === today)

  return (
    <AppLayout>
      <AppHeader 
        title="Hoje" 
        subtitle={new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      >
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-auto p-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Hoje</p>
                <p className="text-2xl font-bold text-foreground">{todayTasks.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-success">
                  {todayTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-success" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">
                  {todayTasks.filter(t => t.status !== 'completed').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {todayTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma tarefa para hoje
              </h3>
              <p className="text-muted-foreground">
                Adicione uma nova tarefa para começar o dia produtivo!
              </p>
            </Card>
          ) : (
            todayTasks.map((task) => (
              <TaskCardAdapter
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            ))
          )}
        </div>

        <TaskModalAdapter
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      </main>
    </AppLayout>
  )
}

export default Today