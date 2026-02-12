import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { colors } from "@/lib/colors"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.875rem] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: `shadow-md hover:shadow-lg focus-visible:ring-[${colors.accent.green}]`,
        secondary: "bg-[#3B82F6] text-white hover:bg-[#2563eb] shadow-md hover:shadow-lg focus-visible:ring-[#3B82F6]",
        outline: `border-2 bg-transparent focus-visible:ring-[${colors.accent.green}]`,
        ghost: `hover:bg-[#F9FAFB] focus-visible:ring-[${colors.accent.green}]`,
        light: `border-2 focus-visible:ring-[${colors.accent.green}]`,
      },
      size: {
        default: "px-6 py-3 text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-lg",
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
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    // Remove asChild from props to prevent it from being passed to DOM
    // Note: asChild is not fully implemented - use Link directly with button classes instead
    const { children, ...restProps } = props;
    
    // Get style based on variant
    const getVariantStyle = () => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: colors.accent.green,
            color: colors.text.white,
          };
        case 'outline':
          return {
            borderColor: colors.accent.green,
            color: colors.accent.green,
          };
        case 'light':
          return {
            backgroundColor: colors.background.primary,
            borderColor: colors.border.primary,
            color: colors.text.dark,
          };
        default:
          return {};
      }
    };
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        style={getVariantStyle()}
        ref={ref}
        {...restProps}
        onMouseEnter={(e) => {
          if (variant === 'default') {
            e.currentTarget.style.backgroundColor = colors.hover.accent;
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = colors.accent.green;
            e.currentTarget.style.color = colors.text.white;
          } else if (variant === 'light') {
            e.currentTarget.style.borderColor = colors.accent.green;
            e.currentTarget.style.color = colors.accent.green;
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'default') {
            e.currentTarget.style.backgroundColor = colors.accent.green;
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.accent.green;
          } else if (variant === 'light') {
            e.currentTarget.style.borderColor = colors.border.primary;
            e.currentTarget.style.color = colors.text.dark;
          }
        }}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }














































