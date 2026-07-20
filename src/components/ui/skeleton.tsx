import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "avatar" | "card"
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-text-muted/20"
  
  const variantClasses = {
    default: "rounded-md",
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full shrink-0",
    card: "h-32 w-full rounded-xl",
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

export { Skeleton }
