import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Trash2, 
  RefreshCw, 
  Activity,
  HardDrive,
  Zap,
  Signal
} from 'lucide-react';
import { useCache, useNetworkStatus } from '@/hooks/useCache';
import { formatBytes } from '@/lib/utils';

interface CacheStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { 
    cacheInfo, 
    cacheMetrics, 
    isLoading, 
    error, 
    refreshCacheInfo, 
    clearCache 
  } = useCache();
  
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  const handleClearCache = async () => {
    try {
      await clearCache();
      // Mostrar notificação de sucesso
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          data: {
            title: 'Cache Limpo',
            body: 'O cache foi limpo com sucesso',
            type: 'success'
          }
        });
      }
    } catch (err) {
      console.error('Erro ao limpar cache:', err);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Carregando informações do cache...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-destructive">
            <Database className="h-4 w-4" />
            <span className="text-sm">Erro: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status de Conectividade */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span>Status de Conectividade</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {isOnline && (
                <Badge variant={isSlowConnection ? "secondary" : "outline"}>
                  <Signal className="h-3 w-3 mr-1" />
                  {connectionType}
                </Badge>
              )}
            </div>
            {isSlowConnection && (
              <Badge variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                Conexão Lenta
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Cache */}
      {cacheInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Cache do Aplicativo</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshCacheInfo}
                  className="h-7 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="h-7 px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Uso de Storage */}
            {cacheInfo.quota > 0 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Uso de Armazenamento</span>
                  <span>{cacheInfo.usagePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={cacheInfo.usagePercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatBytes(cacheInfo.usage)}</span>
                  <span>{formatBytes(cacheInfo.quota)}</span>
                </div>
              </div>
            )}

            {/* Tamanho do Cache */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tamanho do Cache</span>
              </div>
              <Badge variant="outline">
                {formatBytes(cacheInfo.estimatedSize)}
              </Badge>
            </div>

            {/* Número de Caches */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Caches Ativos
              </span>
              <Badge variant="outline">
                {cacheInfo.cacheNames.length}
              </Badge>
            </div>

            {showDetails && cacheInfo.cacheNames.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-2">
                  Caches Disponíveis:
                </div>
                <div className="space-y-1">
                  {cacheInfo.cacheNames.map((name) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-xs font-mono">{name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearCache(name)}
                        className="h-6 px-2 text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métricas de Performance */}
      {cacheMetrics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Performance do Cache</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Taxa de Acerto */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Taxa de Acerto</span>
                <span>{cacheMetrics.hitRate.toFixed(1)}%</span>
              </div>
              <Progress value={cacheMetrics.hitRate} className="h-2" />
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {cacheMetrics.hits}
                </div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {cacheMetrics.misses}
                </div>
                <div className="text-xs text-muted-foreground">Falhas</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {cacheMetrics.networkRequests}
                </div>
                <div className="text-xs text-muted-foreground">Rede</div>
              </div>
            </div>

            {/* Última Atualização */}
            <div className="text-xs text-muted-foreground text-center">
              Última atualização: {cacheMetrics.lastUpdated.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de Performance */}
      {isOnline && isSlowConnection && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-orange-800">
                  Conexão Lenta Detectada
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  O app está otimizando automaticamente para sua conexão. 
                  Recursos em cache serão priorizados.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isOnline && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <WifiOff className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-800">
                  Modo Offline
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Você está offline. O app está funcionando com dados em cache. 
                  Algumas funcionalidades podem estar limitadas.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Utilitário para formatar bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default CacheStatus;