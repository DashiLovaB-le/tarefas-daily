import * as React from "react"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface ResponsiveModalProps {
  children: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ResponsiveModalContentProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveModalHeaderProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveModalTitleProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveModalDescriptionProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveModalFooterProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveModalTriggerProps {
  className?: string
  children: React.ReactNode
  asChild?: boolean
}

interface ResponsiveModalCloseProps {
  className?: string
  children: React.ReactNode
  asChild?: boolean
}

/**
 * Componente modal responsivo que renderiza Dialog em desktop e Drawer em mobile
 */
export const ResponsiveModal = ({ 
  children, 
  isOpen, 
  onOpenChange 
}: ResponsiveModalProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

export const ResponsiveModalTrigger = ({ 
  className, 
  children, 
  asChild 
}: ResponsiveModalTriggerProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerTrigger className={className} asChild={asChild}>
        {children}
      </DrawerTrigger>
    )
  }

  return (
    <DialogTrigger className={className} asChild={asChild}>
      {children}
    </DialogTrigger>
  )
}

export const ResponsiveModalContent = ({ 
  className, 
  children 
}: ResponsiveModalContentProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerContent className={className}>
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent className={className}>
      {children}
    </DialogContent>
  )
}

export const ResponsiveModalHeader = ({ 
  className, 
  children 
}: ResponsiveModalHeaderProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerHeader className={className}>
        {children}
      </DrawerHeader>
    )
  }

  return (
    <DialogHeader className={className}>
      {children}
    </DialogHeader>
  )
}

export const ResponsiveModalTitle = ({ 
  className, 
  children 
}: ResponsiveModalTitleProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerTitle className={className}>
        {children}
      </DrawerTitle>
    )
  }

  return (
    <DialogTitle className={className}>
      {children}
    </DialogTitle>
  )
}

export const ResponsiveModalDescription = ({ 
  className, 
  children 
}: ResponsiveModalDescriptionProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerDescription className={className}>
        {children}
      </DrawerDescription>
    )
  }

  return (
    <DialogDescription className={className}>
      {children}
    </DialogDescription>
  )
}

export const ResponsiveModalFooter = ({ 
  className, 
  children 
}: ResponsiveModalFooterProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerFooter className={className}>
        {children}
      </DrawerFooter>
    )
  }

  // Para Dialog, não há componente Footer específico, então usamos uma div
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
      {children}
    </div>
  )
}

export const ResponsiveModalClose = ({ 
  className, 
  children, 
  asChild 
}: ResponsiveModalCloseProps) => {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <DrawerClose className={className} asChild={asChild}>
        {children}
      </DrawerClose>
    )
  }

  // Para Dialog, o close é geralmente um botão que chama onOpenChange
  return (
    <div className={className}>
      {children}
    </div>
  )
}