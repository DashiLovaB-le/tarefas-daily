import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface UpdateInfo {
  newVersion: string;
  buildDate: string;
  buildNumber: string;
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = (event: CustomEvent<UpdateInfo>) => {
      console.log('UpdateNotification: Nova atualização disponível', event.detail);
      setUpdateInfo(event.detail);
      setUpdateAvailable(true);
      setIsVisible(true);
    };

    window.addEventListener('app-update-available', handleUpdateAvailable as EventListener);

    return () => {
      window.removeEventListener('app-update-available', handleUpdateAvailable as EventListener);
    };
  }, []);

  const handleUpdate = () => {
    console.log('UpdateNotification: Usuário aceitou a atualização');
    
    // Enviar mensagem para o service worker pular a espera
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Recarregar a página após um pequeno delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleDismiss = () => {
    console.log('UpdateNotification: Usuário rejeitou a atualização');
    setIsVisible(false);
    
    // Reagendar a notificação para 5 minutos
    setTimeout(() => {
      if (updateAvailable) {
        setIsVisible(true);
      }
    }, 5 * 60 * 1000); // 5 minutos
  };

  const handleClose = () => {
    setIsVisible(false);
    setUpdateAvailable(false);
    setUpdateInfo(null);
  };

  if (!updateAvailable || !isVisible || !updateInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm font-semibold text-blue-900">
                Atualização Disponível
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-blue-700">
            Nova versão {updateInfo.newVersion} disponível
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Atualizar Agora
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Mais Tarde
            </Button>
          </div>
          <p className="mt-2 text-xs text-blue-600">
            Build: {new Date(updateInfo.buildDate).toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}