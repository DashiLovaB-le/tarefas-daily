
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCache } from '@/hooks/useCache';

const formatCacheSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const CacheStatus: React.FC = () => {
  const { cacheInfo, isLoading } = useCache();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status do Cache</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Cache</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Cache Hits</p>
            <p className="text-2xl font-bold text-green-600">{cacheInfo.hits}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Cache Misses</p>
            <p className="text-2xl font-bold text-red-600">{cacheInfo.misses}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">Taxa de Acerto</p>
          <p className="text-lg font-semibold">
            {cacheInfo.hits + cacheInfo.misses > 0 
              ? ((cacheInfo.hits / (cacheInfo.hits + cacheInfo.misses)) * 100).toFixed(1)
              : 0}%
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Tamanho do Cache</p>
          <p className="text-lg font-semibold">{formatCacheSize(cacheInfo.size)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={cacheInfo.isOnline ? "default" : "destructive"}>
            {cacheInfo.isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Badge variant="outline">
            Service Worker: {cacheInfo.swStatus}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
