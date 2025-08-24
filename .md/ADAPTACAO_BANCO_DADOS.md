# Adaptação do Banco de Dados Supabase para DashiTask

Este guia explica como adaptar o banco de dados Supabase existente para atender às necessidades da aplicação DashiTask, mantendo as tabelas originais do sistema de comércios intactas.

## Visão Geral da Configuração Atual

O projeto já possui uma conexão configurada com o Supabase:

- **URL**: `https://mcejzxisdjoiddiokyvy.supabase.co`
- **Chave Pública**: Disponível em `src/integrations/supabase/client.ts`
- **Tabelas Existentes**: Sistema de comércios com tabelas como `comercios`, `attusuarios`, `avaliacoes`, etc.

## Estrutura de Tabelas para DashiTask

Vamos adicionar as seguintes tabelas ao banco de dados existente:

```sql
-- Tabela de projetos do DashiTask
create table dashitask_projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.attusuarios(id) not null,
  name text not null,
  description text,
  color text default '#2563eb',
  icon text default 'folder',
  is_archived boolean default false
);

-- Tabela de tarefas do DashiTask
create table dashitask_tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.attusuarios(id) not null,
  project_id uuid references dashitask_projects(id),
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  due_date date,
  completed_at timestamp with time zone,
  is_starred boolean default false,
  position integer default 0
);

-- Tabela de tags do DashiTask
create table dashitask_tags (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.attusuarios(id) not null,
  name text not null,
  color text default '#64748b'
);

-- Tabela de relacionamento entre tarefas e tags do DashiTask
create table dashitask_task_tags (
  task_id uuid references dashitask_tasks(id) on delete cascade,
  tag_id uuid references dashitask_tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- Tabela de atividades das tarefas do DashiTask
create table dashitask_task_activities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  task_id uuid references dashitask_tasks(id) on delete cascade,
  user_id uuid references public.attusuarios(id),
  action text not null check (action in ('created', 'updated', 'deleted', 'completed', 'reopened', 'starred', 'unstarred')),
  field_name text,
  old_value text,
  new_value text
);

-- Índices para melhorar performance
create index dashitask_tasks_user_id_idx on dashitask_tasks (user_id);
create index dashitask_tasks_project_id_idx on dashitask_tasks (project_id);
create index dashitask_tasks_status_idx on dashitask_tasks (status);
create index dashitask_tasks_priority_idx on dashitask_tasks (priority);
create index dashitask_tasks_due_date_idx on dashitask_tasks (due_date);
create index dashitask_tasks_created_at_idx on dashitask_tasks (created_at);
create index dashitask_projects_user_id_idx on dashitask_projects (user_id);
create index dashitask_tags_user_id_idx on dashitask_tags (user_id);
create index dashitask_task_activities_task_id_idx on dashitask_task_activities (task_id);
create index dashitask_task_activities_created_at_idx on dashitask_task_activities (created_at);
```

## Políticas de Segurança (RLS)

```sql
-- Habilitar RLS nas novas tabelas
alter table dashitask_projects enable row level security;
alter table dashitask_tasks enable row level security;
alter table dashitask_tags enable row level security;
alter table dashitask_task_tags enable row level security;
alter table dashitask_task_activities enable row level security;

-- Políticas para a tabela dashitask_projects
create policy "Usuários podem ver seus próprios projetos do DashiTask"
  on dashitask_projects for select
  using ( user_id = auth.uid() );

create policy "Usuários podem inserir seus próprios projetos do DashiTask"
  on dashitask_projects for insert
  with check ( user_id = auth.uid() );

create policy "Usuários podem atualizar seus próprios projetos do DashiTask"
  on dashitask_projects for update
  using ( user_id = auth.uid() );

create policy "Usuários podem deletar seus próprios projetos do DashiTask"
  on dashitask_projects for delete
  using ( user_id = auth.uid() );

-- Políticas para a tabela dashitask_tasks
create policy "Usuários podem ver suas próprias tarefas do DashiTask"
  on dashitask_tasks for select
  using ( user_id = auth.uid() );

create policy "Usuários podem inserir suas próprias tarefas do DashiTask"
  on dashitask_tasks for insert
  with check ( user_id = auth.uid() );

create policy "Usuários podem atualizar suas próprias tarefas do DashiTask"
  on dashitask_tasks for update
  using ( user_id = auth.uid() );

create policy "Usuários podem deletar suas próprias tarefas do DashiTask"
  on dashitask_tasks for delete
  using ( user_id = auth.uid() );

-- Políticas para a tabela dashitask_tags
create policy "Usuários podem ver suas próprias tags do DashiTask"
  on dashitask_tags for select
  using ( user_id = auth.uid() );

create policy "Usuários podem inserir suas próprias tags do DashiTask"
  on dashitask_tags for insert
  with check ( user_id = auth.uid() );

create policy "Usuários podem atualizar suas próprias tags do DashiTask"
  on dashitask_tags for update
  using ( user_id = auth.uid() );

create policy "Usuários podem deletar suas próprias tags do DashiTask"
  on dashitask_tags for delete
  using ( user_id = auth.uid() );

-- Políticas para a tabela dashitask_task_tags
create policy "Usuários podem ver os relacionamentos das suas tarefas do DashiTask"
  on dashitask_task_tags for select
  using ( exists (
    select 1 from dashitask_tasks where dashitask_tasks.id = dashitask_task_tags.task_id and dashitask_tasks.user_id = auth.uid()
  ) );

create policy "Usuários podem inserir relacionamentos nas suas tarefas do DashiTask"
  on dashitask_task_tags for insert
  with check ( exists (
    select 1 from dashitask_tasks where dashitask_tasks.id = dashitask_task_tags.task_id and dashitask_tasks.user_id = auth.uid()
  ) );

create policy "Usuários podem deletar relacionamentos das suas tarefas do DashiTask"
  on dashitask_task_tags for delete
  using ( exists (
    select 1 from dashitask_tasks where dashitask_tasks.id = dashitask_task_tags.task_id and dashitask_tasks.user_id = auth.uid()
  ) );

-- Políticas para a tabela dashitask_task_activities
create policy "Usuários podem ver o histórico das suas tarefas do DashiTask"
  on dashitask_task_activities for select
  using ( exists (
    select 1 from dashitask_tasks where dashitask_tasks.id = dashitask_task_activities.task_id and dashitask_tasks.user_id = auth.uid()
  ) );
```

