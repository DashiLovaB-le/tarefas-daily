import { useState } from "react"
import { Clock, Plus, Calendar as CalendarIcon } from "lucide-react"
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

const Upcoming = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Apresentação para cliente",
      description: "Preparar slides para reunião da próxima semana",
      priority: "high",
      status: "pending",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["trabalho", "cliente"]
    },
    {
      id: "2",
      title: "Revisão do projeto",
      description: "Revisar código antes do deploy",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["desenvolvimento", "revisão"]
    },
    {
      id: "3",
      title: "Consulta médica",
      description: "Exame de rotina agendado",
      priority: "low",
      status: "pending",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["pessoal", "saúde"]
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

  const upcomingTasks = tasks.filter(task => 
    new Date(task.dueDate) > new Date(new Date().toISOString().split('T')[0])
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {}
    tasks.forEach(task => {
      const date = new Date(task.dueDate).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(task)
    })
    return groups
  }

  const taskGroups = groupTasksByDate(upcomingTasks)

  return (
    <AppLayout>
      <AppHeader 
        title="Próximas Tarefas" 
        subtitle="Tarefas agendadas para os próximos dias"
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
                <p className="text-sm font-medium text-muted-foreground">Total Próximas</p>
                <p className="text-2xl font-bold text-foreground">{upcomingTasks.length}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold text-warning">
                  {upcomingTasks.filter(t => {
                    const taskDate = new Date(t.dueDate)
                    const today = new Date()
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return taskDate <= nextWeek
                  }).length}
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-warning" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-destructive">
                  {upcomingTasks.filter(t => t.priority === 'high').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-destructive" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks grouped by date */}
        <div className="space-y-8">
          {Object.keys(taskGroups).length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma tarefa agendada
              </h3>
              <p className="text-muted-foreground">
                Adicione tarefas futuras para manter-se organizado!
              </p>
            </Card>
          ) : (
            Object.entries(taskGroups).map(([date, tasks]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold text-foreground mb-4 capitalize">
                  {date}
                </h2>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskCardAdapter
                      key={task.id}
                      task={task}
                      onUpdate={handleTaskUpdate}
                      onDelete={handleTaskDelete}
                    />
                  ))}
                </div>
              </div>
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

export default Upcoming