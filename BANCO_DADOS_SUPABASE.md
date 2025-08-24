# Configuração do Banco de Dados com Supabase para DashiTask

Este guia detalha as tabelas adicionais necessárias para a aplicação DashiTask no banco Supabase existente, mantendo as tabelas originais do sistema de comércios intactas.

## Estrutura Geral do Banco de Dados

### Tabelas Existentes (NÃO ALTERAR)
- **attusuarios** - Sistema de usuários existente
- **comercios** - Estabelecimentos comerciais
- **avaliacoes** - Avaliações dos comércios
- **favoritos** - Favoritos dos usuários
- **notificacoes** - Sistema de notificações
- **promocoes** - Promoções dos comércios
- **historico_buscas** - Histórico de buscas
- **admin_logs** - Logs administrativos
- **mass_notifications** - Notificações em massa
- **platform_settings** - Configurações da plataforma

### Novas Tabelas para DashiTask

1. **projects** - Categorias/Projetos para organizar tarefas
2. **tasks** - Tarefas principais da aplicação
3. **tags** - Etiquetas para classificação de tarefas
4. **task_tags** - Tabela de relacionamento entre tarefas e tags
5. **task_activities** - Histórico de atividades das tarefas

## Esquema SQL para Novas Tabelas

```sql
-- Tabela de projetos (usa attusuarios existente)
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references attusuarios(id) not null,
  name text not null,
  description text,
  color text default '#2563eb',
  icon text default 'folder',
  is_archived boolean default false
);

-- Tabela de tarefas (usa attusuarios existente)
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references attusuarios(id) not null,
  project_id uuid references projects(id),
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  due_date date,
  completed_at timestamp with time zone,
  is_starred boolean default false,
  position integer default 0
);

-- Tabela de tags (usa attusuarios existente)
create table tags (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references attusuarios(id) not null,
  name text not null,
  color text default '#64748b'
);

-- Tabela de relacionamento entre tarefas e tags
create table task_tags (
  task_id uuid references tasks(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- Tabela de atividades das tarefas
create table task_activities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references attusuarios(id),
  action text not null check (action in ('created', 'updated', 'deleted', 'completed', 'reopened', 'starred', 'unstarred')),
  field_name text,
  old_value text,
  new_value text
);

-- Índices para melhorar performance
create index tasks_user_id_idx on tasks (user_id);
create index tasks_project_id_idx on tasks (project_id);
create index tasks_status_idx on tasks (status);
create index tasks_priority_idx on tasks (priority);
create index tasks_due_date_idx on tasks (due_date);
create index tasks_created_at_idx on tasks (created_at);
create index projects_user_id_idx on projects (user_id);
create index tags_user_id_idx on tags (user_id);
create index task_activities_task_id_idx on task_activities (task_id);
create index task_activities_created_at_idx on task_activities (created_at);
```

## Políticas de Segurança (RLS - Row Level Security)

```sql
-- Habilitar RLS nas novas tabelas
alter table projects enable row level security;
alter table tasks enable row level security;
alter table tags enable row level security;
alter table task_tags enable row level security;
alter table task_activities enable row level security;

-- Políticas para a tabela projects
create policy "Usuários podem ver seus próprios projetos"
  on projects for select
  using ( user_id::text = auth.uid()::text );

create policy "Usuários podem inserir seus próprios projetos"
  on projects for insert
  with check ( user_id::text = auth.uid()::text );

create policy "Usuários podem atualizar seus próprios projetos"
  on projects for update
  using ( user_id::text = auth.uid()::text );

create policy "Usuários podem deletar seus próprios projetos"
  on projects for delete
  using ( user_id::text = auth.uid()::text );

-- Políticas para a tabela tasks
create policy "Usuários podem ver suas próprias tarefas"
  on tasks for select
  using ( user_id::text = auth.uid()::text );

create policy "Usuários podem inserir suas próprias tarefas"
  on tasks for insert
  with check ( user_id::text = auth.uid()::text );

create policy "Usuários podem atualizar suas próprias tarefas"
  on tasks for update
  using ( user_id::text = auth.uid()::text );

create policy "Usuários podem deletar suas próprias tarefas"
  on tasks for delete
  using ( user_id::text = auth.uid()::text );

-- Políticas para a tabela tags
create policy "Usuários podem ver suas próprias tags"
  on tags for select
  using ( user_id::text = auth.uid()::text );

create policy "Usuários podem inserir suas próprias tags"
  on tags for insert
  with check ( user_id::text = auth.uid()::text );

create policy "Usuários podem atualizar suas próprias tags"
  on tags for update
  using ( user_id::text = auth.uid()::text );

create policy "Usuários podem deletar suas próprias tags"
  on tags for delete
  using ( user_id::text = auth.uid()::text );

-- Políticas para a tabela task_tags
create policy "Usuários podem ver os relacionamentos das suas tarefas"
  on task_tags for select
  using ( exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id::text = auth.uid()::text
  ) );

create policy "Usuários podem inserir relacionamentos nas suas tarefas"
  on task_tags for insert
  with check ( exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id::text = auth.uid()::text
  ) );

create policy "Usuários podem deletar relacionamentos das suas tarefas"
  on task_tags for delete
  using ( exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id::text = auth.uid()::text
  ) );

-- Políticas para a tabela task_activities
create policy "Usuários podem ver o histórico das suas tarefas"
  on task_activities for select
  using ( exists (
    select 1 from tasks where tasks.id = task_activities.task_id and tasks.user_id::text = auth.uid()::text
  ) );
```

