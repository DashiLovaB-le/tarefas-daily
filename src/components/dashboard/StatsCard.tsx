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
      "task-card p-6 animate-fade-in",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl border",
          config.bg,
          config.border
        )}>
          <div className={cn("w-6 h-6", config.text)}>
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className={cn(
            "text-xs font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">
          {value}
        </h3>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
      </div>
    </div>
  )
}

export default StatsCard