import { useState, useEffect, useCallback } from 'react';
import { 
  pwaCompatibilityTester, 
  quickCompatibilityCheck,
  type PWACompatibilityResult 
} from '@/lib/pwa-compatibility';

interface CompatibilityState {
  isLoading: boolean;
  results: PWACompatibilityResult[] | null;
  score: number;
  isCompatible: boolean;
  criticalIssues: string[];
  report: any;
  error: string | null;
}

export function useCompatibility() {
  const [state, setState] = useState<CompatibilityState>({
    isLoading: true,
    results: null,
    score: 0,
    isCompatible: false,
    criticalIssues: [],
    report: null,
    error: null
  });

  const runFullTest = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const results = await pwaCompatibilityTester.runAllTests();
      const score = pwaCompatibilityTester.getCompatibilityScore(results);
      const isCompatible = pwaCompatibilityTester.isPWAReady(results);
      const criticalIssues = pwaCompatibilityTester.getFailedCriticalFeatures(results);
      const report = pwaCompatibilityTester.generateCompatibilityReport(results);

      setState({
        isLoading: false,
        results,
        score,
        isCompatible,
        criticalIssues,
        report,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, []);

  const runQuickTest = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { isCompatible, score, criticalIssues } = await quickCompatibilityCheck();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        score,
        isCompatible,
        criticalIssues,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, []);

  // Executar teste rápido na inicialização
  useEffect(() => {
    runQuickTest();
  }, [runQuickTest]);

  const exportReport = useCallback(() => {
    if (!state.report) return;

    const blob = new Blob([JSON.stringify(state.report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pwa-compatibility-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.report]);

  return {
    ...state,
    runFullTest,
    runQuickTest,
    exportReport,
    refresh: runFullTest
  };
}

// Hook específico para verificação rápida
export function useQuickCompatibility() {
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCompatibility = async () => {
      try {
        const result = await quickCompatibilityCheck();
        setIsCompatible(result.isCompatible);
        setScore(result.score);
      } catch (error) {
        console.error('Erro na verificação rápida de compatibilidade:', error);
        setIsCompatible(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCompatibility();
  }, []);

  return {
    isCompatible,
    score,
    isLoading
  };
}

// Hook para monitorar mudanças de compatibilidade
export function useCompatibilityMonitor() {
  const [compatibilityHistory, setCompatibilityHistory] = useState<Array<{
    timestamp: string;
    score: number;
    isCompatible: boolean;
  }>>([]);

  const addCompatibilityCheck = useCallback((score: number, isCompatible: boolean) => {
    const entry = {
      timestamp: new Date().toISOString(),
      score,
      isCompatible
    };

    setCompatibilityHistory(prev => {
      const newHistory = [...prev, entry];
      // Manter apenas os últimos 10 registros
      return newHistory.slice(-10);
    });

    // Salvar no localStorage
    try {
      localStorage.setItem('compatibility_history', JSON.stringify([...compatibilityHistory, entry].slice(-10)));
    } catch (error) {
      console.warn('Erro ao salvar histórico de compatibilidade:', error);
    }
  }, [compatibilityHistory]);

  // Carregar histórico do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem('compatibility_history');
      if (saved) {
        setCompatibilityHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Erro ao carregar histórico de compatibilidade:', error);
    }
  }, []);

  const getCompatibilityTrend = useCallback(() => {
    if (compatibilityHistory.length < 2) return 'stable';

    const recent = compatibilityHistory.slice(-3);
    const scores = recent.map(entry => entry.score);
    
    const isImproving = scores.every((score, index) => 
      index === 0 || score >= scores[index - 1]
    );
    
    const isDegrading = scores.every((score, index) => 
      index === 0 || score <= scores[index - 1]
    );

    if (isImproving && scores[scores.length - 1] > scores[0]) return 'improving';
    if (isDegrading && scores[scores.length - 1] < scores[0]) return 'degrading';
    return 'stable';
  }, [compatibilityHistory]);

  return {
    compatibilityHistory,
    addCompatibilityCheck,
    getCompatibilityTrend,
    clearHistory: () => {
      setCompatibilityHistory([]);
      localStorage.removeItem('compatibility_history');
    }
  };
}