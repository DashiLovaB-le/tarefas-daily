
-- Criar tabelas do DashiTask usando o prefixo para evitar conflitos com as tabelas existentes

-- Tabela de projetos do DashiTask
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES public.attusuarios(id) NOT NULL,
  name text NOT NULL,
  description text,
  color text DEFAULT '#2563eb',
  icon text DEFAULT 'folder',
  is_archived boolean DEFAULT false
);

-- Tabela de tarefas do DashiTask
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES public.attusuarios(id) NOT NULL,
  project_id uuid REFERENCES public.projects(id),
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  due_date date,
  completed_at timestamp with time zone,
  is_starred boolean DEFAULT false,
  position integer DEFAULT 0
);

-- Tabela de tags do DashiTask
CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES public.attusuarios(id) NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#64748b'
);

-- Tabela de relacionamento entre tarefas e tags
CREATE TABLE public.task_tags (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Tabela de atividades das tarefas
CREATE TABLE public.task_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.attusuarios(id),
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'completed', 'reopened', 'starred', 'unstarred')),
  field_name text,
  old_value text,
  new_value text
);

-- Índices para melhorar performance
CREATE INDEX tasks_user_id_idx ON tasks (user_id);
CREATE INDEX tasks_project_id_idx ON tasks (project_id);
CREATE INDEX tasks_status_idx ON tasks (status);
CREATE INDEX tasks_priority_idx ON tasks (priority);
CREATE INDEX tasks_due_date_idx ON tasks (due_date);
CREATE INDEX tasks_created_at_idx ON tasks (created_at);
CREATE INDEX projects_user_id_idx ON projects (user_id);
CREATE INDEX tags_user_id_idx ON tags (user_id);
CREATE INDEX task_activities_task_id_idx ON task_activities (task_id);
CREATE INDEX task_activities_created_at_idx ON task_activities (created_at);

-- Habilitar RLS nas novas tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projetos
CREATE POLICY "Usuários podem ver seus próprios projetos"
  ON projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir seus próprios projetos"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios projetos"
  ON projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus próprios projetos"
  ON projects FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para tarefas
CREATE POLICY "Usuários podem ver suas próprias tarefas"
  ON tasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias tarefas"
  ON tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
  ON tasks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas próprias tarefas"
  ON tasks FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para tags
CREATE POLICY "Usuários podem ver suas próprias tags"
  ON tags FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias tags"
  ON tags FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias tags"
  ON tags FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas próprias tags"
  ON tags FOR DELETE
  USING (user_id = auth.uid());

-- Políticas RLS para task_tags
CREATE POLICY "Usuários podem ver os relacionamentos das suas tarefas"
  ON task_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem inserir relacionamentos nas suas tarefas"
  ON task_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar relacionamentos das suas tarefas"
  ON task_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()
  ));

-- Políticas RLS para task_activities
CREATE POLICY "Usuários podem ver o histórico das suas tarefas"
  ON task_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks WHERE tasks.id = task_activities.task_id AND tasks.user_id = auth.uid()
  ));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para registrar atividades das tarefas
CREATE TRIGGER task_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE log_task_activity();
