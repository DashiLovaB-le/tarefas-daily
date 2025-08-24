// Testes específicos de compatibilidade PWA

export interface PWACompatibilityTest {
  name: string;
  description: string;
  test: () => Promise<boolean>;
  fallback?: string;
  critical: boolean;
}

export interface PWACompatibilityResult {
  testName: string;
  passed: boolean;
  error?: string;
  fallbackAvailable: boolean;
  critical: boolean;
}

export class PWACompatibilityTester {
  private tests: PWACompatibilityTest[] = [
    {
      name: 'Service Worker',
      description: 'Verifica se Service Workers são suportados',
      test: this.testServiceWorker,
      fallback: 'Cache manual via localStorage',
      critical: true
    },
    {
      name: 'Web App Manifest',
      description: 'Verifica se o manifest pode ser carregado',
      test: this.testManifest,
      fallback: 'Instalação manual via instruções',
      critical: true
    },
    {
      name: 'Cache API',
      description: 'Verifica se a Cache API está disponível',
      test: this.testCacheAPI,
      fallback: 'localStorage para cache básico',
      critical: true
    },
    {
      name: 'Push Notifications',
      description: 'Verifica suporte a notificações push',
      test: this.testPushNotifications,
      fallback: 'Notificações in-app ou email',
      critical: false
    },
    {
      name: 'Background Sync',
      description: 'Verifica suporte a sincronização em background',
      test: this.testBackgroundSync,
      fallback: 'Sincronização manual ao voltar online',
      critical: false
    },
    {
      name: 'Web Share API',
      description: 'Verifica suporte ao compartilhamento nativo',
      test: this.testWebShare,
      fallback: 'Clipboard API ou cópia manual',
      critical: false
    },
    {
      name: 'Install Prompt',
      description: 'Verifica se o prompt de instalação funciona',
      test: this.testInstallPrompt,
      fallback: 'Instruções manuais de instalação',
      critical: false
    },
    {
      name: 'Fullscreen API',
      description: 'Verifica suporte a tela cheia',
      test: this.testFullscreen,
      fallback: 'Interface normal do navegador',
      critical: false
    },
    {
      name: 'Vibration API',
      description: 'Verifica suporte a vibração',
      test: this.testVibration,
      fallback: 'Feedback visual ou sonoro',
      critical: false
    },
    {
      name: 'Geolocation API',
      description: 'Verifica suporte a geolocalização',
      test: this.testGeolocation,
      fallback: 'Entrada manual de localização',
      critical: false
    }
  ];

  async runAllTests(): Promise<PWACompatibilityResult[]> {
    const results: PWACompatibilityResult[] = [];

    for (const test of this.tests) {
      try {
        const passed = await test.test.call(this);
        results.push({
          testName: test.name,
          passed,
          fallbackAvailable: !!test.fallback,
          critical: test.critical
        });
      } catch (error) {
        results.push({
          testName: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          fallbackAvailable: !!test.fallback,
          critical: test.critical
        });
      }
    }

    return results;
  }

  async runCriticalTests(): Promise<PWACompatibilityResult[]> {
    const criticalTests = this.tests.filter(test => test.critical);
    const results: PWACompatibilityResult[] = [];

    for (const test of criticalTests) {
      try {
        const passed = await test.test.call(this);
        results.push({
          testName: test.name,
          passed,
          fallbackAvailable: !!test.fallback,
          critical: test.critical
        });
      } catch (error) {
        results.push({
          testName: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          fallbackAvailable: !!test.fallback,
          critical: test.critical
        });
      }
    }

    return results;
  }

