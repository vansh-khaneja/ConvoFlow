import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow hover:bg-[var(--primary-hover)] active:scale-95 focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.2)]",
        destructive:
          "bg-[var(--accent-red)] text-white shadow-sm hover:bg-red-600 active:scale-95 focus-visible:ring-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]",
        outline:
          "border border-[var(--border-color)] bg-transparent shadow-sm hover:bg-[var(--card-hover)] active:scale-95 focus-visible:border-[var(--primary)]",
        secondary:
          "bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm hover:bg-[var(--card-hover)] active:scale-95",
        ghost: "hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] active:scale-95",
        link: "text-[var(--primary)] underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:rounded-[5px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[5px] px-3 text-xs",
        lg: "h-11 rounded-[5px] px-8",
        icon: "h-10 w-10",
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
  asChild?: boolean;
  'aria-label'?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Auto-add aria-label for icon-only buttons if not provided
    const isIconOnly = size === 'icon' || (typeof children === 'object' && children !== null && !Array.isArray(children) && 'type' in children);
    const ariaLabel = props['aria-label'] || (isIconOnly && typeof children === 'string' ? children : undefined);
    
    // Determine if this button should have white text/icons
    const isWhiteText = variant === 'default' || variant === 'destructive';
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isWhiteText && 'button-white-text'
        )}
        ref={ref}
        aria-label={ariaLabel}
        style={{
          color: isWhiteText ? '#ffffff' : undefined,
          ...props.style,
        }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
