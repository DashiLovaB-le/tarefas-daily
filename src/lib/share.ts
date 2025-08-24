interface ShareData {
  title: string;
  text: string;
  url?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  project?: string;
  dueDate?: string;
}

class ShareManager {
  private isWebShareSupported(): boolean {
    return 'share' in navigator && typeof navigator.share === 'function';
  }

  private isClipboardSupported(): boolean {
    return 'clipboard' in navigator && typeof navigator.clipboard?.writeText === 'function';
  }

  async shareTask(task: Task): Promise<boolean> {
    const shareData = this.prepareTaskShareData(task);
    
    if (this.isWebShareSupported()) {
      try {
        await navigator.share(shareData);
        console.log('Share: Tarefa compartilhada via Web Share API');
        return true;
      } catch (error) {
        console.log('Share: Usuário cancelou o compartilhamento ou erro:', error);
        // Fallback para clipboard se o usuário cancelar
        return this.fallbackToClipboard(shareData);
      }
    } else {
      console.log('Share: Web Share API não suportada, usando fallback');
      return this.fallbackToClipboard(shareData);
    }
  }

  async shareProject(projectName: string, taskCount: number): Promise<boolean> {
    const shareData: ShareData = {
      title: `Projeto: ${projectName}`,
      text: `Confira meu projeto "${projectName}" com ${taskCount} tarefa(s) no DashiTask!`,
      url: window.location.href
    };

    if (this.isWebShareSupported()) {
      try {
        await navigator.share(shareData);
        console.log('Share: Projeto compartilhado via Web Share API');
        return true;
      } catch (error) {
        console.log('Share: Erro ao compartilhar projeto:', error);
        return this.fallbackToClipboard(shareData);
      }
    } else {
      return this.fallbackToClipboard(shareData);
    }
  }

  async shareApp(): Promise<boolean> {
    const shareData: ShareData = {
      title: 'DashiTask - Controle de Tarefas',
      text: 'Organize suas tarefas de forma eficiente com o DashiTask! 📝✅',
      url: window.location.origin
    };

    if (this.isWebShareSupported()) {
      try {
        await navigator.share(shareData);
        console.log('Share: App compartilhado via Web Share API');
        return true;
      } catch (error) {
        console.log('Share: Erro ao compartilhar app:', error);
        return this.fallbackToClipboard(shareData);
      }
    } else {
      return this.fallbackToClipboard(shareData);
    }
  }

  private prepareTaskShareData(task: Task): ShareData {
    let text = `📝 ${task.title}`;
    
    if (task.description) {
      text += `\n\n${task.description}`;
    }
    
    if (task.project) {
      text += `\n\n📁 Projeto: ${task.project}`;
    }
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      text += `\n⏰ Prazo: ${dueDate.toLocaleDateString('pt-BR')}`;
    }
    
    text += '\n\nCompartilhado via DashiTask';

    return {
      title: `Tarefa: ${task.title}`,
      text,
      url: `${window.location.origin}?task=${task.id}`
    };
  }

  private async fallbackToClipboard(shareData: ShareData): Promise<boolean> {
    const textToShare = this.formatShareText(shareData);
    
    if (this.isClipboardSupported()) {
      try {
        await navigator.clipboard.writeText(textToShare);
        console.log('Share: Texto copiado para área de transferência');
        this.showCopyNotification();
        return true;
      } catch (error) {
        console.error('Share: Erro ao copiar para área de transferência:', error);
        return this.legacyFallback(textToShare);
      }
    } else {
      return this.legacyFallback(textToShare);
    }
  }

  private legacyFallback(text: string): boolean {
    try {
      // Fallback usando seleção de texto (método mais antigo)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('Share: Texto copiado via fallback legacy');
        this.showCopyNotification();
        return true;
      } else {
        console.error('Share: Falha no fallback legacy');
        this.showManualCopyDialog(text);
        return false;
      }
    } catch (error) {
      console.error('Share: Erro no fallback legacy:', error);
      this.showManualCopyDialog(text);
      return false;
    }
  }

  private formatShareText(shareData: ShareData): string {
    let text = shareData.text;
    if (shareData.url) {
      text += `\n\n🔗 ${shareData.url}`;
    }
    return text;
  }

  private showCopyNotification(): void {
    // Dispara evento customizado para mostrar notificação
    const event = new CustomEvent('share-copied', {
      detail: { message: 'Link copiado para a área de transferência!' }
    });
    window.dispatchEvent(event);
  }

  private showManualCopyDialog(text: string): void {
    // Dispara evento customizado para mostrar dialog manual
    const event = new CustomEvent('share-manual-copy', {
      detail: { text }
    });
    window.dispatchEvent(event);
  }

  // Método para verificar se o compartilhamento é suportado
  isShareSupported(): boolean {
    return this.isWebShareSupported() || this.isClipboardSupported();
  }

  // Método para obter o tipo de compartilhamento disponível
  getShareMethod(): 'native' | 'clipboard' | 'legacy' | 'none' {
    if (this.isWebShareSupported()) {
      return 'native';
    } else if (this.isClipboardSupported()) {
      return 'clipboard';
    } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      return 'legacy';
    } else {
      return 'none';
    }
  }
}

// Instância singleton
export const shareManager = new ShareManager();

// Tipos para exportação
export type { Task, ShareData };