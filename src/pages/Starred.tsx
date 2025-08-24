import { useState, useEffect } from "react"
import { Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TaskCardAdapter from "@/components/TaskCardAdapter"
import TaskModalAdapter from "@/components/TaskModalAdapter"
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
  starred?: boolean
}

const Starred = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStarredTasks()
  }, [])

  const fetchStarredTasks = async () => {
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
        .eq('is_starred', true)
        .order('created_at', { ascending: false })

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
        starred: task.is_starred
      }))

      setTasks(mappedTasks)
    } catch (error) {
      console.error('Erro ao buscar tarefas favoritas:', error)
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
          is_starred: updates.starred,
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

  const handleCreateTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            due_date: newTask.dueDate,
            status: newTask.status,
            is_starred: true, // Automaticamente marca como favorita quando criada nesta página
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error
      
      const task: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        priority: (data.priority || 'medium') as 'high' | 'medium' | 'low',
        status: (data.status || 'pending') as 'pending' | 'in-progress' | 'completed',
        dueDate: data.due_date || '',
        tags: [],
        starred: data.is_starred
      }
      
      setTasks(prev => [task, ...prev])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
    }
  }

  const starredTasks = tasks.filter(task => task.starred)

  return (
    <AppLayout>
      <AppHeader 
        title="Tarefas Favoritas" 
        subtitle="Suas tarefas mais importantes marcadas como favoritas"
      >
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="gradient-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Favoritas
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-auto p-6">

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
      </main>
    </AppLayout>
  )
}

export default Starred