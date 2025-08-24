import { useMobile } from "@/hooks/use-mobile"
import { HamburgerButton } from "@/components/ui/hamburger-button"
import { useAppLayout } from "./AppLayout"

interface AppHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

const AppHeader = ({ title, subtitle, children }: AppHeaderProps) => {
  const isMobile = useMobile()
  const { isMobileMenuOpen, toggleMobileMenu } = useAppLayout()

  return (
    <header className="nm-card px-6 py-4 border-0 mx-6 mt-6 mb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger button - visible only on mobile */}
          {isMobile && (
            <HamburgerButton
              isOpen={isMobileMenuOpen}
              onClick={toggleMobileMenu}
              size="md"
            />
          )}
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {children}
      </div>
    </header>
  )
}

export default AppHeader