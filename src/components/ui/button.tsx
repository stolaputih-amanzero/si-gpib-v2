import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold text-base transition-all duration-fast ease-smooth tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-base focus-visible:ring-offset-2 focus-visible:ring-brand-400 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white shadow-sm [box-shadow:var(--shadow-sm),_inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-brand-700 active:bg-brand-700",
        destructive: "bg-bad text-text-inverse shadow-sm hover:bg-bad/90 active:bg-bad/95",
        outline: "border border-line-subtle bg-surface-1 text-ink-primary hover:bg-surface-sunken active:bg-surface-sunken",
        secondary: "bg-surface-sunken text-ink-primary border border-line-subtle hover:bg-surface-sunken/80 active:bg-surface-sunken/90",
        ghost: "bg-transparent text-brand-600 hover:bg-surface-brand active:bg-surface-brand",
        link: "text-brand-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[48px] h-12 px-5 py-2.5 text-base tracking-tightish", // 48px Ergonomic Touch Target
        sm: "min-h-[40px] h-10 rounded-sm px-3.5 text-sm font-medium",
        lg: "min-h-[52px] h-13 rounded-lg px-8 text-lg font-semibold",
        icon: "min-h-[48px] min-w-[48px] h-12 w-12 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
