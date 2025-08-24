import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { breakpoints, type Breakpoint } from "@/hooks/use-breakpoint"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitários para responsividade
 */

/**
 * Verifica se a largura atual é considerada mobile (< 768px)
 * @param width - Largura atual da tela
 * @returns {boolean} true se for mobile
 */
export const isMobileWidth = (width: number): boolean => {
  return width < breakpoints.md
}

/**
 * Verifica se a largura atual é considerada tablet (768px - 1023px)
 * @param width - Largura atual da tela
 * @returns {boolean} true se for tablet
 */
export const isTabletWidth = (width: number): boolean => {
  return width >= breakpoints.md && width < breakpoints.lg
}

/**
 * Verifica se a largura atual é considerada desktop (>= 1024px)
 * @param width - Largura atual da tela
 * @returns {boolean} true se for desktop
 */
export const isDesktopWidth = (width: number): boolean => {
  return width >= breakpoints.lg
}

/**
 * Obtém o breakpoint atual baseado na largura
 * @param width - Largura atual da tela
 * @returns {Breakpoint} O breakpoint correspondente
 */
export const getBreakpointFromWidth = (width: number): Breakpoint => {
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

/**
 * Gera classes CSS responsivas baseadas em um mapa de breakpoints
 * @param classMap - Mapa de breakpoint para classes CSS
 * @returns {string} Classes CSS concatenadas
 */
export const responsiveClasses = (classMap: Partial<Record<Breakpoint, string>>): string => {
  const classes: string[] = []

  // Adiciona classe base (xs)
  if (classMap.xs) {
    classes.push(classMap.xs)
  }

  // Adiciona classes com prefixos de breakpoint
  Object.entries(classMap).forEach(([breakpoint, className]) => {
    if (breakpoint !== 'xs' && className) {
      classes.push(`${breakpoint}:${className}`)
    }
  })

  return classes.join(' ')
}

/**
 * Utilitário para criar classes de grid responsivo
 * @param cols - Número de colunas por breakpoint
 * @returns {string} Classes de grid responsivo
 */
export const responsiveGrid = (cols: Partial<Record<Breakpoint, number>>): string => {
  const gridClasses: Partial<Record<Breakpoint, string>> = {}

  Object.entries(cols).forEach(([breakpoint, colCount]) => {
    gridClasses[breakpoint as Breakpoint] = `grid-cols-${colCount}`
  })

  return responsiveClasses(gridClasses)
}

/**
 * Utilitário para criar classes de texto responsivo
 * @param sizes - Tamanhos de texto por breakpoint
 * @returns {string} Classes de texto responsivo
 */
export const responsiveText = (sizes: Partial<Record<Breakpoint, string>>): string => {
  return responsiveClasses(sizes)
}

/**
 * Utilitário para criar classes de padding responsivo
 * @param padding - Valores de padding por breakpoint
 * @returns {string} Classes de padding responsivo
 */
export const responsivePadding = (padding: Partial<Record<Breakpoint, string>>): string => {
  return responsiveClasses(padding)
}

/**
 * Utilitário para garantir tamanhos mínimos de toque (44px)
 * @param className - Classes CSS adicionais
 * @returns {string} Classes CSS com tamanho mínimo de toque
 */
export const touchTarget = (className?: string): string => {
  return cn("min-h-[44px] min-w-[44px]", className)
}

/**
 * Utilitário para botões com tamanho de toque adequado
 * @param size - Tamanho do botão ('sm' | 'md' | 'lg')
 * @param className - Classes CSS adicionais
 * @returns {string} Classes CSS para botão com toque adequado
 */
export const touchButton = (size: 'sm' | 'md' | 'lg' = 'md', className?: string): string => {
  const sizeClasses = {
    sm: "h-9 px-3 text-sm", // 36px altura + padding = ~44px área de toque
    md: "h-10 px-4", // 40px altura + padding = ~44px área de toque  
    lg: "h-11 px-6 text-lg" // 44px altura + padding = área de toque adequada
  }

  return cn(sizeClasses[size], "min-w-[44px]", className)
}
