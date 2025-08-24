import { useState, useEffect, useCallback, useMemo } from 'react'

// Definição dos breakpoints do Tailwind CSS
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

/**
 * Hook para detectar breakpoints específicos do Tailwind CSS
 * Suporta múltiplas queries de breakpoint com memoização para performance
 * 
 * @param breakpoint - O breakpoint a ser detectado ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 * @returns {boolean} true se a tela atual atende ao breakpoint especificado
 */
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const [currentWidth, setCurrentWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )

  // Função para atualizar a largura atual
  const updateWidth = useCallback(() => {
    setCurrentWidth(window.innerWidth)
  }, [])

  useEffect(() => {
    // Verificação inicial
    updateWidth()

    // Debounce para otimizar performance
    let timeoutId: NodeJS.Timeout

    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateWidth, 150)
    }

    // Adiciona listener para resize
    window.addEventListener('resize', debouncedResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [updateWidth])

  // Memoização do resultado para evitar recálculos desnecessários
  const isBreakpoint = useMemo(() => {
    return currentWidth >= breakpoints[breakpoint]
  }, [currentWidth, breakpoint])

  return isBreakpoint
}

/**
 * Hook para obter o breakpoint atual
 * @returns {Breakpoint} O breakpoint atual baseado na largura da tela
 */
export const useCurrentBreakpoint = (): Breakpoint => {
  const [currentWidth, setCurrentWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )

  const updateWidth = useCallback(() => {
    setCurrentWidth(window.innerWidth)
  }, [])

  useEffect(() => {
    updateWidth()

    let timeoutId: NodeJS.Timeout

    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateWidth, 150)
    }

    window.addEventListener('resize', debouncedResize)

    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [updateWidth])

  // Determina o breakpoint atual
  const currentBreakpoint = useMemo((): Breakpoint => {
    if (currentWidth >= breakpoints['2xl']) return '2xl'
    if (currentWidth >= breakpoints.xl) return 'xl'
    if (currentWidth >= breakpoints.lg) return 'lg'
    if (currentWidth >= breakpoints.md) return 'md'
    if (currentWidth >= breakpoints.sm) return 'sm'
    return 'xs'
  }, [currentWidth])

  return currentBreakpoint
}

/**
 * Hook para múltiplas queries de breakpoint
 * @param queries - Array de breakpoints para verificar
 * @returns {Record<Breakpoint, boolean>} Objeto com o status de cada breakpoint
 */
export const useBreakpoints = (queries: Breakpoint[]): Record<string, boolean> => {
  const [currentWidth, setCurrentWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )

  const updateWidth = useCallback(() => {
    setCurrentWidth(window.innerWidth)
  }, [])

  useEffect(() => {
    updateWidth()

    let timeoutId: NodeJS.Timeout

    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateWidth, 150)
    }

    window.addEventListener('resize', debouncedResize)

    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [updateWidth])

  // Memoização dos resultados para todas as queries
  const results = useMemo(() => {
    const breakpointResults: Record<string, boolean> = {}
    
    queries.forEach(query => {
      breakpointResults[query] = currentWidth >= breakpoints[query]
    })

    return breakpointResults
  }, [currentWidth, queries])

  return results
}