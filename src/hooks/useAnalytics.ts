import { useEffect, useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export function useAnalytics() {
  useEffect(() => {
    // Registrar carregamento da página
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      analytics.trackPageLoad(window.location.pathname, loadTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    analytics.trackEvent(category, action, label, value);
  }, []);

  const trackUserAction = useCallback((action: string, context?: string) => {
    analytics.trackUserAction(action, context);
  }, []);

  const trackError = useCallback((error: Error, context?: string) => {
    analytics.trackError(error, context);
  }, []);

  const trackPWAInstall = useCallback((accepted: boolean) => {
    if (accepted) {
      analytics.trackPWAInstallAccepted();
    } else {
      analytics.trackPWAInstallRejected();
    }
  }, []);

  const trackNotificationPermission = useCallback((granted: boolean) => {
    analytics.trackNotificationPermissionRequest();
    if (granted) {
      analytics.trackNotificationPermissionGranted();
    }
  }, []);

  const trackShare = useCallback((method: 'native' | 'clipboard' | 'legacy') => {
    analytics.trackShareApiUsage(method);
  }, []);

  return {
    trackEvent,
    trackUserAction,
    trackError,
    trackPWAInstall,
    trackNotificationPermission,
    trackShare,
    getMetrics: analytics.getMetrics.bind(analytics),
    getSessionReport: analytics.getSessionReport.bind(analytics)
  };
}