## Funções e Triggers

```sql
-- Função para atualizar updated_at automaticamente
create or replace function update_dashitask_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Triggers para atualizar updated_at
create trigger update_dashitask_projects_updated_at 
  before update on dashitask_projects 
  for each row execute procedure update_dashitask_updated_at_column();

create trigger update_dashitask_tasks_updated_at 
  before update on dashitask_tasks 
  for each row execute procedure update_dashitask_updated_at_column();

-- Função para registrar atividades das tarefas do DashiTask
create or replace function log_dashitask_task_activity()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into dashitask_task_activities (task_id, user_id, action)
    values (new.id, new.user_id, 'created');
    return new;
    
  elsif (TG_OP = 'UPDATE') then
    -- Registrar mudança de status para concluído
    if old.status != new.status and new.status = 'completed' then
      insert into dashitask_task_activities (task_id, user_id, action, field_name, old_value, new_value)
      values (new.id, new.user_id, 'completed', 'status', old.status, new.status);
      -- Atualizar completed_at
      new.completed_at = timezone('utc'::text, now());
      
    elsif old.status != new.status and old.status = 'completed' then
      insert into dashitask_task_activities (task_id, user_id, action, field_name, old_value, new_value)
      values (new.id, new.user_id, 'reopened', 'status', old.status, new.status);
      -- Limpar completed_at
      new.completed_at = null;
      
    elsif old.is_starred != new.is_starred then
      insert into dashitask_task_activities (task_id, user_id, action)
      values (new.id, new.user_id, 
        case when new.is_starred then 'starred' else 'unstarred' end);
      
    else
      -- Registrar outras atualizações
      insert into dashitask_task_activities (task_id, user_id, action)
      values (new.id, new.user_id, 'updated');
    end if;
    return new;
    
  elsif (TG_OP = 'DELETE') then
    insert into dashitask_task_activities (task_id, user_id, action)
    values (old.id, old.user_id, 'deleted');
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger para registrar atividades das tarefas do DashiTask
create trigger dashitask_task_activity_trigger
  after insert or update or delete on dashitask_tasks
  for each row execute procedure log_dashitask_task_activity();
```

## Atualização dos Tipos TypeScript

Será necessário atualizar o arquivo `src/integrations/supabase/types.ts` para incluir as novas tabelas do DashiTask após executar o SQL. O arquivo é gerado automaticamente, então você pode:

1. Executar o SQL acima no Supabase SQL Editor
2. Usar o Supabase CLI para regenerar os tipos:
   ```bash
   supabase gen types typescript --project-id mcejzxisdjoiddiokyvy > src/integrations/supabase/types.ts
   ```

Ou adicionar manualmente as definições das novas tabelas ao arquivo existente.

## Exemplos de Uso

### Criar uma nova tarefa

```typescript
import { supabase } from '@/integrations/supabase/client';

const createTask = async (taskData: {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: string;
}) => {
  const { data, error } = await supabase
    .from('dashitask_tasks')
    .insert([
      {
        ...taskData,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Buscar tarefas do usuário

```typescript
const getUserTasks = async () => {
  const { data, error } = await supabase
    .from('dashitask_tasks')
    .select(`
      *,
      dashitask_projects(name, color)
    `)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```

### Atualizar status da tarefa

```typescript
const updateTaskStatus = async (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
  const { data, error } = await supabase
    .from('dashitask_tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## Considerações Finais

1. **Mantendo Dados Existentes**: Esta abordagem mantém intactas todas as tabelas e dados do sistema de comércios existente.

2. **Prefixo de Tabelas**: Usamos o prefixo `dashitask_` para evitar conflitos com as tabelas existentes.

3. **Integração com Autenticação**: As novas tabelas estão ligadas à tabela `attusuarios` existente, garantindo que os usuários existentes possam usar o DashiTask sem criar novas contas.

4. **Segurança**: As políticas RLS garantem que usuários só possam acessar seus próprios dados do DashiTask.

5. **Performance**: Índices apropriados foram adicionados para melhorar o desempenho das consultas mais comuns.

Este esquema permite que o DashiTask coexista com o sistema de comércios existente no mesmo banco de dados Supabase.