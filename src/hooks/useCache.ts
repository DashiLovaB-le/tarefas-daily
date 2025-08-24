import { useState, useEffect, useCallback } from 'react';

export interface CacheInfo {
  isSupported: boolean;
  estimatedSize: number;
  quota: number;
  usage: number;
  usagePercentage: number;
  cacheNames: string[];
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  networkRequests: number;
  hitRate: number;
  lastUpdated: Date;
}

export interface CacheHookReturn {
  cacheInfo: CacheInfo | null;
  cacheMetrics: CacheMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshCacheInfo: () => Promise<void>;
  clearCache: (cacheName?: string) => Promise<void>;
  preloadResources: (urls: string[]) => Promise<void>;
}

export const useCache = (): CacheHookReturn => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar informações do cache
  const getCacheInfo = useCallback(async (): Promise<CacheInfo> => {
    if (!('caches' in window)) {
      return {
        isSupported: false,
        estimatedSize: 0,
        quota: 0,
        usage: 0,
        usagePercentage: 0,
        cacheNames: []
      };
    }

    try {
      const cacheNames = await caches.keys();
      let estimatedSize = 0;

      // Estimar tamanho do cache
      for (const cacheName of cacheNames) {
        try {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              estimatedSize += blob.size;
            }
          }
        } catch (err) {
          console.warn(`Erro ao calcular tamanho do cache ${cacheName}:`, err);
        }
      }

      // Obter informações de quota (se disponível)
      let quota = 0;
      let usage = 0;
      let usagePercentage = 0;

      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          quota = estimate.quota || 0;
          usage = estimate.usage || 0;
          usagePercentage = quota > 0 ? (usage / quota) * 100 : 0;
        } catch (err) {
          console.warn('Erro ao obter informações de storage:', err);
        }
      }

      return {
        isSupported: true,
        estimatedSize,
        quota,
        usage,
        usagePercentage,
        cacheNames
      };
    } catch (err) {
      throw new Error(`Erro ao obter informações do cache: ${err}`);
    }
  }, []);

  // Obter métricas do service worker
  const getCacheMetrics = useCallback((): Promise<CacheMetrics> => {
    return new Promise((resolve) => {
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
        resolve({
          hits: 0,
          misses: 0,
          networkRequests: 0,
          hitRate: 0,
          lastUpdated: new Date()
        });
        return;
      }

      // Solicitar métricas do service worker
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_METRICS') {
          resolve({
            ...event.data.metrics,
            lastUpdated: new Date()
          });
        } else {
          resolve({
            hits: 0,
            misses: 0,
            networkRequests: 0,
            hitRate: 0,
            lastUpdated: new Date()
          });
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_METRICS' },
        [messageChannel.port2]
      );

      // Timeout após 2 segundos
      setTimeout(() => {
        resolve({
          hits: 0,
          misses: 0,
          networkRequests: 0,
          hitRate: 0,
          lastUpdated: new Date()
        });
      }, 2000);
    });
  }, []);

  // Atualizar informações do cache
  const refreshCacheInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [info, metrics] = await Promise.all([
        getCacheInfo(),
        getCacheMetrics()
      ]);

      setCacheInfo(info);
      setCacheMetrics(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [getCacheInfo, getCacheMetrics]);

  // Limpar cache
  const clearCache = useCallback(async (cacheName?: string) => {
    if (!('caches' in window)) {
      throw new Error('Cache API não suportada');
    }

    try {
      if (cacheName) {
        await caches.delete(cacheName);
      } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Atualizar informações após limpeza
      await refreshCacheInfo();
    } catch (err) {
      throw new Error(`Erro ao limpar cache: ${err}`);
    }
  }, [refreshCacheInfo]);

  // Pré-carregar recursos
  const preloadResources = useCallback(async (urls: string[]) => {
    if (!('caches' in window)) {
      throw new Error('Cache API não suportada');
    }

    try {
      const cache = await caches.open('dashitask-preload');
      
      const fetchPromises = urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn(`Erro ao pré-carregar ${url}:`, err);
        }
      });

      await Promise.all(fetchPromises);
      await refreshCacheInfo();
    } catch (err) {
      throw new Error(`Erro ao pré-carregar recursos: ${err}`);
    }
  }, [refreshCacheInfo]);

  // Carregar informações iniciais
  useEffect(() => {
    refreshCacheInfo();
  }, [refreshCacheInfo]);

  // Atualizar métricas periodicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const metrics = await getCacheMetrics();
        setCacheMetrics(metrics);
      } catch (err) {
        console.warn('Erro ao atualizar métricas do cache:', err);
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [getCacheMetrics]);

  // Listener para mensagens do service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CACHE_UPDATED') {
        refreshCacheInfo();
      } else if (event.data.type === 'CACHE_METRICS_UPDATE') {
        setCacheMetrics({
          ...event.data.metrics,
          lastUpdated: new Date()
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [refreshCacheInfo]);

  return {
    cacheInfo,
    cacheMetrics,
    isLoading,
    error,
    refreshCacheInfo,
    clearCache,
    preloadResources
  };
};

// Hook para monitorar status de conectividade
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar tipo de conexão se disponível
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };

      connection.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: ['slow-2g', '2g'].includes(connectionType)
  };
};

// Hook para cache de dados específicos
export const useDataCache = <T>(key: string, fetcher: () => Promise<T>, options?: {
  maxAge?: number;
  staleWhileRevalidate?: boolean;
}) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const maxAge = options?.maxAge || 5 * 60 * 1000; // 5 minutos padrão
  const staleWhileRevalidate = options?.staleWhileRevalidate ?? true;

  const fetchData = useCallback(async (useCache = true) => {
    try {
      if (useCache) {
        // Tentar buscar do cache primeiro
        const cached = localStorage.getItem(`cache_${key}`);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < maxAge) {
            setData(cachedData);
            setLastFetch(new Date(timestamp));
            setIsLoading(false);
            return cachedData;
          } else if (staleWhileRevalidate) {
            // Usar dados antigos enquanto busca novos
            setData(cachedData);
            setLastFetch(new Date(timestamp));
            setIsLoading(false);
          }
        }
      }

      // Buscar dados frescos
      const freshData = await fetcher();
      
      // Armazenar no cache
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      }));

      setData(freshData);
      setLastFetch(new Date());
      setError(null);
      return freshData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      
      // Se há dados em cache, usar mesmo que antigos
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        setData(cachedData);
        setLastFetch(new Date(timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, maxAge, staleWhileRevalidate]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(`cache_${key}`);
    setData(null);
    setLastFetch(null);
  }, [key]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    return fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastFetch,
    refresh,
    invalidateCache
  };
};