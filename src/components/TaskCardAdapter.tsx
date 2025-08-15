import TaskCard from "./tasks/TaskCard"

interface Task {
  id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  tags: string[]
  project?: string
  assignee?: string
  starred?: boolean
}

interface TaskCardAdapterProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

const TaskCardAdapter = ({ task, onUpdate, onDelete }: TaskCardAdapterProps) => {
  const handleToggleComplete = (id: string) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    onUpdate(id, { status: newStatus })
  }

  const handleToggleStar = (id: string) => {
    onUpdate(id, { starred: !task.starred })
  }

  const handleEdit = (id: string) => {
    // TODO: Implementar edição via modal
    console.log("Edit task:", id)
  }

  const handleDelete = (id: string) => {
    onDelete(id)
  }

  return (
    <TaskCard
      id={task.id}
      title={task.title}
      description={task.description}
      priority={task.priority}
      dueDate={task.dueDate}
      isCompleted={task.status === 'completed'}
      isStarred={task.starred || false}
      assignee={task.assignee}
      project={task.project}
      onToggleComplete={handleToggleComplete}
      onToggleStar={handleToggleStar}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}

export default TaskCardAdapter