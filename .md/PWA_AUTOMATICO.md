# Transformação em PWA de Alta Qualidade com Atualização Automática

Este guia detalha como transformar sua aplicação em um PWA (Progressive Web App) de alta qualidade com atualização automática via GitHub.

## Fase 1: Configuração do Manifest e Ícones

### 1.1. Criar o Web App Manifest
Crie o arquivo `public/manifest.json`:

```json
{
  "short_name": "Tarefas Daily",
  "name": "Tarefas Daily - Gerenciador de Tarefas",
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
    },
    {
      "src": "/icons/maskable-icon-192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "maskable"
    }
  ],
  "start_url": "/",
  "background_color": "#0f172a",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#2563eb",
  "shortcuts": [
    {
      "name": "Nova Tarefa",
      "short_name": "Criar",
      "description": "Criar uma nova tarefa",
      "url": "/?action=create",
      "icons": [{ "src": "/icons/new-task.png", "sizes": "192x192" }]
    }
  ],
  "description": "Gerencie suas tarefas diárias de forma eficiente",
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "type": "image/png",
      "sizes": "1280x800"
    }
  ]
}
```

### 1.2. Adicionar metatags no `index.html`
Atualize `index.html` com as metatags PWA:

```html
<head>
  <!-- Metatags PWA -->
  <meta name="theme-color" content="#2563eb" />
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Tarefas Daily">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="application-name" content="Tarefas Daily">
  <meta name="msapplication-TileColor" content="#2563eb">
  <meta name="msapplication-TileImage" content="/icons/mstile-150x150.png">
  
  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Ícones -->
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
</head>
```

### 1.3. Gerar ícones
Crie uma variedade de ícones em diferentes tamanhos:
- 16x16, 32x32, 192x192, 512x512 pixels
- Ícones maskable para dispositivos Android
- Coloque-os na pasta `public/icons/`

## Fase 2: Implementação do Service Worker

### 2.1. Criar Service Worker
Crie `public/sw.js`:

```javascript
const CACHE_NAME = 'tarefas-daily-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se encontrado, senão faz a requisição
        return response || fetch(event.request);
      })
  );
});

// Atualização do service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Notificação de atualização
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### 2.2. Registrar o Service Worker
Adicione ao `src/main.tsx`:

```typescript
// Registro do service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado: ', registration);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova atualização disponível
                showUpdateNotification();
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('Erro no registro do SW: ', registrationError);
      });
  });
}

// Função para mostrar notificação de atualização
function showUpdateNotification() {
  if (confirm('Nova versão disponível. Atualizar agora?')) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }
}
```

## Fase 3: Configuração do GitHub Actions para Deploy Automático

### 3.1. Criar workflow de deploy
Crie `.github/workflows/deploy.yml`:

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
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: seu-dominio.com # Se tiver domínio personalizado
```

### 3.2. Configurar GitHub Pages
1. Vá para Settings > Pages no repositório
2. Em "Source", selecione "GitHub Actions"
3. O deploy automático começará após o próximo push para main

## Fase 4: Implementação de Atualização Automática

### 4.1. Criar sistema de verificação de versão
Crie `src/lib/version-check.ts`:

```typescript
class VersionChecker {
  private currentVersion: string;
  private checkInterval: number;

  constructor() {
    this.currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    this.checkInterval = 5 * 60 * 1000; // 5 minutos
  }

  start() {
    // Verificação imediata
    this.checkForUpdates();
    
    // Verificação periódica
    setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  async checkForUpdates() {
    try {
      const response = await fetch('/version.json');
      const data = await response.json();
      
      if (data.version !== this.currentVersion) {
        this.notifyUpdateAvailable(data.version);
      }
    } catch (error) {
      console.log('Erro ao verificar atualizações:', error);
    }
  }

  notifyUpdateAvailable(newVersion: string) {
    // Mostrar notificação na UI
    const event = new CustomEvent('app-update-available', {
      detail: { newVersion }
    });
    window.dispatchEvent(event);
  }
}

export const versionChecker = new VersionChecker();
```

### 4.2. Criar arquivo de versão
Crie `public/version.json`:

```json
{
  "version": "1.0.0",
  "buildDate": "2024-01-01T00:00:00Z"
}
```

### 4.3. Atualizar workflow para gerar version.json
Modifique `.github/workflows/deploy.yml`:

```yaml
# Adicione antes do deploy:
    - name: Create version file
      run: |
        echo "{\n  \"version\": \"$(date +%s)\",\n  \"buildDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"\n}" > dist/version.json
    
    - name: Deploy to GitHub Pages
      # ... resto do deploy
```

### 4.4. Integrar notificação na UI
Atualize `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { versionChecker } from '@/lib/version-check';

function App() {
  useEffect(() => {
    // Iniciar verificação de versão
    versionChecker.start();
    
    // Listener para atualizações
    const handleUpdate = (event: CustomEvent) => {
      const { newVersion } = event.detail;
      if (confirm(`Nova versão (${newVersion}) disponível. Atualizar agora?`)) {
        window.location.reload();
      }
    };
    
    window.addEventListener('app-update-available', handleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('app-update-available', handleUpdate as EventListener);
    };
  }, []);

  return (
    // ... resto do componente
  );
}
```

## Fase 5: Otimizações e Melhorias Finais

### 5.1. Melhorar o Service Worker
Atualize `public/sw.js` com estratégias de cache mais avançadas:

```javascript
// Estratégia de cache network-first para API
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cacheResponse = await caches.match(request);
    return cacheResponse || new Response('Offline', { status: 503 });
  }
};

// Estratégia de cache cache-first para assets estáticos
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégias diferentes para diferentes tipos de requisições
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
```

### 5.2. Adicionar Web Share API
Implemente compartilhamento nativo:

```typescript
// src/lib/share.ts
export const shareTask = async (task: Task) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Tarefa Compartilhada',
        text: `${task.title}\n${task.description}`,
        url: window.location.href
      });
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
    }
  } else {
    // Fallback para copiar link
    navigator.clipboard.writeText(window.location.href);
    alert('Link copiado para a área de transferência!');
  }
};
```

### 5.3. Implementar Push Notifications
Adicione suporte a notificações push:

```javascript
// No service worker (sw.js)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

### 5.4. Configurar domínio personalizado (opcional)
Se quiser usar um domínio personalizado:
1. Adicione um arquivo `CNAME` na raiz de `public/` com seu domínio
2. Configure os registros DNS conforme instruções do provedor
3. Atualize o manifest.json com o novo domínio

### 5.5. Monitoramento e Analytics
Adicione ferramentas de monitoramento:

```typescript
// src/lib/analytics.ts
export const trackEvent = (category: string, action: string, label?: string) => {
  if ((window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
};
```

## Resultado Final

Com estas etapas, sua aplicação terá:

1. **PWA completo**: Instalável, offline-first, com manifest
2. **Atualização automática**: Deploy automático via GitHub Actions
3. **Notificação de atualizações**: Avisos para usuários quando houver novas versões
4. **Performance otimizada**: Estratégias de cache inteligentes
5. **Funcionalidades nativas**: Compartilhamento, notificações, etc.

O processo de atualização automática funciona assim:
1. Você faz commit e push para o branch main
2. GitHub Actions é acionado automaticamente
3. A aplicação é construída e implantada no GitHub Pages
4. O sistema de versionamento detecta a nova versão
5. Os usuários recebem notificação para atualizar

Isso cria uma experiência de atualização contínua semelhante a aplicativos nativos.