## Funções e Triggers

```sql
-- Função para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Triggers para atualizar updated_at nas novas tabelas
create trigger update_projects_updated_at 
  before update on projects 
  for each row execute procedure update_updated_at_column();

create trigger update_tasks_updated_at 
  before update on tasks 
  for each row execute procedure update_updated_at_column();

-- Função para registrar atividades das tarefas
create or replace function log_task_activity()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into task_activities (task_id, user_id, action)
    values (new.id, new.user_id, 'created');
    return new;
    
  elsif (TG_OP = 'UPDATE') then
    -- Registrar mudança de status para concluído
    if old.status != new.status and new.status = 'completed' then
      insert into task_activities (task_id, user_id, action, field_name, old_value, new_value)
      values (new.id, new.user_id, 'completed', 'status', old.status, new.status);
      -- Atualizar completed_at
      new.completed_at = timezone('utc'::text, now());
      
    elsif old.status != new.status and old.status = 'completed' then
      insert into task_activities (task_id, user_id, action, field_name, old_value, new_value)
      values (new.id, new.user_id, 'reopened', 'status', old.status, new.status);
      -- Limpar completed_at
      new.completed_at = null;
      
    elsif old.is_starred != new.is_starred then
      insert into task_activities (task_id, user_id, action)
      values (new.id, new.user_id, 
        case when new.is_starred then 'starred' else 'unstarred' end);
      
    else
      -- Registrar outras atualizações
      insert into task_activities (task_id, user_id, action)
      values (new.id, new.user_id, 'updated');
    end if;
    return new;
    
  elsif (TG_OP = 'DELETE') then
    insert into task_activities (task_id, user_id, action)
    values (old.id, old.user_id, 'deleted');
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger para registrar atividades
create trigger task_activity_trigger
  after insert or update or delete on tasks
  for each row execute procedure log_task_activity();
```

## Configuração do Supabase

### 1. Projeto Existente

O projeto Supabase já está configurado com:
- **URL**: https://mcejzxisdjoiddiokyvy.supabase.co
- **Project ID**: mcejzxisdjoiddiokyvy
- **Tabelas do sistema de comércios** já existentes

### 2. Adicionar Tabelas do DashiTask

1. No painel do projeto, vá para "SQL Editor"
2. Execute o script SQL acima em partes:
   - Primeiro crie as novas tabelas (projects, tasks, tags, task_tags, task_activities)
   - Depois adicione os índices
   - Em seguida configure as políticas RLS
   - Por último crie as funções e triggers

### 3. Verificar Autenticação

A autenticação já está configurada no sistema existente. Certifique-se de que:
- O sistema de usuários (attusuarios) está funcionando
- As políticas RLS estão ativas
- Os usuários podem se autenticar normalmente

## Conexão com a Aplicação

### Cliente Supabase Existente

O cliente já está configurado em `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mcejzxisdjoiddiokyvy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Atualizar Types

Será necessário atualizar o arquivo `src/integrations/supabase/types.ts` para incluir as novas tabelas do DashiTask após executar o SQL.

## Boas Práticas de Uso

### 1. Consultas Otimizadas

```sql
-- Exemplo de consulta otimizada para tarefas do usuário
select 
  t.id,
  t.title,
  t.description,
  t.priority,
  t.status,
  t.due_date,
  t.is_starred,
  t.completed_at,
  p.name as project_name,
  p.color as project_color
from tasks t
left join projects p on t.project_id = p.id
where t.user_id = auth.uid()
order by t.created_at desc
limit 50;
```

### 2. Paginação

```typescript
// Implementar paginação para grandes conjuntos de dados
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .range(0, 19) // Primeira página com 20 itens
```

### 3. Integração com Sistema Existente

```typescript
// Exemplo de consulta que usa a tabela attusuarios existente
const { data: userTasks, error } = await supabase
  .from('tasks')
  .select(`
    *,
    attusuarios:user_id (
      nome,
      email
    ),
    projects (
      name,
      color
    )
  `)
  .eq('user_id', userId)
```

### 4. Tratamento de Erros

```typescript
try {
  const { data, error } = await supabase
    .from('tasks')
    .insert([newTask])
    
  if (error) throw error
  
  console.log('Tarefa criada com sucesso:', data)
} catch (error) {
  console.error('Erro ao criar tarefa:', error.message)
  // Tratar erro apropriadamente na UI
}
```

## Considerações Finais

1. **Compatibilidade**: As novas tabelas são totalmente compatíveis com o sistema existente
2. **Segurança**: As políticas RLS garantem que usuários só possam acessar seus próprios dados de tarefas
3. **Performance**: Índices apropriados melhoram significativamente o desempenho das consultas
4. **Auditoria**: O histórico de atividades permite rastrear mudanças nas tarefas
5. **Escalabilidade**: A estrutura suporta crescimento do número de usuários e dados
6. **Integração**: Usa a tabela `attusuarios` existente, mantendo consistência com o sistema atual
7. **Manutenção**: Funções e triggers automatizam tarefas repetitivas

### Próximos Passos

1. Execute o SQL no Supabase SQL Editor
2. Atualize os types TypeScript
3. Implemente as funcionalidades do DashiTask
4. Teste a integração com o sistema de usuários existente

Esta estrutura fornece uma base sólida para a aplicação DashiTask integrada ao sistema de comércios existente, sem conflitos ou alterações nas tabelas originais.