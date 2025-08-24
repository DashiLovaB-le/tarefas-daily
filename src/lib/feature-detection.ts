interface BrowserCapabilities {
  serviceWorker: boolean;
  pushManager: boolean;
  notifications: boolean;
  webShare: boolean;
  clipboard: boolean;
  installPrompt: boolean;
  fullscreen: boolean;
  vibration: boolean;
  geolocation: boolean;
  camera: boolean;
  microphone: boolean;
  localStorage: boolean;
  indexedDB: boolean;
  webGL: boolean;
  touchEvents: boolean;
  deviceOrientation: boolean;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  onLine: boolean;
  maxTouchPoints: number;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connection?: any;
}

interface PWASupport {
  isSupported: boolean;
  missingFeatures: string[];
  recommendedFallbacks: string[];
  score: number; // 0-100
}

class FeatureDetection {
  private capabilities: BrowserCapabilities;
  private deviceInfo: DeviceInfo;

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.deviceInfo = this.getDeviceInfo();
  }

  private detectCapabilities(): BrowserCapabilities {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notifications: 'Notification' in window,
      webShare: 'share' in navigator,
      clipboard: 'clipboard' in navigator && 'writeText' in navigator.clipboard,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      fullscreen: 'requestFullscreen' in document.documentElement,
      vibration: 'vibrate' in navigator,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      localStorage: this.testLocalStorage(),
      indexedDB: 'indexedDB' in window,
      webGL: this.testWebGL(),
      touchEvents: 'ontouchstart' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window
    };
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    };
  }

  private testLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private testWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  // Métodos públicos
  getCapabilities(): BrowserCapabilities {
    return { ...this.capabilities };
  }

  getDeviceDetails(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  isFeatureSupported(feature: keyof BrowserCapabilities): boolean {
    return this.capabilities[feature];
  }

  getPWASupport(): PWASupport {
    const requiredFeatures = ['serviceWorker', 'notifications', 'localStorage'];
    const recommendedFeatures = ['pushManager', 'webShare', 'installPrompt'];
    const optionalFeatures = ['fullscreen', 'vibration', 'clipboard'];

    const missingRequired = requiredFeatures.filter(feature => !this.capabilities[feature as keyof BrowserCapabilities]);
    const missingRecommended = recommendedFeatures.filter(feature => !this.capabilities[feature as keyof BrowserCapabilities]);
    const missingOptional = optionalFeatures.filter(feature => !this.capabilities[feature as keyof BrowserCapabilities]);

    const totalFeatures = requiredFeatures.length + recommendedFeatures.length + optionalFeatures.length;
    
    // Peso diferente para cada tipo de feature
    const score = Math.round(
      ((requiredFeatures.length - missingRequired.length) * 50 / requiredFeatures.length) +
      ((recommendedFeatures.length - missingRecommended.length) * 30 / recommendedFeatures.length) +
      ((optionalFeatures.length - missingOptional.length) * 20 / optionalFeatures.length)
    );

    const isSupported = missingRequired.length === 0;
    const missingFeatures = [...missingRequired, ...missingRecommended];
    
    const recommendedFallbacks = this.getRecommendedFallbacks(missingFeatures);

    return {
      isSupported,
      missingFeatures,
      recommendedFallbacks,
      score
    };
  }

  private getRecommendedFallbacks(missingFeatures: string[]): string[] {
    const fallbacks: string[] = [];

    if (missingFeatures.includes('serviceWorker')) {
      fallbacks.push('Use Application Cache (deprecated) or manual caching');
    }

    if (missingFeatures.includes('notifications')) {
      fallbacks.push('Use in-app notifications or email notifications');
    }

    if (missingFeatures.includes('webShare')) {
      fallbacks.push('Use clipboard API or manual copy functionality');
    }

    if (missingFeatures.includes('pushManager')) {
      fallbacks.push('Use WebSocket or polling for real-time updates');
    }

    if (missingFeatures.includes('installPrompt')) {
      fallbacks.push('Show manual installation instructions');
    }

    if (missingFeatures.includes('localStorage')) {
      fallbacks.push('Use cookies or session storage');
    }

    return fallbacks;
  }

  // Detecção de dispositivo
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.deviceInfo.userAgent) ||
           this.deviceInfo.maxTouchPoints > 0;
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(this.deviceInfo.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(this.deviceInfo.userAgent);
  }

  isDesktop(): boolean {
    return !this.isMobile();
  }

  // Detecção de navegador
  getBrowser(): string {
    const ua = this.deviceInfo.userAgent;
    
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    
    return 'Unknown';
  }

  // Verificação de PWA instalado
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Verificação de recursos de rede
  getConnectionInfo(): any {
    const connection = this.deviceInfo.connection;
    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  // Verificação de performance
  getPerformanceInfo(): any {
    return {
      hardwareConcurrency: this.deviceInfo.hardwareConcurrency,
      deviceMemory: this.deviceInfo.deviceMemory,
      webGL: this.capabilities.webGL,
      touchEvents: this.capabilities.touchEvents
    };
  }

  // Relatório completo
  getCompatibilityReport(): any {
    const pwaSupport = this.getPWASupport();
    
    return {
      timestamp: new Date().toISOString(),
      device: {
        type: this.isMobile() ? 'mobile' : 'desktop',
        platform: this.deviceInfo.platform,
        browser: this.getBrowser(),
        isIOS: this.isIOS(),
        isAndroid: this.isAndroid(),
        isStandalone: this.isStandalone()
      },
      capabilities: this.capabilities,
      pwaSupport,
      performance: this.getPerformanceInfo(),
      connection: this.getConnectionInfo(),
      recommendations: this.getRecommendations(pwaSupport)
    };
  }

  private getRecommendations(pwaSupport: PWASupport): string[] {
    const recommendations: string[] = [];

    if (pwaSupport.score < 70) {
      recommendations.push('Consider providing a lite version for better compatibility');
    }

    if (!this.capabilities.serviceWorker) {
      recommendations.push('Implement manual caching strategies');
    }

    if (!this.capabilities.notifications) {
      recommendations.push('Use alternative notification methods (email, in-app)');
    }

    if (this.isMobile() && !this.capabilities.installPrompt) {
      recommendations.push('Provide manual installation instructions');
    }

    if (!this.capabilities.webShare) {
      recommendations.push('Implement clipboard-based sharing');
    }

    const connection = this.getConnectionInfo();
    if (connection && connection.saveData) {
      recommendations.push('Optimize for data saving mode');
    }

    return recommendations;
  }
}

// Instância singleton
export const featureDetection = new FeatureDetection();

// Tipos para exportação
export type { BrowserCapabilities, DeviceInfo, PWASupport };