import { useState } from "react"
import { Folder, Plus, User, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  
  const [projects] = useState<Project[]>([
    { id: "personal", name: "Pessoal", icon: User, color: "bg-blue-500", taskCount: 12 },
    { id: "work", name: "Trabalho", icon: Folder, color: "bg-purple-500", taskCount: 8 },
    { id: "shopping", name: "Compras", icon: Archive, color: "bg-green-500", taskCount: 3 }
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Organizar documentos",
      description: "Digitalizar e organizar documentos importantes",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["organização", "documentos"],
      project: "personal"
    },
    {
      id: "2",
      title: "Reunião de equipe",
      description: "Planejamento sprint próxima semana",
      priority: "high",
      status: "pending",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ["reunião", "planejamento"],
      project: "work"
    },
    {
      id: "3",
      title: "Comprar mantimentos",
      description: "Lista da semana para o supermercado",
      priority: "low",
      status: "pending",
      dueDate: new Date().toISOString().split('T')[0],
      tags: ["supermercado", "lista"],
      project: "shopping"
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
      project: selectedProject || undefined
    }
    setTasks(prev => [task, ...prev])
    setIsModalOpen(false)
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