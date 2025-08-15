import { useState } from "react"
import { Star, Plus } from "lucide-react"
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
  starred?: boolean
}

const Starred = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Projeto estratégico 2024",
      description: "Planejamento completo para expansão da empresa",
      priority: "high",
      status: "in-progress",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["estratégia", "planejamento"],
      starred: true
    },
    {
      id: "2",
      title: "Aprendizado de React",
      description: "Curso avançado de React e TypeScript",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["estudo", "desenvolvimento"],
      starred: true
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
      id: Date.now().toString(),
      starred: true // Automaticamente marca como favorita quando criada nesta página
    }
    setTasks(prev => [task, ...prev])
    setIsModalOpen(false)
  }

  const starredTasks = tasks.filter(task => task.starred)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-warning fill-warning" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tarefas Favoritas</h1>
              <p className="text-muted-foreground">
                Suas tarefas mais importantes marcadas como favoritas
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gradient-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa Favorita
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Favoritas</p>
                <p className="text-2xl font-bold text-foreground">{starredTasks.length}</p>
              </div>
              <Star className="w-8 h-8 text-warning fill-warning" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-success">
                  {starredTasks.filter(t => t.status === 'completed').length}
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
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-primary">
                  {starredTasks.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {starredTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma tarefa favorita
              </h3>
              <p className="text-muted-foreground">
                Marque tarefas importantes como favoritas para encontrá-las facilmente!
              </p>
            </Card>
          ) : (
            starredTasks.map((task) => (
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

export default Starred