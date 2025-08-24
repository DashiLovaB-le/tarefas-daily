interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

interface PWAMetrics {
  installPromptShown: number;
  installAccepted: number;
  installRejected: number;
  serviceWorkerUpdates: number;
  offlineUsage: number;
  cacheHitRate: number;
  notificationPermissionRequests: number;
  notificationPermissionGranted: number;
  shareApiUsage: number;
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private metrics: PWAMetrics = {
    installPromptShown: 0,
    installAccepted: 0,
    installRejected: 0,
    serviceWorkerUpdates: 0,
    offlineUsage: 0,
    cacheHitRate: 0,
    notificationPermissionRequests: 0,
    notificationPermissionGranted: 0,
    shareApiUsage: 0
  };
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.loadMetrics();
    this.setupEventListeners();
  }

  // Tracking de eventos gerais
  trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now()
    };

    this.events.push(event);
    console.log('Analytics: Evento rastreado:', event);

    // Enviar para Google Analytics se disponível
    if ((window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }

    // Salvar localmente
    this.saveEvents();
  }

  // Tracking específico para PWA
  trackPWAInstallPrompt(): void {
    this.metrics.installPromptShown++;
    this.trackEvent('PWA', 'install_prompt_shown');
    this.saveMetrics();
  }

  trackPWAInstallAccepted(): void {
    this.metrics.installAccepted++;
    this.trackEvent('PWA', 'install_accepted');
    this.saveMetrics();
  }

  trackPWAInstallRejected(): void {
    this.metrics.installRejected++;
    this.trackEvent('PWA', 'install_rejected');
    this.saveMetrics();
  }

  trackServiceWorkerUpdate(): void {
    this.metrics.serviceWorkerUpdates++;
    this.trackEvent('PWA', 'service_worker_update');
    this.saveMetrics();
  }

  trackOfflineUsage(): void {
    this.metrics.offlineUsage++;
    this.trackEvent('PWA', 'offline_usage');
    this.saveMetrics();
  }

  trackNotificationPermissionRequest(): void {
    this.metrics.notificationPermissionRequests++;
    this.trackEvent('PWA', 'notification_permission_request');
    this.saveMetrics();
  }

  trackNotificationPermissionGranted(): void {
    this.metrics.notificationPermissionGranted++;
    this.trackEvent('PWA', 'notification_permission_granted');
    this.saveMetrics();
  }

  trackShareApiUsage(method: 'native' | 'clipboard' | 'legacy'): void {
    this.metrics.shareApiUsage++;
    this.trackEvent('PWA', 'share_api_usage', method);
    this.saveMetrics();
  }

  // Tracking de performance
  trackPageLoad(pageName: string, loadTime: number): void {
    this.trackEvent('Performance', 'page_load', pageName, loadTime);
  }

  trackUserAction(action: string, context?: string): void {
    this.trackEvent('User', action, context);
  }

  trackError(error: Error, context?: string): void {
    this.trackEvent('Error', error.name, `${context}: ${error.message}`);
    
    // Log detalhado para debugging
    console.error('Analytics: Erro rastreado:', {
      error: error.message,
      stack: error.stack,
      context,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Métricas de cache
  updateCacheHitRate(hits: number, total: number): void {
    this.metrics.cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
    this.saveMetrics();
  }

  // Relatórios
  getSessionReport(): object {
    const sessionDuration = Date.now() - this.startTime;
    
    return {
      sessionId: this.sessionId,
      duration: sessionDuration,
      events: this.events.length,
      metrics: this.metrics,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    };
  }

  getMetrics(): PWAMetrics {
    return { ...this.metrics };
  }

  getRecentEvents(limit: number = 50): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  // Envio de dados (para implementação futura com backend)
  async sendAnalytics(): Promise<void> {
    const report = this.getSessionReport();
    
    try {
      // Aqui você enviaria os dados para seu servidor de analytics
      console.log('Analytics: Relatório da sessão:', report);
      
      // Exemplo de envio para endpoint personalizado
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });
      
    } catch (error) {
      console.error('Analytics: Erro ao enviar dados:', error);
    }
  }

  // Limpeza de dados antigos
  cleanOldData(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > oneWeekAgo);
    this.saveEvents();
  }

  // Métodos privados
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // Listener para mudanças de conectividade
    window.addEventListener('online', () => {
      this.trackEvent('Connection', 'online');
    });

    window.addEventListener('offline', () => {
      this.trackEvent('Connection', 'offline');
      this.trackOfflineUsage();
    });

    // Listener para erros globais
    window.addEventListener('error', (event) => {
      this.trackError(event.error, 'Global error handler');
    });

    // Listener para erros de promise rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'Unhandled promise rejection');
    });

    // Listener para visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('Page', 'hidden');
        this.sendAnalytics(); // Enviar dados quando a página fica oculta
      } else {
        this.trackEvent('Page', 'visible');
      }
    });

    // Listener para beforeunload (quando o usuário sai)
    window.addEventListener('beforeunload', () => {
      this.sendAnalytics();
    });
  }

  private saveEvents(): void {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-100))); // Manter apenas os últimos 100 eventos
    } catch (error) {
      console.error('Analytics: Erro ao salvar eventos:', error);
    }
  }

  private loadEvents(): void {
    try {
      const saved = localStorage.getItem('analytics_events');
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Analytics: Erro ao carregar eventos:', error);
      this.events = [];
    }
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('pwa_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Analytics: Erro ao salvar métricas:', error);
    }
  }

  private loadMetrics(): void {
    try {
      const saved = localStorage.getItem('pwa_metrics');
      if (saved) {
        this.metrics = { ...this.metrics, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Analytics: Erro ao carregar métricas:', error);
    }
  }
}

// Instância singleton
export const analytics = new AnalyticsManager();

// Tipos para exportação
export type { AnalyticsEvent, PWAMetrics };