import { useState, useEffect } from 'react';
import { notificationManager, type NotificationPermission } from '@/lib/notifications';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({ granted: false, denied: false, default: true });
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
    checkSubscriptionStatus();
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
      console.error('useNotifications: Erro ao verificar inscrição:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    const result = await notificationManager.requestPermission();
    setPermission(result);
    return result.granted;
  };

  const subscribe = async (): Promise<boolean> => {
    try {
      const subscription = await notificationManager.subscribeToPush();
      if (subscription) {
        setIsSubscribed(true);
        checkPermissionStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('useNotifications: Erro ao inscrever:', error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const success = await notificationManager.unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } catch (error) {
      console.error('useNotifications: Erro ao desincrever:', error);
      return false;
    }
  };

  const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    await notificationManager.showLocalNotification(title, options);
  };

  const scheduleTaskReminder = async (task: Task): Promise<void> => {
    if (!task.dueDate) return;
    
    const dueDate = new Date(task.dueDate);
    await notificationManager.scheduleTaskReminder(task.id, task.title, dueDate);
  };

  const notifyTaskCreated = async (taskTitle: string): Promise<void> => {
    const settings = getNotificationSettings();
    if (!settings.taskReminders) return;

    await notificationManager.sendTaskNotification(
      taskTitle,
      `Nova tarefa criada: "${taskTitle}"`
    );
  };

  const notifyTaskCompleted = async (taskTitle: string): Promise<void> => {
    const settings = getNotificationSettings();
    if (!settings.taskReminders) return;

    await notificationManager.sendTaskNotification(
      taskTitle,
      `Tarefa concluída: "${taskTitle}" ✅`
    );
  };

  const notifyTaskDueSoon = async (task: Task): Promise<void> => {
    const settings = getNotificationSettings();
    if (!settings.taskReminders) return;

    await notificationManager.sendTaskNotification(
      task.title,
      `A tarefa "${task.title}" vence em breve!`,
      task.id
    );
  };

  const notifyProjectUpdate = async (projectName: string, message: string): Promise<void> => {
    const settings = getNotificationSettings();
    if (!settings.projectUpdates) return;

    await notificationManager.showLocalNotification(
      `Projeto: ${projectName}`,
      {
        body: message,
        tag: `project-${projectName}`,
        data: { type: 'project-update', projectName }
      }
    );
  };

  const sendDailyDigest = async (taskCount: number, overdueCount: number): Promise<void> => {
    const settings = getNotificationSettings();
    if (!settings.dailyDigest) return;

    let message = `Você tem ${taskCount} tarefa(s) para hoje`;
    if (overdueCount > 0) {
      message += ` e ${overdueCount} tarefa(s) em atraso`;
    }

    await notificationManager.showLocalNotification(
      'Resumo Diário - DashiTask',
      {
        body: message,
        tag: 'daily-digest',
        data: { type: 'daily-digest' },
        requireInteraction: true
      }
    );
  };

  const getNotificationSettings = () => {
    const defaultSettings = {
      taskReminders: true,
      projectUpdates: true,
      dailyDigest: false
    };

    try {
      const saved = localStorage.getItem('notification-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  };

  const isSupported = notificationManager.isSupported();

  return {
    permission,
    isSubscribed,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    scheduleTaskReminder,
    notifyTaskCreated,
    notifyTaskCompleted,
    notifyTaskDueSoon,
    notifyProjectUpdate,
    sendDailyDigest,
    getNotificationSettings
  };
}
