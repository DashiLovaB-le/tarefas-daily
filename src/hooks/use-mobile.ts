import { useState, useEffect, useCallback } from 'react'

/**
 * Hook personalizado para detectar se o dispositivo é mobile
 * Considera mobile quando a largura da tela é menor que 768px (breakpoint md do Tailwind)
 * 
 * @returns {boolean} true se o dispositivo for mobile, false caso contrário
 */
export const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // Função para verificar se é mobile com debounce
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
  }, [])

  useEffect(() => {
    // Verificação inicial
    checkMobile()

    // Debounce para otimizar performance
    let timeoutId: NodeJS.Timeout

    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150)
    }

    // Adiciona listener para resize
    window.addEventListener('resize', debouncedResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [checkMobile])

  return isMobile
}