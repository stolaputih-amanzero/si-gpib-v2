import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all select-none [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-surface-brand text-brand-600 border-brand-100 dark:border-brand-900/40",
        brand: "bg-surface-brand text-brand-600 border-brand-100 dark:border-brand-900/40",
        accent: "bg-surface-accent text-accent-600 border-accent-100 dark:border-accent-900/40",
        secondary: "bg-surface-sunken text-ink-secondary border-line-subtle",
        success: "bg-ok-soft text-ok border-ok/20",
        warning: "bg-warn-soft text-warn border-warn/20",
        destructive: "bg-bad-soft text-bad border-bad/20",
        outline: "border-line-subtle bg-surface-1 text-ink-primary",
        ghost: "bg-transparent text-ink-secondary hover:bg-surface-sunken",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
