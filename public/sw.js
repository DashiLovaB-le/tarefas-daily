const CACHE_NAME = 'dashitask-v1.0.0';
const STATIC_CACHE = 'dashitask-static-v1.0.0';
const DYNAMIC_CACHE = 'dashitask-dynamic-v1.0.0';

// Recursos críticos para pré-cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/logo.png'
];

// Recursos estáticos para cache agressivo
const staticResources = [
  '/icons/icon-16.png',
  '/icons/icon-32.png',
  '/icons/maskable-icon-192.png',
  '/placeholder.svg'
];

// Recursos dinâmicos importantes
const importantRoutes = [
  '/dashboard',
  '/today',
  '/projects'
];

// Instalação do service worker com pré-cache inteligente
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache principal com recursos críticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Pré-cacheando recursos críticos');
        return cache.addAll(urlsToCache);
      }),
      
      // Cache estático com recursos secundários
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Pré-cacheando recursos estáticos');
        return cache.addAll(staticResources.filter(url => url)); // Remove URLs vazias
      })
    ])
    .then(() => {
      console.log('Service Worker: Pré-cache concluído');
      // Força a ativação imediata se não há SW ativo
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Service Worker: Erro no pré-cache:', error);
    })
  );
});

// Estratégia de cache network-first para APIs
const networkFirst = async (request) => {
  try {
    console.log('Service Worker: Network-first para:', request.url);
    const networkResponse = await fetch(request);
    
    // Se a resposta é válida, armazena no cache
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Rede falhou, tentando cache:', error);
    const cacheResponse = await caches.match(request);
    
    if (cacheResponse) {
      return cacheResponse;
    }
    
    // Resposta offline personalizada para APIs
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Você está offline. Alguns dados podem estar desatualizados.' 
      }), 
      { 
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Estratégia de cache cache-first para assets estáticos
const cacheFirst = async (request) => {
  console.log('Service Worker: Cache-first para:', request.url);
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('Service Worker: Servindo do cache:', request.url);
    return cachedResponse;
  }
  
  console.log('Service Worker: Não encontrado no cache, buscando da rede:', request.url);
  try {
    const networkResponse = await fetch(request);
    
    // Armazena no cache para próximas requisições
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Erro ao buscar da rede:', error);
    
    // Para imagens, retorna uma imagem placeholder se disponível
    if (request.destination === 'image') {
      return caches.match('/placeholder.svg') || new Response('', { status: 404 });
    }
    
    return new Response('', { status: 404 });
  }
};

// Estratégia stale-while-revalidate para recursos que podem ser atualizados
const staleWhileRevalidate = async (request) => {
  console.log('Service Worker: Stale-while-revalidate para:', request.url);
  const cachedResponse = await caches.match(request);
  
  // Busca da rede em paralelo
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => null);
  
  // Retorna do cache imediatamente se disponível, senão espera a rede
  return cachedResponse || fetchPromise;
};

// Interceptação de requisições com estratégias inteligentes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Monitorar métricas de cache
  monitorCacheMetrics(request);
  
  // Ignora requisições de outros domínios (exceto APIs conhecidas)
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Estratégias diferentes para diferentes tipos de requisições
  if (request.method !== 'GET') {
    // Para requisições não-GET, sempre vai para a rede
    return;
  }
  
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    // APIs: Network-first (dados sempre atualizados quando possível)
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image' || 
             request.destination === 'font' || 
             url.pathname.includes('.css') || 
             url.pathname.includes('.js') ||
             url.pathname.includes('/icons/')) {
    // Assets estáticos: Cache-first (performance)
    event.respondWith(cacheFirst(request));
  } else if (url.pathname === '/version.json') {
    // Arquivo de versão: sempre da rede (para detectar atualizações)
    event.respondWith(fetch(request).catch(() => caches.match(request)));
  } else {
    // Outros recursos: Stale-while-revalidate (balanceado)
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Atualização do service worker com limpeza inteligente
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Limpar entradas antigas do cache atual (opcional)
      cleanOldCacheEntries(),
      
      // Tomar controle de todas as abas abertas
      self.clients.claim()
    ])
  );
});

