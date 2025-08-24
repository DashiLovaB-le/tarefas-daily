# Dados Mock no Projeto DashiTask e Transição para Dados Reais

Este documento detalha onde estão os dados mockados no projeto DashiTask e fornece orientações precisas sobre como substituí-los por dados reais do banco de dados Supabase.

## Localização dos Dados Mock

### 1. Dashboard.tsx
**Caminho:** `src/pages/Dashboard.tsx`

**Dados Mock:**
- Array `mockTasks` com 3 tarefas de exemplo
- Estado inicial: `useState(mockTasks)`

**Trecho relevante:**
```typescript
// Mock data - será substituído por dados do Supabase
const mockTasks = [
  {
    id: "1",
    title: "Finalizar apresentação do projeto",
    description: "Preparar slides e ensaiar apresentação para o cliente",
    priority: "high" as const,
    dueDate: "2024-01-20",
    isCompleted: false,
    isStarred: true,
    assignee: "João Silva",
    project: "Trabalho"
  },
  // ... outras tarefas
]

const [tasks, setTasks] = useState(mockTasks)
```

### 2. Today.tsx
**Caminho:** `src/pages/Today.tsx`

**Dados Mock:**
- Array de tarefas no `useState` com 2 tarefas para hoje

**Trecho relevante:**
```typescript
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
  // ... outra tarefa
])
```

### 3. Upcoming.tsx
**Caminho:** `src/pages/Upcoming.tsx`

**Dados Mock:**
- Array de tarefas no `useState` com 3 tarefas futuras

**Trecho relevante:**
```typescript
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
  // ... outras tarefas
])
```

### 4. Starred.tsx
**Caminho:** `src/pages/Starred.tsx`

**Dados Mock:**
- Array de tarefas no `useState` com 2 tarefas favoritas

**Trecho relevante:**
```typescript
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
  // ... outra tarefa
])
```

### 5. Completed.tsx
**Caminho:** `src/pages/Completed.tsx`

**Dados Mock:**
- Array de tarefas no `useState` com 3 tarefas concluídas

**Trecho relevante:**
```typescript
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
  // ... outras tarefas
])
```

### 6. Projects.tsx
**Caminho:** `src/pages/Projects.tsx`

**Dados Mock:**
- Array de projetos no `useState` com 3 projetos
- Array de tarefas no `useState` com 3 tarefas associadas a projetos

**Trecho relevante:**
```typescript
const [projects] = useState<Project[]>([
  { id: "personal", name: "Pessoal", icon: User, color: "bg-blue-500", taskCount: 12 },
  // ... outros projetos
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
  // ... outras tarefas
])
```

### 7. Settings.tsx
**Caminho:** `src/pages/Settings.tsx`

**Dados Mock:**
- Objeto de configurações no `useState` com dados de usuário fictício

**Trecho relevante:**
```typescript
const [settings, setSettings] = useState<UserSettings>({
  name: "João Silva",
  email: "joao.silva@email.com",
  avatar: "",
  notifications: {
    email: true,
    push: false,
    daily: true,
    weekly: true
  },
  theme: 'light',
  language: 'pt-BR'
})
```

## Substituição por Dados Reais do Supabase

### 1. Configuração Inicial

Certifique-se de que o cliente Supabase está importado:
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### 2. Dashboard.tsx - Substituição

**Antes:**
```typescript
const mockTasks = [...];
const [tasks, setTasks] = useState(mockTasks);
```

**Depois:**
```typescript
const [tasks, setTasks] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchTasks();
}, []);

const fetchTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('dashitask_tasks')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTasks(data || []);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
  } finally {
    setLoading(false);
  }
};

// Atualizar handlers para usar Supabase
const handleToggleComplete = async (id: string) => {
  try {
    const task = tasks.find(t => t.id === id);
    const { error } = await supabase
      .from('dashitask_tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, is_completed: !task.is_completed } : task
    ));
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
  }
};
```

### 3. Today.tsx - Substituição

**Antes:**
```typescript
const [tasks, setTasks] = useState<Task[]>([...]);
```

**Depois:**
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchTodayTasks();
}, []);

const fetchTodayTasks = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('dashitask_tasks')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('due_date', today);

    if (error) throw error;
    setTasks(data || []);
  } catch (error) {
    console.error('Erro ao buscar tarefas de hoje:', error);
  } finally {
    setLoading(false);
  }
};
```

### 4. Estratégia Geral de Substituição

Para todas as páginas, siga este padrão:

1. **Remover dados mockados** do `useState`
2. **Adicionar estado de carregamento** (`loading`)
3. **Usar useEffect** para buscar dados ao montar o componente
4. **Atualizar funções de manipulação** para usar Supabase
5. **Adicionar tratamento de erros** adequado
6. **Implementar Realtime** (opcional) para atualizações em tempo real

### 5. Exemplo de Função de Criação com Supabase

```typescript
const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('dashitask_tasks')
      .insert([
        {
          ...taskData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    // Atualizar estado local
    setTasks(prev => [data, ...prev]);
    setIsModalOpen(false);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
  }
};
```

### 6. Exemplo de Função de Atualização com Supabase

```typescript
const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase
      .from('dashitask_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();

    if (error) throw error;
    
    // Atualizar estado local
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...data } : task
    ));
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
  }
};
```

### 7. Exemplo de Função de Exclusão com Supabase

```typescript
const handleTaskDelete = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('dashitask_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    
    // Atualizar estado local
    setTasks(prev => prev.filter(task => task.id !== taskId));
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
  }
};
```

### 8. Adicionando Realtime (Opcional)

Para atualizações em tempo real:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dashitask_tasks',
      },
      (payload) => {
        setTasks(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 9. Considerações Finais

1. **Autenticação**: Sempre verifique se o usuário está autenticado antes de fazer operações
2. **Tratamento de Erros**: Implemente tratamento adequado para todos os casos de erro
3. **Performance**: Use paginação para grandes conjuntos de dados
4. **Cache**: Considere implementar estratégias de cache para melhorar a experiência do usuário
5. **Testes**: Teste todas as operações CRUD após a migração

Com estas alterações, o projeto deixará de usar dados mockados e passará a utilizar dados reais do banco de dados Supabase, proporcionando uma experiência mais realista e funcional para os usuários.