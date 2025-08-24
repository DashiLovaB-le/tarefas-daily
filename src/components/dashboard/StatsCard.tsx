import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "primary" | "success" | "warning" | "destructive"
  className?: string
}

const colorConfig = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20"
  },
  success: {
    bg: "bg-success/10", 
    text: "text-success",
    border: "border-success/20"
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning", 
    border: "border-warning/20"
  },
  destructive: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20"
  }
}

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  color = "primary",
  className
}: StatsCardProps) => {
  const config = colorConfig[color]

  return (
    <div className={cn(
      "task-card animate-fade-in",
      // Padding responsivo: menor em mobile, maior em desktop
      "p-4 sm:p-6",
      className
    )}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={cn(
          "rounded-xl border",
          // Tamanho do ícone responsivo
          "p-2 sm:p-3",
          config.bg,
          config.border
        )}>
          <div className={cn(
            // Ícone menor em mobile
            "w-5 h-5 sm:w-6 sm:h-6", 
            config.text
          )}>
            {icon}
          </div>
        </div>

        {trend && (
          <div className={cn(
            // Texto de trend responsivo
            "text-xs sm:text-sm font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>

      <div>
        <h3 className={cn(
          "font-bold text-foreground mb-1",
          // Tamanho do valor responsivo
          "text-xl sm:text-2xl lg:text-3xl"
        )}>
          {value}
        </h3>
        <p className={cn(
          "text-muted-foreground",
          // Tamanho do título responsivo
          "text-xs sm:text-sm"
        )}>
          {title}
        </p>
      </div>
    </div>
  )
}

export default StatsCard