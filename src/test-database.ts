// Script para testar as tabelas do DashiTask
import { supabase } from './integrations/supabase/client';

export async function testDashiTaskTables() {
  console.log('🔍 Verificando tabelas do DashiTask...');
  
  try {
    // Verificar se as novas tabelas existem
    const tablesToCheck = ['projects', 'tasks', 'tags', 'task_tags', 'task_activities'];
    const results = [];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results.push({ table, status: 'error', message: error.message });
        } else {
          results.push({ table, status: 'success', message: 'Tabela acessível' });
        }
      } catch (err) {
        results.push({ table, status: 'error', message: err.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return [];
  }
}

// Função para testar inserção de dados de exemplo
export async function testDataInsertion() {
  console.log('🧪 Testando inserção de dados...');
  
  try {
    // Primeiro, vamos verificar se existe algum usuário na tabela attusuarios
    const { data: users, error: usersError } = await supabase
      .from('attusuarios')
      .select('id')
      .limit(1);
    
    if (usersError) {
      return { success: false, message: 'Erro ao acessar tabela de usuários: ' + usersError.message };
    }
    
    if (!users || users.length === 0) {
      return { success: false, message: 'Nenhum usuário encontrado na tabela attusuarios' };
    }
    
    const userId = users[0].id;
    
    // Testar inserção de projeto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        name: 'Projeto Teste',
        description: 'Projeto de teste para verificar funcionamento',
        user_id: userId,
        color: '#2563eb'
      }])
      .select()
      .single();
    
    if (projectError) {
      return { success: false, message: 'Erro ao inserir projeto: ' + projectError.message };
    }
    
    // Testar inserção de tarefa
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        title: 'Tarefa Teste',
        description: 'Tarefa de teste para verificar funcionamento',
        user_id: userId,
        project_id: project.id,
        priority: 'medium',
        status: 'pending'
      }])
      .select()
      .single();
    
    if (taskError) {
      // Limpar projeto criado
      await supabase.from('projects').delete().eq('id', project.id);
      return { success: false, message: 'Erro ao inserir tarefa: ' + taskError.message };
    }
    
    // Testar inserção de tag
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert([{
        name: 'teste',
        color: '#64748b',
        user_id: userId
      }])
      .select()
      .single();
    
    if (tagError) {
      // Limpar dados criados
      await supabase.from('tasks').delete().eq('id', task.id);
      await supabase.from('projects').delete().eq('id', project.id);
      return { success: false, message: 'Erro ao inserir tag: ' + tagError.message };
    }
    
    // Testar relacionamento task_tags
    const { error: relationError } = await supabase
      .from('task_tags')
      .insert([{
        task_id: task.id,
        tag_id: tag.id
      }]);
    
    if (relationError) {
      // Limpar dados criados
      await supabase.from('tags').delete().eq('id', tag.id);
      await supabase.from('tasks').delete().eq('id', task.id);
      await supabase.from('projects').delete().eq('id', project.id);
      return { success: false, message: 'Erro ao criar relacionamento: ' + relationError.message };
    }
    
    // Limpar dados de teste
    await supabase.from('task_tags').delete().eq('task_id', task.id);
    await supabase.from('tags').delete().eq('id', tag.id);
    await supabase.from('tasks').delete().eq('id', task.id);
    await supabase.from('projects').delete().eq('id', project.id);
    
    return { 
      success: true, 
      message: 'Todos os testes de inserção passaram com sucesso!',
      data: { project, task, tag }
    };
    
  } catch (error) {
    return { success: false, message: 'Erro geral: ' + error.message };
  }
}