// Função para limpar entradas antigas do cache
async function cleanOldCacheEntries() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    const deletePromises = requests.map(async (request) => {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            console.log('Service Worker: Removendo entrada antiga do cache:', request.url);
            return cache.delete(request);
          }
        }
      }
    });
    
    await Promise.all(deletePromises);
    console.log('Service Worker: Limpeza de cache concluída');
  } catch (error) {
    console.error('Service Worker: Erro na limpeza de cache:', error);
  }
}

// Notificação de atualização
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Pulando espera...');
    self.skipWaiting();
  }
});

// Sincronização em background (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Sincronização em background');
    // Implementar sincronização de dados quando necessário
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificação push recebida');
  
  let notificationData = {
    title: 'DashiTask',
    body: 'Nova notificação',
    type: 'general'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Service Worker: Erro ao parsear dados da notificação:', error);
      notificationData.body = event.data.text() || 'Nova notificação do DashiTask';
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    requireInteraction: notificationData.type === 'urgent',
    data: {
      dateOfArrival: Date.now(),
      type: notificationData.type,
      taskId: notificationData.taskId,
      projectId: notificationData.projectId,
      url: notificationData.url || '/'
    },
    actions: []
  };

  // Adiciona ações baseadas no tipo de notificação
  switch (notificationData.type) {
    case 'task-reminder':
      options.actions = [
        {
          action: 'view-task',
          title: 'Ver Tarefa'
        },
        {
          action: 'complete-task',
          title: 'Marcar como Concluída'
        }
      ];
      break;
    case 'task-overdue':
      options.actions = [
        {
          action: 'view-task',
          title: 'Ver Tarefa'
        },
        {
          action: 'snooze',
          title: 'Adiar'
        }
      ];
      break;
    case 'project-update':
      options.actions = [
        {
          action: 'view-project',
          title: 'Ver Projeto'
        }
      ];
      break;
    default:
      options.actions = [
        {
          action: 'open-app',
          title: 'Abrir App'
        }
      ];
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique na notificação', event.action);
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  let urlToOpen = '/';

  // Determina a URL baseada na ação e dados da notificação
  switch (event.action) {
    case 'view-task':
      if (notificationData.taskId) {
        urlToOpen = `/?task=${notificationData.taskId}`;
      }
      break;
    case 'view-project':
      if (notificationData.projectId) {
        urlToOpen = `/projects?id=${notificationData.projectId}`;
      }
      break;
    case 'complete-task':
      // Enviar mensagem para a aplicação marcar tarefa como concluída
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clients => {
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'COMPLETE_TASK',
              taskId: notificationData.taskId
            });
            return clients[0].focus();
          } else {
            return self.registration.showNotification('Tarefa Concluída', {
              body: 'Abra o app para ver as mudanças',
              tag: 'task-completed'
            });
          }
        })
      );
      return;
    case 'snooze':
      // Reagendar notificação para 1 hora
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clients => {
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'SNOOZE_TASK',
              taskId: notificationData.taskId
            });
          }
        })
      );
      return;
    default:
      urlToOpen = notificationData.url || '/';
  }

  // Abrir ou focar na aplicação
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Procura por uma janela já aberta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      
      // Se não encontrou, abre nova janela
      return clients.openWindow(urlToOpen);
    })
  );
});

// Sistema de monitoramento de cache
let cacheStats = {
  hits: 0,
  misses: 0,
  networkRequests: 0,
  cacheSize: 0
};

// Função para atualizar estatísticas
function updateCacheStats(type) {
  cacheStats[type]++;
  
  // Log estatísticas a cada 10 requisições
  const total = cacheStats.hits + cacheStats.misses;
  if (total % 10 === 0) {
    console.log('Service Worker Stats:', {
      hitRate: `${((cacheStats.hits / total) * 100).toFixed(1)}%`,
      totalRequests: total,
      networkRequests: cacheStats.networkRequests
    });
  }
}

// Função para otimizar cache baseado no uso
async function optimizeCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Se o cache está muito grande, remove entradas menos usadas
    if (requests.length > 100) {
      console.log('Service Worker: Otimizando cache dinâmico');
      
      // Remove 20% das entradas mais antigas
      const toRemove = requests.slice(0, Math.floor(requests.length * 0.2));
      await Promise.all(toRemove.map(request => cache.delete(request)));
      
      console.log(`Service Worker: Removidas ${toRemove.length} entradas do cache`);
    }
  } catch (error) {
    console.error('Service Worker: Erro na otimização de cache:', error);
  }
}