  // Testes individuais
  private async testServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      // Tenta registrar um service worker de teste
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined || 'serviceWorker' in navigator;
    } catch {
      return false;
    }
  }

  private async testManifest(): Promise<boolean> {
    try {
      const response = await fetch('/manifest.json');
      if (!response.ok) return false;
      
      const manifest = await response.json();
      return !!(manifest.name || manifest.short_name);
    } catch {
      return false;
    }
  }

  private async testCacheAPI(): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const testCache = await caches.open('pwa-test-cache');
      await caches.delete('pwa-test-cache');
      return true;
    } catch {
      return false;
    }
  }

  private async testPushNotifications(): Promise<boolean> {
    if (!('PushManager' in window) || !('Notification' in window)) {
      return false;
    }

    try {
      // Verifica se as notificações estão disponíveis
      return Notification.permission !== 'denied';
    } catch {
      return false;
    }
  }

  private async testBackgroundSync(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return 'sync' in registration;
    } catch {
      return false;
    }
  }

  private async testWebShare(): Promise<boolean> {
    return 'share' in navigator && typeof navigator.share === 'function';
  }

  private async testInstallPrompt(): Promise<boolean> {
    // Verifica se o evento beforeinstallprompt é suportado
    return 'BeforeInstallPromptEvent' in window;
  }

  private async testFullscreen(): Promise<boolean> {
    const element = document.documentElement;
    return !!(
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen
    );
  }

  private async testVibration(): Promise<boolean> {
    return 'vibrate' in navigator;
  }

  private async testGeolocation(): Promise<boolean> {
    return 'geolocation' in navigator;
  }

  // Métodos utilitários
  getCompatibilityScore(results: PWACompatibilityResult[]): number {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const criticalTests = results.filter(r => r.critical);
    const passedCriticalTests = criticalTests.filter(r => r.passed).length;

    // Peso maior para testes críticos
    const criticalWeight = 0.7;
    const nonCriticalWeight = 0.3;

    const criticalScore = criticalTests.length > 0 
      ? (passedCriticalTests / criticalTests.length) * criticalWeight * 100
      : 0;

    const nonCriticalScore = totalTests > criticalTests.length
      ? ((passedTests - passedCriticalTests) / (totalTests - criticalTests.length)) * nonCriticalWeight * 100
      : 0;

    return Math.round(criticalScore + nonCriticalScore);
  }

  isPWAReady(results: PWACompatibilityResult[]): boolean {
    const criticalTests = results.filter(r => r.critical);
    return criticalTests.every(test => test.passed);
  }

  getFailedCriticalFeatures(results: PWACompatibilityResult[]): string[] {
    return results
      .filter(r => r.critical && !r.passed)
      .map(r => r.testName);
  }

  getAvailableFallbacks(results: PWACompatibilityResult[]): string[] {
    const failedTests = results.filter(r => !r.passed && r.fallbackAvailable);
    return failedTests.map(test => {
      const testConfig = this.tests.find(t => t.name === test.testName);
      return testConfig?.fallback || 'Fallback disponível';
    });
  }

  generateCompatibilityReport(results: PWACompatibilityResult[]): any {
    const score = this.getCompatibilityScore(results);
    const isPWAReady = this.isPWAReady(results);
    const failedCritical = this.getFailedCriticalFeatures(results);
    const fallbacks = this.getAvailableFallbacks(results);

    return {
      timestamp: new Date().toISOString(),
      score,
      isPWAReady,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      criticalFailures: failedCritical,
      availableFallbacks: fallbacks,
      results,
      recommendations: this.generateRecommendations(results)
    };
  }

  private generateRecommendations(results: PWACompatibilityResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => !r.passed);

    if (failedTests.some(t => t.testName === 'Service Worker')) {
      recommendations.push('Considere implementar cache manual usando localStorage');
    }

    if (failedTests.some(t => t.testName === 'Push Notifications')) {
      recommendations.push('Implemente notificações in-app como alternativa');
    }

    if (failedTests.some(t => t.testName === 'Web Share API')) {
      recommendations.push('Use a Clipboard API como fallback para compartilhamento');
    }

    if (failedTests.some(t => t.testName === 'Install Prompt')) {
      recommendations.push('Forneça instruções manuais de instalação');
    }

    const score = this.getCompatibilityScore(results);
    if (score < 70) {
      recommendations.push('Considere criar uma versão lite da aplicação');
    }

    if (failedTests.length > results.length / 2) {
      recommendations.push('Implemente detecção de recursos e fallbacks graciosamente');
    }

    return recommendations;
  }
}

// Instância singleton
export const pwaCompatibilityTester = new PWACompatibilityTester();

// Função utilitária para teste rápido
export async function quickCompatibilityCheck(): Promise<{
  isCompatible: boolean;
  score: number;
  criticalIssues: string[];
}> {
  const results = await pwaCompatibilityTester.runCriticalTests();
  const score = pwaCompatibilityTester.getCompatibilityScore(results);
  const isCompatible = pwaCompatibilityTester.isPWAReady(results);
  const criticalIssues = pwaCompatibilityTester.getFailedCriticalFeatures(results);

  return {
    isCompatible,
    score,
    criticalIssues
  };
}