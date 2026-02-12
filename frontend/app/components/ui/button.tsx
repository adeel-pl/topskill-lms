import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.875rem] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#00d084] text-white hover:bg-[#00b875] shadow-md hover:shadow-lg focus-visible:ring-[#00d084]",
        secondary: "bg-[#3B82F6] text-white hover:bg-[#2563eb] shadow-md hover:shadow-lg focus-visible:ring-[#3B82F6]",
        outline: "border-2 border-[#00d084] bg-transparent text-[#00d084] hover:bg-[#00d084] hover:text-white focus-visible:ring-[#00d084]",
        ghost: "text-[#1F2937] hover:bg-[#F9FAFB] focus-visible:ring-[#00d084]",
        light: "bg-white border-2 border-[#E5E7EB] text-[#1F2937] hover:border-[#00d084] hover:text-[#00d084] focus-visible:ring-[#00d084]",
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
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...restProps}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }














































