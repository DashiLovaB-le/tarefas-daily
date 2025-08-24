import { useState } from 'react';
import { shareManager, type Task } from '@/lib/share';

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareTask = async (task: Task): Promise<boolean> => {
    setIsSharing(true);
    try {
      const success = await shareManager.shareTask(task);
      return success;
    } catch (error) {
      console.error('useShare: Erro ao compartilhar tarefa:', error);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const shareProject = async (projectName: string, taskCount: number): Promise<boolean> => {
    setIsSharing(true);
    try {
      const success = await shareManager.shareProject(projectName, taskCount);
      return success;
    } catch (error) {
      console.error('useShare: Erro ao compartilhar projeto:', error);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const shareApp = async (): Promise<boolean> => {
    setIsSharing(true);
    try {
      const success = await shareManager.shareApp();
      return success;
    } catch (error) {
      console.error('useShare: Erro ao compartilhar app:', error);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const isShareSupported = shareManager.isShareSupported();
  const shareMethod = shareManager.getShareMethod();

  return {
    shareTask,
    shareProject,
    shareApp,
    isSharing,
    isShareSupported,
    shareMethod
  };
}