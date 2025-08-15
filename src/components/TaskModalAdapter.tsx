import TaskModal from "./tasks/TaskModal"

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  tags: string[]
  project?: string
  assignee?: string
}

interface TaskModalAdapterProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id'>) => void
  initialData?: Partial<Task>
  mode?: "create" | "edit"
}

const TaskModalAdapter = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: TaskModalAdapterProps) => {
  
  const handleSave = (taskData: any) => {
    const task: Omit<Task, 'id'> = {
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority,
      status: 'pending',
      dueDate: taskData.dueDate,
      tags: taskData.tags || [],
      project: taskData.project || "",
      assignee: taskData.assignee || ""
    }
    onSubmit(task)
  }

  return (
    <TaskModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      initialData={initialData}
      mode={mode}
    />
  )
}

export default TaskModalAdapter