// Otimizar cache periodicamente
setInterval(optimizeCache, 30 * 60 * 1000); // A cada 30 minutos

// Função para verificar conectividade
function isOnline() {
  return navigator.onLine !== false;
}

// Listener para mudanças de conectividade
self.addEventListener('online', () => {
  console.log('Service Worker: Conectividade restaurada');
  // Sincronizar dados pendentes se necessário
});

self.addEventListener('offline', () => {
  console.log('Service Worker: Modo offline detectado');
});

// Sistema de monitoramento melhorado
function logSWEvent(event, data = {}) {
  const logEntry = {
    event,
    data,
    timestamp: new Date().toISOString(),
    url: self.location.href
  };
  
  console.log('SW Event:', logEntry);
  
  // Enviar para a aplicação principal se possível
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_EVENT_LOG',
        log: logEntry
      });
    });
  });
}

// Listener para mensagens da aplicação
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('Service Worker: Pulando espera...');
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_METRICS':
      // Enviar métricas de cache
      event.ports[0].postMessage({
        type: 'CACHE_METRICS',
        metrics: cacheStats
      });
      break;
      
    case 'CLEAR_CACHE':
      // Limpar cache específico ou todos
      const cacheName = data?.cacheName;
      if (cacheName) {
        caches.delete(cacheName).then(() => {
          event.ports[0].postMessage({ type: 'CACHE_CLEARED', cacheName });
        });
      } else {
        caches.keys().then(names => {
          return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => {
          event.ports[0].postMessage({ type: 'ALL_CACHES_CLEARED' });
        });
      }
      break;
      
    case 'PRELOAD_RESOURCES':
      // Pré-carregar recursos
      const urls = data?.urls || [];
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          urls.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => {
              // Ignorar erros de pré-carregamento
            })
          )
        );
      }).then(() => {
        event.ports[0].postMessage({ type: 'RESOURCES_PRELOADED', count: urls.length });
      });
      break;
      
    case 'SHOW_NOTIFICATION':
      // Mostrar notificação
      const notificationData = data || {};
      self.registration.showNotification(notificationData.title || 'DashiTask', {
        body: notificationData.body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: notificationData.type || 'general'
      });
      break;
  }
});

// Monitorar eventos importantes do service worker
self.addEventListener('install', (event) => {
  logSWEvent('install', { cacheName: CACHE_NAME });
});

self.addEventListener('activate', (event) => {
  logSWEvent('activate', { cacheName: CACHE_NAME });
});

// Monitorar métricas de cache (separado do handler principal de fetch)
function monitorCacheMetrics(request) {
  // Verificar se a requisição será servida do cache
  caches.match(request).then(cachedResponse => {
    if (cachedResponse) {
      updateCacheStats('hits');
    } else {
      updateCacheStats('misses');
      updateCacheStats('networkRequests');
    }
  });
  
  // Log apenas requisições importantes para evitar spam
  if (request.url.includes('/api/') || request.url.includes('version.json')) {
    logSWEvent('fetch', { 
      url: request.url, 
      method: request.method 
    });
  }
}

// Monitorar erros
self.addEventListener('error', (event) => {
  logSWEvent('error', { 
    message: event.message, 
    filename: event.filename, 
    lineno: event.lineno 
  });
});

// Performance monitoring
let performanceMetrics = {
  installTime: null,
  activateTime: null,
  firstFetchTime: null
};

// Capturar métricas de performance
self.addEventListener('install', () => {
  performanceMetrics.installTime = performance.now();
});

self.addEventListener('activate', () => {
  performanceMetrics.activateTime = performance.now();
});

self.addEventListener('fetch', () => {
  if (!performanceMetrics.firstFetchTime) {
    performanceMetrics.firstFetchTime = performance.now();
    
    // Enviar métricas para a aplicação
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_PERFORMANCE_METRICS',
          metrics: performanceMetrics
        });
      });
    });
  }
});