import { useState, useEffect } from "react"
import { CheckSquare, Calendar, RotateCcw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TaskCardAdapter from "@/components/TaskCardAdapter"
import AppLayout from "@/components/layout/AppLayout"
import AppHeader from "@/components/layout/AppHeader"
import { supabase } from "@/integrations/supabase/client"

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedTasks()
  }, [])

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_tags (
            tags (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Mapear dados do Supabase para o formato esperado
      const mappedTasks = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: (task.priority || 'medium') as 'high' | 'medium' | 'low',
        status: (task.status || 'pending') as 'pending' | 'in-progress' | 'completed',
        dueDate: task.due_date || '',
        tags: task.task_tags?.map((tt: any) => tt.tags?.name).filter(Boolean) || [],
        completedAt: task.completed_at
      }))

      setTasks(mappedTasks)
    } catch (error) {
      console.error('Erro ao buscar tarefas concluídas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const completedAt = updates.status === 'completed' ? new Date().toISOString() : null

      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          due_date: updates.dueDate,
          status: updates.status,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  const handleRestoreTask = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'pending',
          completed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'pending' as const, completedAt: undefined } : task
      ))
    } catch (error) {
      console.error('Erro ao restaurar tarefa:', error)
    }
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
    <AppLayout>
      <AppHeader 
        title="Tarefas Concluídas" 
        subtitle="Histórico de todas as tarefas finalizadas"
      />

      <main className="flex-1 overflow-auto p-6">

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
      </main>
    </AppLayout>
  )
}

export default Completed