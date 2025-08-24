import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  Bell, 
  Share2, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Activity,
  Clock,
  Users
} from 'lucide-react';
import { analytics, type PWAMetrics } from '@/lib/analytics';

export function PWAMetrics() {
  const [metrics, setMetrics] = useState<PWAMetrics | null>(null);
  const [sessionReport, setSessionReport] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Atualizar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    const currentMetrics = analytics.getMetrics();
    const report = analytics.getSessionReport();
    
    setMetrics(currentMetrics);
    setSessionReport(report);
  };

  const handleExportData = () => {
    const data = {
      metrics,
      sessionReport,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwa-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de métricas?')) {
      localStorage.removeItem('pwa_metrics');
      localStorage.removeItem('analytics_events');
      loadMetrics();
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getInstallRate = (): number => {
    if (!metrics || metrics.installPromptShown === 0) return 0;
    return (metrics.installAccepted / metrics.installPromptShown) * 100;
  };

  const getNotificationRate = (): number => {
    if (!metrics || metrics.notificationPermissionRequests === 0) return 0;
    return (metrics.notificationPermissionGranted / metrics.notificationPermissionRequests) * 100;
  };

  if (!metrics || !sessionReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas PWA
          </CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle de Visibilidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas PWA
              </CardTitle>
              <CardDescription>
                Estatísticas de uso e performance da aplicação
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? 'Ocultar' : 'Mostrar'} Detalhes
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isVisible && (
        <>
          {/* Métricas da Sessão Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sessão Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(sessionReport.duration)}
                  </div>
                  <div className="text-sm text-muted-foreground">Duração</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sessionReport.events}
                  </div>
                  <div className="text-sm text-muted-foreground">Eventos</div>
                </div>
                <div className="text-center">
                  <Badge variant={sessionReport.online ? 'default' : 'destructive'}>
                    {sessionReport.online ? (
                      <><Wifi className="h-3 w-3 mr-1" /> Online</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
                    )}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{sessionReport.platform}</div>
                  <div className="text-xs text-muted-foreground">Plataforma</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Instalação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Instalação PWA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.installPromptShown}</div>
                  <div className="text-sm text-muted-foreground">Prompts Exibidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.installAccepted}</div>
                  <div className="text-sm text-muted-foreground">Instalações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.installRejected}</div>
                  <div className="text-sm text-muted-foreground">Rejeitadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getInstallRate().toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.notificationPermissionRequests}</div>
                  <div className="text-sm text-muted-foreground">Solicitações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.notificationPermissionGranted}</div>
                  <div className="text-sm text-muted-foreground">Permitidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getNotificationRate().toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Aceitação</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.serviceWorkerUpdates}</div>
                  <div className="text-sm text-muted-foreground">Atualizações SW</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.offlineUsage}</div>
                  <div className="text-sm text-muted-foreground">Uso Offline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.cacheHitRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.shareApiUsage}</div>
                  <div className="text-sm text-muted-foreground">Compartilhamentos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={loadMetrics} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button onClick={handleClearData} variant="destructive" size="sm">
                  Limpar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}