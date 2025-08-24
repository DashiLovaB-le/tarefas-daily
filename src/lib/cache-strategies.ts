// Estratégias de cache avançadas para o PWA

export interface CacheConfig {
  name: string;
  maxEntries?: number;
  maxAgeSeconds?: number;
  purgeOnQuotaError?: boolean;
}

export interface CacheStrategy {
  name: string;
  handler: (request: Request) => Promise<Response>;
}

// Configurações de cache por tipo de recurso
export const cacheConfigs: Record<string, CacheConfig> = {
  static: {
    name: 'dashitask-static-v1',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
    purgeOnQuotaError: true
  },
  dynamic: {
    name: 'dashitask-dynamic-v1',
    maxEntries: 50,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
    purgeOnQuotaError: true
  },
  api: {
    name: 'dashitask-api-v1',
    maxEntries: 30,
    maxAgeSeconds: 60 * 60, // 1 hora
    purgeOnQuotaError: true
  },
  images: {
    name: 'dashitask-images-v1',
    maxEntries: 60,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
    purgeOnQuotaError: true
  }
};

// Estratégia Network First com timeout
export const networkFirstWithTimeout = (timeoutMs: number = 3000) => {
  return async (request: Request): Promise<Response> => {
    try {
      // Criar uma promise com timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
      });

      // Tentar buscar da rede com timeout
      const networkResponse = await Promise.race([
        fetch(request),
        timeoutPromise
      ]);

      // Se a resposta é válida, armazena no cache
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheConfigs.api.name);
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    } catch (error) {
      console.log('Network failed or timeout, trying cache:', error);
      
      // Tentar buscar do cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não há cache, retorna resposta de erro personalizada
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'Você está offline e este conteúdo não está disponível no cache.',
          timestamp: new Date().toISOString()
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      );
    }
  };
};

// Estratégia Cache First com fallback inteligente
export const cacheFirstWithUpdate = () => {
  return async (request: Request): Promise<Response> => {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Atualizar cache em background se o recurso está antigo
      const cacheDate = cachedResponse.headers.get('date');
      if (cacheDate) {
        const age = Date.now() - new Date(cacheDate).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas

        if (age > maxAge) {
          // Atualizar em background
          fetch(request).then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(cacheConfigs.static.name);
              cache.put(request, networkResponse.clone());
            }
          }).catch(() => {
            // Ignorar erros de atualização em background
          });
        }
      }

      return cachedResponse;
    }

    // Se não está no cache, buscar da rede
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheConfigs.static.name);
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    } catch (error) {
      // Para imagens, retornar placeholder se disponível
      if (request.destination === 'image') {
        const placeholder = await caches.match('/placeholder.svg');
        if (placeholder) {
          return placeholder;
        }
      }

      return new Response('', { status: 404 });
    }
  };
};

// Estratégia Stale While Revalidate otimizada
export const staleWhileRevalidateOptimized = () => {
  return async (request: Request): Promise<Response> => {
    const cachedResponse = await caches.match(request);

    // Promise para buscar da rede e atualizar cache
    const fetchPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheConfigs.dynamic.name);
        
        // Verificar se o cache não está muito cheio
        const keys = await cache.keys();
        if (keys.length >= (cacheConfigs.dynamic.maxEntries || 50)) {
          // Remover entradas mais antigas
          const oldestKey = keys[0];
          await cache.delete(oldestKey);
        }
        
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => null);

    // Retornar cache imediatamente se disponível
    if (cachedResponse) {
      // Atualizar em background
      fetchPromise;
      return cachedResponse;
    }

    // Se não há cache, esperar pela rede
    const networkResponse = await fetchPromise;
    return networkResponse || new Response('', { status: 404 });
  };
};

