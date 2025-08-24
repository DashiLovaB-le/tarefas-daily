interface VersionInfo {
  version: string;
  buildDate: string;
  buildNumber: string;
}

class VersionChecker {
  private currentVersion: string;
  private checkInterval: number;
  private intervalId: number | null = null;

  constructor() {
    this.currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    this.checkInterval = 5 * 60 * 1000; // 5 minutos
  }

  start() {
    console.log('VersionChecker: Iniciando verificação de versão...');
    
    // Verificação imediata
    this.checkForUpdates();
    
    // Verificação periódica
    this.intervalId = window.setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('VersionChecker: Verificação de versão parada');
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      console.log('VersionChecker: Verificando atualizações...');
      
      // Adiciona timestamp para evitar cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/version.json?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: VersionInfo = await response.json();
      console.log('VersionChecker: Versão atual:', this.currentVersion, 'Versão remota:', data.version);
      
      if (this.isNewVersion(data.version, this.currentVersion)) {
        console.log('VersionChecker: Nova versão detectada!');
        this.notifyUpdateAvailable(data);
      }
    } catch (error) {
      console.log('VersionChecker: Erro ao verificar atualizações:', error);
      // Não mostrar erro para o usuário, apenas logar
    }
  }

  private isNewVersion(remoteVersion: string, currentVersion: string): boolean {
    // Comparação simples de versões
    // Para uma comparação mais robusta, poderia usar uma biblioteca como semver
    
    // Se as versões são diferentes, considera como nova versão
    if (remoteVersion !== currentVersion) {
      return true;
    }
    
    // Também verifica se o buildNumber mudou (para builds do mesmo dia)
    return false;
  }

  private notifyUpdateAvailable(versionInfo: VersionInfo): void {
    console.log('VersionChecker: Notificando nova versão disponível');
    
    // Mostrar notificação na UI
    const event = new CustomEvent('app-update-available', {
      detail: { 
        newVersion: versionInfo.version,
        buildDate: versionInfo.buildDate,
        buildNumber: versionInfo.buildNumber
      }
    });
    window.dispatchEvent(event);
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  setCurrentVersion(version: string): void {
    this.currentVersion = version;
    console.log('VersionChecker: Versão atual atualizada para:', version);
  }
}

// Instância singleton
export const versionChecker = new VersionChecker();

// Tipos para exportação
export type { VersionInfo };