import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  Monitor, 
  Wifi,
  Battery,
  Cpu,
  HardDrive,
  Globe,
  RefreshCw
} from 'lucide-react';
import { featureDetection, type PWASupport, type BrowserCapabilities } from '@/lib/feature-detection';

interface CompatibilityCheckProps {
  showDetails?: boolean;
  onCompatibilityChange?: (isCompatible: boolean) => void;
}

export function CompatibilityCheck({ 
  showDetails = false, 
  onCompatibilityChange 
}: CompatibilityCheckProps) {
  const [pwaSupport, setPwaSupport] = useState<PWASupport | null>(null);
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCompatibility();
  }, []);

  useEffect(() => {
    if (pwaSupport && onCompatibilityChange) {
      onCompatibilityChange(pwaSupport.isSupported);
    }
  }, [pwaSupport, onCompatibilityChange]);

  const checkCompatibility = async () => {
    setIsLoading(true);
    
    try {
      // Pequeno delay para simular verificação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const support = featureDetection.getPWASupport();
      const caps = featureDetection.getCapabilities();
      const device = featureDetection.getDeviceDetails();
      const report = featureDetection.getCompatibilityReport();
      
      setPwaSupport(support);
      setCapabilities(caps);
      setDeviceInfo(report);
    } catch (error) {
      console.error('Erro ao verificar compatibilidade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Verificando compatibilidade...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pwaSupport || !capabilities || !deviceInfo) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao verificar compatibilidade. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {pwaSupport.isSupported ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Compatibilidade PWA</span>
            </div>
            <Badge variant={getScoreVariant(pwaSupport.score)}>
              {pwaSupport.score}/100
            </Badge>
          </CardTitle>
          <CardDescription>
            {pwaSupport.isSupported 
              ? 'Seu dispositivo suporta todas as funcionalidades essenciais do PWA'
              : 'Algumas funcionalidades podem não estar disponíveis'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Pontuação de Compatibilidade</span>
                <span className={getScoreColor(pwaSupport.score)}>
                  {pwaSupport.score}%
                </span>
              </div>
              <Progress value={pwaSupport.score} className="h-2" />
            </div>

            {pwaSupport.missingFeatures.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>Recursos não suportados:</div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {pwaSupport.missingFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* Informações do Dispositivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {deviceInfo.device.type === 'mobile' ? (
                  <Smartphone className="h-5 w-5" />
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
                <span>Informações do Dispositivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Tipo</div>
                  <div className="font-medium capitalize">{deviceInfo.device.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Navegador</div>
                  <div className="font-medium">{deviceInfo.device.browser}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Plataforma</div>
                  <div className="font-medium">{deviceInfo.device.platform}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">PWA Instalado</div>
                  <Badge variant={deviceInfo.device.isStandalone ? 'default' : 'secondary'}>
                    {deviceInfo.device.isStandalone ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recursos Suportados */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Suportados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(capabilities).map(([feature, supported]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    {supported ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          {deviceInfo.performance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">CPU Cores</div>
                      <div className="font-medium">{deviceInfo.performance.hardwareConcurrency}</div>
                    </div>
                  </div>
                  {deviceInfo.performance.deviceMemory && (
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Memória</div>
                        <div className="font-medium">{deviceInfo.performance.deviceMemory} GB</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">WebGL</div>
                      <Badge variant={deviceInfo.performance.webGL ? 'default' : 'secondary'}>
                        {deviceInfo.performance.webGL ? 'Suportado' : 'Não Suportado'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Touch</div>
                      <Badge variant={deviceInfo.performance.touchEvents ? 'default' : 'secondary'}>
                        {deviceInfo.performance.touchEvents ? 'Suportado' : 'Não Suportado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conexão */}
          {deviceInfo.connection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5" />
                  <span>Conexão</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Tipo</div>
                    <div className="font-medium">{deviceInfo.connection.effectiveType || 'Desconhecido'}</div>
                  </div>
                  {deviceInfo.connection.downlink && (
                    <div>
                      <div className="text-sm text-muted-foreground">Velocidade</div>
                      <div className="font-medium">{deviceInfo.connection.downlink} Mbps</div>
                    </div>
                  )}
                  {deviceInfo.connection.rtt && (
                    <div>
                      <div className="text-sm text-muted-foreground">Latência</div>
                      <div className="font-medium">{deviceInfo.connection.rtt} ms</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Economia de Dados</div>
                    <Badge variant={deviceInfo.connection.saveData ? 'secondary' : 'outline'}>
                      {deviceInfo.connection.saveData ? 'Ativada' : 'Desativada'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendações */}
          {deviceInfo.recommendations && deviceInfo.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Recomendações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deviceInfo.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={checkCompatibility} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Novamente
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}