// Função para determinar a estratégia baseada na requisição
export const getStrategyForRequest = (request: Request): CacheStrategy => {
  const url = new URL(request.url);
  
  // APIs e dados dinâmicos
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('supabase') ||
      url.searchParams.has('timestamp')) {
    return {
      name: 'network-first',
      handler: networkFirstWithTimeout(5000)
    };
  }

  // Recursos estáticos (CSS, JS, fontes)
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      url.pathname.includes('/icons/') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')) {
    return {
      name: 'cache-first',
      handler: cacheFirstWithUpdate()
    };
  }

  // Imagens
  if (request.destination === 'image') {
    return {
      name: 'cache-first-images',
      handler: cacheFirstWithUpdate()
    };
  }

  // Arquivo de versão (sempre da rede)
  if (url.pathname === '/version.json') {
    return {
      name: 'network-only',
      handler: async (req) => {
        try {
          return await fetch(req);
        } catch {
          return await caches.match(req) || new Response('{}', {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    };
  }

  // Páginas e outros recursos
  return {
    name: 'stale-while-revalidate',
    handler: staleWhileRevalidateOptimized()
  };
};

// Função para limpar caches antigos
export const cleanupOldCaches = async (): Promise<void> => {
  const cacheNames = await caches.keys();
  const currentCaches = Object.values(cacheConfigs).map(config => config.name);
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => {
      console.log('Removendo cache antigo:', cacheName);
      return caches.delete(cacheName);
    });

  await Promise.all(deletePromises);
};

// Função para otimizar tamanho dos caches
export const optimizeCacheSize = async (): Promise<void> => {
  for (const [type, config] of Object.entries(cacheConfigs)) {
    try {
      const cache = await caches.open(config.name);
      const requests = await cache.keys();

      if (requests.length > (config.maxEntries || 50)) {
        console.log(`Otimizando cache ${type}: ${requests.length} entradas`);
        
        // Remover 25% das entradas mais antigas
        const toRemove = Math.floor(requests.length * 0.25);
        const oldestRequests = requests.slice(0, toRemove);
        
        await Promise.all(
          oldestRequests.map(request => cache.delete(request))
        );
        
        console.log(`Cache ${type} otimizado: removidas ${toRemove} entradas`);
      }
    } catch (error) {
      console.error(`Erro ao otimizar cache ${type}:`, error);
    }
  }
};

// Função para verificar e limpar entradas expiradas
export const cleanExpiredEntries = async (): Promise<void> => {
  for (const [type, config] of Object.entries(cacheConfigs)) {
    if (!config.maxAgeSeconds) continue;

    try {
      const cache = await caches.open(config.name);
      const requests = await cache.keys();
      const now = Date.now();

      const deletePromises = requests.map(async (request) => {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseAge = now - new Date(dateHeader).getTime();
            if (responseAge > config.maxAgeSeconds! * 1000) {
              console.log(`Removendo entrada expirada do cache ${type}:`, request.url);
              return cache.delete(request);
            }
          }
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Erro ao limpar entradas expiradas do cache ${type}:`, error);
    }
  }
};

// Métricas de cache
export interface CacheMetrics {
  hits: number;
  misses: number;
  networkRequests: number;
  cacheSize: number;
  hitRate: number;
}

let cacheMetrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  networkRequests: 0,
  cacheSize: 0,
  hitRate: 0
};

export const updateCacheMetrics = (type: 'hit' | 'miss' | 'network') => {
  switch (type) {
    case 'hit':
      cacheMetrics.hits++;
      break;
    case 'miss':
      cacheMetrics.misses++;
      break;
    case 'network':
      cacheMetrics.networkRequests++;
      break;
  }

  const total = cacheMetrics.hits + cacheMetrics.misses;
  cacheMetrics.hitRate = total > 0 ? (cacheMetrics.hits / total) * 100 : 0;

  // Log métricas a cada 20 requisições
  if (total % 20 === 0 && total > 0) {
    console.log('Cache Metrics:', {
      hitRate: `${cacheMetrics.hitRate.toFixed(1)}%`,
      totalRequests: total,
      networkRequests: cacheMetrics.networkRequests,
      efficiency: `${((total - cacheMetrics.networkRequests) / total * 100).toFixed(1)}%`
    });
  }
};

export const getCacheMetrics = (): CacheMetrics => ({ ...cacheMetrics });

// Função para resetar métricas
export const resetCacheMetrics = () => {
  cacheMetrics = {
    hits: 0,
    misses: 0,
    networkRequests: 0,
    cacheSize: 0,
    hitRate: 0
  };
};