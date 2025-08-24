# Guia de Deploy PWA - DashiTask

Este documento contém as instruções completas para configurar e testar o deploy automático do PWA DashiTask.

## 📋 Pré-requisitos

- [ ] Repositório no GitHub
- [ ] Conta GitHub com permissões de administrador no repositório
- [ ] Node.js 18+ instalado localmente
- [ ] Todas as funcionalidades PWA implementadas

## 🚀 Configuração do GitHub Pages

### 1. Habilitar GitHub Pages

1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. Salve as configurações

### 2. Verificar Workflow

O arquivo `.github/workflows/deploy.yml` já está configurado com:

```yaml
name: Deploy PWA

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Create version file
      run: |
        echo "{
          \"version\": \"$(date +%s)\",
          \"buildDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
          \"buildNumber\": \"$(echo $GITHUB_SHA | cut -c1-7)\"
        }" > dist/version.json
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🔧 Configuração do Vite para Produção

Verifique se o `vite.config.ts` está configurado corretamente:

```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/nome-do-repositorio/' : '/',
  // ... resto da configuração
}));
```

**⚠️ IMPORTANTE**: Substitua `/nome-do-repositorio/` pelo nome real do seu repositório.

## 📱 Verificação dos Arquivos PWA

### Manifest.json
Verifique se o arquivo `public/manifest.json` existe e está configurado:

```json
{
  "short_name": "DashiTask",
  "name": "DashiTask - Controle de Tarefas",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icons/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#0f172a",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#2563eb"
}
```

### Service Worker
Verifique se o arquivo `public/sw.js` existe e está registrado no `src/main.tsx`.

### Ícones PWA
Certifique-se de que os ícones estão na pasta `public/icons/`:
- `icon-16.png` (16x16)
- `icon-32.png` (32x32)
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `maskable-icon-192.png` (192x192, maskable)

## 🧪 Testes Locais

### 1. Teste de Build
```bash
npm run build
npm run preview
```

### 2. Teste do Service Worker
1. Abra as DevTools (F12)
2. Vá para **Application** > **Service Workers**
3. Verifique se o SW está registrado e ativo

### 3. Teste do Manifest
1. Nas DevTools, vá para **Application** > **Manifest**
2. Verifique se todas as informações estão corretas
3. Teste o botão "Add to homescreen" se disponível

### 4. Teste de Cache
1. Nas DevTools, vá para **Application** > **Storage** > **Cache Storage**
2. Verifique se os caches estão sendo criados
3. Teste o funcionamento offline (Network > Offline)

### 5. Teste de Lighthouse
1. Nas DevTools, vá para **Lighthouse**
2. Execute auditoria PWA
3. Verifique se a pontuação está acima de 90

## 🚀 Deploy para Produção

### 1. Primeiro Deploy
```bash
git add .
git commit -m "feat: implementação completa do PWA"
git push origin main
```

### 2. Verificar Deploy
1. Vá para **Actions** no GitHub
2. Acompanhe o progresso do workflow
3. Verifique se não há erros

### 3. Testar Aplicação
1. Acesse `https://seu-usuario.github.io/nome-do-repositorio/`
2. Teste todas as funcionalidades PWA
3. Verifique se o sistema de atualização funciona

## 🔍 Checklist de Validação

### Funcionalidades Básicas
- [ ] Aplicação carrega corretamente
- [ ] Interface responsiva funciona
- [ ] Navegação entre páginas funciona
- [ ] Dados são salvos e carregados

### Funcionalidades PWA
- [ ] Prompt de instalação aparece
- [ ] Aplicação pode ser instalada
- [ ] Funciona offline (cache)
- [ ] Service Worker está ativo
- [ ] Notificações funcionam (se implementadas)
- [ ] Compartilhamento funciona
- [ ] Sistema de atualização funciona

### Performance
- [ ] Lighthouse PWA score > 90
- [ ] Tempo de carregamento < 3s
- [ ] Cache hit rate > 70%
- [ ] Funciona em conexões lentas

### Compatibilidade
- [ ] Chrome (desktop e mobile)
- [ ] Firefox (desktop e mobile)
- [ ] Safari (desktop e mobile)
- [ ] Edge (desktop)

## 🐛 Troubleshooting

### Problema: Deploy falha
**Solução**: 
1. Verifique os logs no GitHub Actions
2. Certifique-se de que `npm ci` e `npm run build` funcionam localmente
3. Verifique se todas as dependências estão no `package.json`

### Problema: PWA não instala
**Solução**:
1. Verifique se o manifest.json está acessível
2. Certifique-se de que está servindo via HTTPS
3. Verifique se o Service Worker está registrado

### Problema: Cache não funciona
**Solução**:
1. Verifique se o Service Worker está ativo
2. Limpe o cache do navegador
3. Verifique os logs do Service Worker

### Problema: Atualização não funciona
**Solução**:
1. Verifique se o `version.json` está sendo gerado
2. Certifique-se de que o VersionChecker está inicializado
3. Verifique se não há cache agressivo no `version.json`

## 📊 Monitoramento

### Métricas a Acompanhar
- Taxa de instalação do PWA
- Taxa de retenção de usuários
- Performance de carregamento
- Taxa de sucesso do cache
- Erros do Service Worker

### Ferramentas Recomendadas
- Google Analytics (para uso geral)
- Lighthouse CI (para performance)
- PWA Builder (para validação)
- Chrome DevTools (para debugging)

## 🔄 Atualizações Futuras

### Para Atualizar a Aplicação
1. Faça as alterações necessárias
2. Commit e push para o branch main
3. O GitHub Actions fará o deploy automaticamente
4. Os usuários receberão notificação de atualização

### Versionamento
- O sistema usa timestamp como versão
- Cada build gera um novo `version.json`
- Usuários são notificados automaticamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique este guia primeiro
2. Consulte os logs do GitHub Actions
3. Use as DevTools para debugging
4. Verifique a documentação do PWA

---

**✅ Parabéns!** Se todos os itens do checklist estão marcados, seu PWA está pronto para produção!