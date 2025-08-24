
// Tipos para permissões de notificação
export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

// Interface para NotificationAction (compatibilidade com browsers)
interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Tipos para notificações que funcionam em todos os navegadores
interface BasicNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  data?: any;
}

// Interface extendida para navegadores que suportam recursos avançados
interface ExtendedNotificationOptions extends BasicNotificationOptions {
  vibrate?: number[];
  actions?: NotificationAction[];
}

export interface NotificationData {
  title: string;
  body: string;
  type: 'general' | 'task-reminder' | 'task-overdue' | 'project-update';
  taskId?: string;
  projectId?: string;
  url?: string;
}

class NotificationManager {
  private permission: string = 'default';
  private supported: boolean = false;

  constructor() {
    this.supported = 'Notification' in window && 'serviceWorker' in navigator;
    if (this.supported && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  getPermissionStatus(): NotificationPermission {
    return {
      granted: this.permission === 'granted',
      denied: this.permission === 'denied',
      default: this.permission === 'default'
    };
  }

  isSupported(): boolean {
    return this.supported;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) {
      console.warn('Notificações não são suportadas neste navegador');
      return { granted: false, denied: true, default: false };
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      };
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return { granted: false, denied: true, default: false };
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.supported || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const permissionResult = await this.requestPermission();
      if (!permissionResult.granted) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já existe uma subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Criar nova subscription (você precisará de uma chave VAPID real)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array([/* Sua chave VAPID aqui */])
      });

      return subscription;
    } catch (error) {
      console.error('Erro ao criar subscription:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const success = await subscription.unsubscribe();
        return success;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error);
      return false;
    }
  }

  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permissionResult = await this.requestPermission();
    
    if (!permissionResult.granted) {
      console.warn('Permissão para notificações negada');
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: options?.body,
          icon: options?.icon || '/icons/icon-192.png',
          badge: options?.badge || '/icons/icon-192.png',
          tag: options?.tag,
          requireInteraction: options?.requireInteraction,
          data: options?.data
        });
      } else {
        new Notification(title, options);
      }
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
      // Fallback para notificação básica
      new Notification(title, options);
    }
  }

  async scheduleTaskReminder(taskId: string, taskTitle: string, dueDate: Date): Promise<void> {
    // Implementação básica - em um app real você usaria um scheduler
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();
    
    if (timeUntilDue > 0 && timeUntilDue <= 24 * 60 * 60 * 1000) { // Próximas 24 horas
      setTimeout(() => {
        this.showLocalNotification(
          'Lembrete de Tarefa',
          {
            body: `A tarefa "${taskTitle}" vence em breve!`,
            tag: `task-reminder-${taskId}`,
            data: { taskId, type: 'task-reminder' }
          }
        );
      }, Math.max(0, timeUntilDue - 60 * 60 * 1000)); // 1 hora antes
    }
  }

  async sendTaskNotification(title: string, body: string, taskId?: string): Promise<void> {
    await this.showLocalNotification(title, {
      body,
      tag: taskId ? `task-${taskId}` : 'task-notification',
      data: { taskId, type: 'task' }
    });
  }
}

export const notificationManager = new NotificationManager();

// Função para inicializar notificações no app
export const initializeNotifications = async (): Promise<boolean> => {
  if (notificationManager.isSupported()) {
    const permission = await notificationManager.requestPermission();
    return permission.granted;
  }
  return false;
};

// Função para verificar se as notificações estão habilitadas
export const areNotificationsEnabled = (): boolean => {
  const permission = notificationManager.getPermissionStatus();
  return permission.granted;
};
