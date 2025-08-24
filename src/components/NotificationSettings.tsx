import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, AlertCircle, Check } from 'lucide-react';
import { notificationManager, type NotificationPermission } from '@/lib/notifications';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>({ granted: false, denied: false, default: true });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    taskReminders: true,
    projectUpdates: true,
    dailyDigest: false
  });

  useEffect(() => {
    checkPermissionStatus();
    checkSubscriptionStatus();
    loadSettings();
  }, []);

  const checkPermissionStatus = () => {
    const currentPermission = notificationManager.getPermissionStatus();
    setPermission(currentPermission);
  };

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('NotificationSettings: Erro ao verificar inscrição:', error);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const subscription = await notificationManager.subscribeToPush();
      
      if (subscription) {
        setIsSubscribed(true);
        checkPermissionStatus();
        
        // Aqui você enviaria a subscription para seu servidor
        console.log('NotificationSettings: Subscription criada:', subscription);
        
        toast.success('Notificações habilitadas com sucesso!', {
          icon: <Check className="h-4 w-4" />
        });
        
        // Mostrar notificação de teste
        await notificationManager.showLocalNotification(
          'Notificações Habilitadas!',
          {
            body: 'Você receberá lembretes sobre suas tarefas.',
            tag: 'welcome-notification'
          }
        );
      } else {
        toast.error('Não foi possível habilitar as notificações');
      }
    } catch (error) {
      console.error('NotificationSettings: Erro ao habilitar notificações:', error);
      toast.error('Erro ao habilitar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const success = await notificationManager.unsubscribeFromPush();
      
      if (success) {
        setIsSubscribed(false);
        toast.success('Notificações desabilitadas');
      } else {
        toast.error('Erro ao desabilitar notificações');
      }
    } catch (error) {
      console.error('NotificationSettings: Erro ao desabilitar notificações:', error);
      toast.error('Erro ao desabilitar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const testNotification = async () => {
    await notificationManager.showLocalNotification(
      'Notificação de Teste',
      {
        body: 'Esta é uma notificação de teste do DashiTask!',
        tag: 'test-notification'
      }
    );
  };

  if (!notificationManager.isSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Notificações não são suportadas neste navegador
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificação
        </CardTitle>
        <CardDescription>
          Gerencie como você recebe notificações sobre suas tarefas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status das Permissões */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Status das Notificações</h4>
          
          {permission.denied && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Notificações Bloqueadas</p>
                <p className="text-red-600">
                  Para habilitar, clique no ícone de cadeado na barra de endereços e permita notificações.
                </p>
              </div>
            </div>
          )}
          
          {permission.default && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Habilitar Notificações</p>
                  <p className="text-blue-600">Receba lembretes sobre suas tarefas</p>
                </div>
              </div>
              <Button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Habilitando...' : 'Habilitar'}
              </Button>
            </div>
          )}
          
          {permission.granted && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Notificações Habilitadas</p>
                  <p className="text-green-600">
                    {isSubscribed ? 'Inscrito para receber notificações' : 'Permissão concedida'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testNotification}
                  variant="outline"
                  size="sm"
                >
                  Testar
                </Button>
                {isSubscribed && (
                  <Button
                    onClick={handleDisableNotifications}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Desabilitando...' : 'Desabilitar'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Configurações Detalhadas */}
        {permission.granted && isSubscribed && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Tipos de Notificação</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">Lembretes de Tarefas</Label>
                  <p className="text-xs text-muted-foreground">
                    Receba lembretes antes do prazo das tarefas
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={settings.taskReminders}
                  onCheckedChange={(checked) => handleSettingChange('taskReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="project-updates">Atualizações de Projetos</Label>
                  <p className="text-xs text-muted-foreground">
                    Notificações sobre mudanças em projetos
                  </p>
                </div>
                <Switch
                  id="project-updates"
                  checked={settings.projectUpdates}
                  onCheckedChange={(checked) => handleSettingChange('projectUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-digest">Resumo Diário</Label>
                  <p className="text-xs text-muted-foreground">
                    Resumo das tarefas do dia (8:00 AM)
                  </p>
                </div>
                <Switch
                  id="daily-digest"
                  checked={settings.dailyDigest}
                  onCheckedChange={(checked) => handleSettingChange('dailyDigest', checked)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
