// Script para testar a conexão e verificar as tabelas do DashiTask
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mcejzxisdjoiddiokyvy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZWp6eGlzZGpvaWRkaW9reXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTE1MTcsImV4cCI6MjA2MjIyNzUxN30.qEg30Jk6NeRpmSl4wvMSNYYHqtm0Xya1ZBEam0_yM74";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testDatabase() {
  console.log('🔍 Verificando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('attusuarios')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    
    // Verificar se as novas tabelas existem
    const tablesToCheck = ['projects', 'tasks', 'tags', 'task_tags', 'task_activities'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Tabela '${table}' não encontrada ou erro:`, error.message);
        } else {
          console.log(`✅ Tabela '${table}' existe e está acessível`);
        }
      } catch (err) {
        console.error(`❌ Erro ao verificar tabela '${table}':`, err.message);
      }
    }
    
    // Verificar estrutura da tabela tasks (principal)
    console.log('\n🔍 Verificando estrutura da tabela tasks...');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(0); // Só queremos a estrutura, não os dados
    
    if (!tasksError) {
      console.log('✅ Estrutura da tabela tasks verificada com sucesso');
    }
    
    // Verificar se as políticas RLS estão ativas
    console.log('\n🔒 Testando políticas de segurança...');
    
    // Tentar inserir sem autenticação (deve falhar)
    const { data: insertTest, error: insertError } = await supabase
      .from('projects')
      .insert([{
        name: 'Teste',
        user_id: '00000000-0000-0000-0000-000000000000'
      }]);
    
    if (insertError && insertError.message.includes('RLS')) {
      console.log('✅ Políticas RLS estão ativas (inserção bloqueada sem autenticação)');
    } else if (insertError) {
      console.log('⚠️ RLS pode estar ativo:', insertError.message);
    } else {
      console.log('⚠️ Atenção: Inserção permitida sem autenticação - verificar RLS');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDatabase();