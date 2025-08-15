import { useState } from "react"
import { Calendar, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TaskCardAdapter from "@/components/TaskCardAdapter"
import TaskModalAdapter from "@/components/TaskModalAdapter"

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
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Revisar relatório de vendas",
      description: "Analisar os números do último trimestre",
      priority: "high",
      status: "pending",
      dueDate: new Date().toISOString().split('T')[0],
      tags: ["trabalho", "urgente"]
    },
    {
      id: "2", 
      title: "Reunião com equipe",
      description: "Discussão sobre próximos projetos",
      priority: "medium",
      status: "in-progress",
      dueDate: new Date().toISOString().split('T')[0],
      tags: ["reunião", "equipe"]
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
      ...newTask,
      id: Date.now().toString()
    }
    setTasks(prev => [task, ...prev])
    setIsModalOpen(false)
  }

  const todayTasks = tasks.filter(task => task.dueDate === new Date().toISOString().split('T')[0])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hoje</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gradient-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

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
      </div>
    </div>
  )
}

export default Today