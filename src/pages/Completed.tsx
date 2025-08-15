import { useState } from "react"
import { CheckSquare, Calendar, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TaskCardAdapter from "@/components/TaskCardAdapter"

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

const Completed = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Relatório mensal finalizado",
      description: "Análise completa dos resultados de vendas",
      priority: "high",
      status: "completed",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["trabalho", "relatório"],
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "2",
      title: "Exercícios da semana",
      description: "Academia segunda, quarta e sexta",
      priority: "medium",
      status: "completed",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["saúde", "exercício"],
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      title: "Leitura do livro",
      description: "Terminar capítulos 5-8",
      priority: "low",
      status: "completed",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["pessoal", "leitura"],
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
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

  const handleRestoreTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'pending', completedAt: undefined } : task
    ))
  }

  const completedTasks = tasks.filter(task => task.status === 'completed')
    .sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      }
      return 0
    })

  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {}
    tasks.forEach(task => {
      const date = task.completedAt ? 
        new Date(task.completedAt).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        }) : 'Data desconhecida'
      if (!groups[date]) groups[date] = []
      groups[date].push(task)
    })
    return groups
  }

  const taskGroups = groupTasksByDate(completedTasks)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-success" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tarefas Concluídas</h1>
              <p className="text-muted-foreground">
                Histórico de todas as tarefas finalizadas
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Concluídas</p>
                <p className="text-2xl font-bold text-foreground">{completedTasks.length}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-success" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold text-success">
                  {completedTasks.filter(t => {
                    if (!t.completedAt) return false
                    const taskDate = new Date(t.completedAt)
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return taskDate >= weekAgo
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-success" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-destructive">
                  {completedTasks.filter(t => t.priority === 'high').length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-destructive" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-primary">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks grouped by completion date */}
        <div className="space-y-8">
          {Object.keys(taskGroups).length === 0 ? (
            <Card className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma tarefa concluída
              </h3>
              <p className="text-muted-foreground">
                Complete algumas tarefas para ver o histórico aqui!
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
                    <div key={task.id} className="relative">
                      <TaskCardAdapter
                        task={task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-4 right-4"
                        onClick={() => handleRestoreTask(task.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restaurar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Completed