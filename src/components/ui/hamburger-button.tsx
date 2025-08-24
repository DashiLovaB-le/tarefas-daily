import { cn } from "@/lib/utils"

interface HamburgerButtonProps {
  isOpen?: boolean
  onClick?: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * Componente de botão hamburger animado com design neumórfico
 * Transforma de 3 linhas para X quando ativo
 */
export const HamburgerButton = ({
  isOpen = false,
  onClick,
  className,
  size = "md"
}: HamburgerButtonProps) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-11 h-11", // 44px - tamanho mínimo para touch
    lg: "w-12 h-12"
  }

  const lineClasses = {
    sm: "h-0.5",
    md: "h-0.5",
    lg: "h-1"
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "nm-btn flex items-center justify-center transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        "active:scale-95",
        "text-foreground", // Usa a cor da fonte padrão
        sizeClasses[size],
        className
      )}
      aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      aria-expanded={isOpen}
    >
      <div className="relative w-5 h-4 flex flex-col justify-center">
        {/* Linha superior */}
        <span
          className={cn(
            "block bg-foreground md:bg-white transition-all duration-300 ease-in-out",
            lineClasses[size],
            isOpen
              ? "rotate-45 translate-y-1.5"
              : "rotate-0 translate-y-0"
          )}
        />

        {/* Linha do meio */}
        <span
          className={cn(
            "block bg-foreground md:bg-white transition-all duration-300 ease-in-out mt-1",
            lineClasses[size],
            isOpen
              ? "opacity-0 scale-0"
              : "opacity-100 scale-100"
          )}
        />

        {/* Linha inferior */}
        <span
          className={cn(
            "block bg-foreground md:bg-white transition-all duration-300 ease-in-out mt-1",
            lineClasses[size],
            isOpen
              ? "-rotate-45 -translate-y-1.5"
              : "rotate-0 translate-y-0"
          )}
        />
      </div>
    </button>
  )
}