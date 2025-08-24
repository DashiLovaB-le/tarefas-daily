import { useState, useEffect } from "react"
import { Folder, Plus, User, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  project?: string
}

interface Project {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  taskCount: number
}

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectsAndTasks()
  }, [])

  const fetchProjectsAndTasks = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }

      // Buscar projetos
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Buscar tarefas com projetos
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_tags (
            tags (
              name
            )
          ),
          projects (
            name
          )
        `)
        .eq('user_id', user.id)
        .not('project_id', 'is', null)
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      // Mapear projetos
      const mappedProjects = (projectsData || []).map(project => ({
        id: project.id,
        name: project.name,
        icon: getProjectIcon(project.icon),
        color: project.color || 'bg-blue-500',
        taskCount: 0 // Será calculado depois
      }))

      // Mapear tarefas
      const mappedTasks = (tasksData || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: (task.priority || 'medium') as 'high' | 'medium' | 'low',
        status: (task.status || 'pending') as 'pending' | 'in-progress' | 'completed',
        dueDate: task.due_date || '',
        tags: task.task_tags?.map((tt: any) => tt.tags?.name).filter(Boolean) || [],
        project: task.project_id
      }))

      // Calcular contagem de tarefas por projeto
      const projectsWithCount = mappedProjects.map(project => ({
        ...project,
        taskCount: mappedTasks.filter(task => task.project === project.id).length
      }))

      setProjects(projectsWithCount)
      setTasks(mappedTasks)
    } catch (error) {
      console.error('Erro ao buscar projetos e tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProjectIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'User': return User
      case 'Archive': return Archive
      default: return Folder
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
            project_id: selectedProject || null,
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
        project: data.project_id
      }
      
      setTasks(prev => [task, ...prev])
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
    }
  }

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.project === projectId)
  }

  return (
    <AppLayout>
      <AppHeader 
        title="Projetos" 
        subtitle="Organize suas tarefas por projetos e categorias"
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => {
            const Icon = project.icon
            const projectTasks = getProjectTasks(project.id)
            const completedTasks = projectTasks.filter(t => t.status === 'completed')
            
            return (
              <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {projectTasks.length} tarefa{projectTasks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">
                      {projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-success">
                      {completedTasks.length} concluída{completedTasks.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-warning">
                      {projectTasks.length - completedTasks.length} pendente{(projectTasks.length - completedTasks.length) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Project Tasks */}
        {projects.map((project) => {
          const projectTasks = getProjectTasks(project.id)
          if (projectTasks.length === 0) return null

          const Icon = project.icon
          
          return (
            <div key={project.id} className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-lg ${project.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{project.name}</h2>
                <Badge variant="secondary" className="ml-2">
                  {projectTasks.length} tarefa{projectTasks.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {projectTasks.map((task) => (
                  <TaskCardAdapter
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {tasks.filter(t => t.project).length === 0 && (
          <Card className="p-12 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma tarefa em projetos
            </h3>
            <p className="text-muted-foreground">
              Adicione tarefas aos seus projetos para organizá-las melhor!
            </p>
          </Card>
        )}

        <TaskModalAdapter
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      </main>
    </AppLayout>
  )
}

export default Projects