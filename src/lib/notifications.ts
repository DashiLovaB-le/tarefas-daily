interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationManager {
  private vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HtLlVLVWjbzgSjN6QkDJFHOtdqKZXm0i9JMiVGOiGzcGbVkOo'; // Chave VAPID pública (exemplo)

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications: Este navegador não suporta notificações');
      return { granted: false, denied: true, default: false };
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Notifications: Service Worker não suportado');
      return { granted: false, denied: true, default: false };
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    const result = {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };

    console.log('Notifications: Permissão atual:', permission);
    return result;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestPermission();
      
      if (!permission.granted) {
        console.log('Notifications: Permissão negada pelo usuário');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Verifica se já existe uma inscrição
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Cria nova inscrição
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        
        console.log('Notifications: Nova inscrição criada');
      } else {
        console.log('Notifications: Usando inscrição existente');
      }

      // Converte para formato JSON
      const subscriptionJson = subscription.toJSON();
      
      return {
        endpoint: subscriptionJson.endpoint!,
        keys: {
          p256dh: subscriptionJson.keys!.p256dh!,
          auth: subscriptionJson.keys!.auth!
        }
      };
    } catch (error) {
      console.error('Notifications: Erro ao inscrever para push:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const success = await subscription.unsubscribe();
        console.log('Notifications: Desinscrição realizada:', success);
        return success;
      }
      
      return true;
    } catch (error) {
      console.error('Notifications: Erro ao desincrever:', error);
      return false;
    }
  }

  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestPermission();
    
    if (!permission.granted) {
      console.log('Notifications: Não é possível mostrar notificação sem permissão');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      requireInteraction: false,
      ...options
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, defaultOptions);
      } else {
        new Notification(title, defaultOptions);
      }
      
      console.log('Notifications: Notificação local exibida');
    } catch (error) {
      console.error('Notifications: Erro ao exibir notificação:', error);
    }
  }

  async scheduleTaskReminder(taskId: string, taskTitle: string, dueDate: Date): Promise<void> {
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();
    
    // Agenda notificação 1 hora antes do prazo
    const reminderTime = timeUntilDue - (60 * 60 * 1000); // 1 hora em ms
    
    if (reminderTime > 0) {
      setTimeout(() => {
        this.showLocalNotification(
          'Lembrete de Tarefa',
          {
            body: `A tarefa "${taskTitle}" vence em 1 hora!`,
            tag: `task-reminder-${taskId}`,
            data: { taskId, type: 'reminder' },
            actions: [
              {
                action: 'view',
                title: 'Ver Tarefa'
              },
              {
                action: 'complete',
                title: 'Marcar como Concluída'
              }
            ]
          }
        );
      }, reminderTime);
      
      console.log(`Notifications: Lembrete agendado para tarefa ${taskId} em ${reminderTime}ms`);
    }
  }

  async sendTaskNotification(taskTitle: string, message: string, taskId?: string): Promise<void> {
    await this.showLocalNotification(
      'DashiTask',
      {
        body: message,
        tag: taskId ? `task-${taskId}` : 'general',
        data: { taskId, type: 'task-update' },
        actions: [
          {
            action: 'view',
            title: 'Ver Detalhes'
          }
        ]
      }
    );
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Instância singleton
export const notificationManager = new NotificationManager();

// Tipos para exportação
export type { NotificationPermission, PushSubscription };