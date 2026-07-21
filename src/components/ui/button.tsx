import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 active:scale-95 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-5',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary text-white shadow-soft hover:bg-brand-primary/90 active:bg-brand-primary-dark',
        accent: 'bg-accent-gold text-gray-950 shadow-soft hover:bg-accent-gold/90 active:bg-accent-gold-dark font-bold',
        outline: 'border border-border-strong bg-surface-elevated text-text-high hover:bg-surface-sunken active:bg-surface-sunken/80',
        secondary: 'bg-surface-sunken text-text-high hover:bg-border-subtle active:bg-border-strong/20',
        ghost: 'text-text-medium hover:bg-surface-sunken hover:text-text-high active:bg-surface-sunken/80',
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft',
        link: 'text-brand-primary underline-offset-4 hover:underline min-h-0 min-w-0 p-0',
      },
      size: {
        default: 'h-11 px-4 py-2.5 text-sm',
        sm: 'h-9 px-3 py-1.5 text-xs rounded-lg min-h-[36px]',
        lg: 'h-12 px-6 py-3 text-base rounded-2xl min-h-[48px]',
        icon: 'h-11 w-11 p-0 justify-center items-center',
        'icon-sm': 'h-9 w-9 p-0 justify-center items-center rounded-lg min-h-[36px] min-w-[36px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
