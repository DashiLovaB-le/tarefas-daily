
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
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }

  async showNotification(data: NotificationData): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.warn('Permissão para notificações negada');
      return;
    }

    try {
      // Tentar enviar via Service Worker primeiro
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await this.showServiceWorkerNotification(registration, data);
      } else {
        // Fallback para notificação básica
        this.showBasicNotification(data);
      }
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
      // Fallback para notificação básica
      this.showBasicNotification(data);
    }
  }

  private async showServiceWorkerNotification(
    registration: ServiceWorkerRegistration, 
    data: NotificationData
  ): Promise<void> {
    const options: BasicNotificationOptions = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.type,
      requireInteraction: data.type === 'task-overdue',
      data: {
        dateOfArrival: Date.now(),
        type: data.type,
        taskId: data.taskId,
        projectId: data.projectId,
        url: data.url || '/'
      }
    };

    // Adicionar vibração se suportado
    if ('vibrate' in navigator) {
      (options as any).vibrate = [100, 50, 100];
    }

    // Adicionar ações se suportado
    const extendedOptions = options as ExtendedNotificationOptions;
    
    switch (data.type) {
      case 'task-reminder':
        if (this.supportsActions()) {
          extendedOptions.actions = [
            {
              action: 'view-task',
              title: 'Ver Tarefa'
            },
            {
              action: 'complete-task', 
              title: 'Marcar como Concluída'
            }
          ];
        }
        break;
      case 'task-overdue':
        if (this.supportsActions()) {
          extendedOptions.actions = [
            {
              action: 'view-task',
              title: 'Ver Tarefa'
            },
            {
              action: 'snooze',
              title: 'Adiar'
            }
          ];
        }
        break;
      case 'project-update':
        if (this.supportsActions()) {
          extendedOptions.actions = [
            {
              action: 'view-project',
              title: 'Ver Projeto'
            }
          ];
        }
        break;
      default:
        if (this.supportsActions()) {
          extendedOptions.actions = [
            {
              action: 'open-app',
              title: 'Abrir App'
            }
          ];
        }
    }

    await registration.showNotification(data.title, options);
  }

  private showBasicNotification(data: NotificationData): void {
    const options: NotificationOptions = {
      body: data.body,
      icon: '/icons/icon-192.png',
      tag: data.type,
      data: {
        type: data.type,
        taskId: data.taskId,
        projectId: data.projectId,
        url: data.url || '/'
      }
    };

    const notification = new Notification(data.title, options);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navegar para a URL apropriada
      const targetUrl = data.url || '/';
      if (window.location.pathname !== targetUrl) {
        window.location.href = targetUrl;
      }
    };

    // Auto-fechar após 5 segundos se não for urgente
    if (data.type !== 'task-overdue') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  private supportsActions(): boolean {
    return 'serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Métodos de conveniência para diferentes tipos de notificação
  async showTaskReminder(taskTitle: string, taskId: string): Promise<void> {
    await this.showNotification({
      title: 'Lembrete de Tarefa',
      body: `Não se esqueça: ${taskTitle}`,
      type: 'task-reminder',
      taskId,
      url: `/?task=${taskId}`
    });
  }

  async showTaskOverdue(taskTitle: string, taskId: string): Promise<void> {
    await this.showNotification({
      title: 'Tarefa Atrasada',
      body: `A tarefa "${taskTitle}" está atrasada!`,
      type: 'task-overdue',
      taskId,
      url: `/?task=${taskId}`
    });
  }

  async showProjectUpdate(projectName: string, projectId: string): Promise<void> {
    await this.showNotification({
      title: 'Atualização do Projeto',
      body: `Há atualizações no projeto ${projectName}`,
      type: 'project-update',
      projectId,
      url: `/projects?id=${projectId}`
    });
  }

  async showGeneralNotification(title: string, message: string): Promise<void> {
    await this.showNotification({
      title,
      body: message,
      type: 'general'
    });
  }
}

export const notifications = new NotificationManager();

// Função para inicializar notificações no app
export const initializeNotifications = async (): Promise<boolean> => {
  if (notifications.isNotificationSupported()) {
    return await notifications.requestPermission();
  }
  return false;
};

// Função para verificar se as notificações estão habilitadas
export const areNotificationsEnabled = (): boolean => {
  return notifications.getPermissionStatus() === 'granted';
};
