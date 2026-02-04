import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.875rem] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#048181] text-white hover:bg-[#036969] shadow-md hover:shadow-lg focus-visible:ring-[#048181]",
        secondary: "bg-[#f45c2c] text-white hover:bg-[#d94a1f] shadow-md hover:shadow-lg focus-visible:ring-[#f45c2c]",
        outline: "border-2 border-[#048181] bg-transparent text-[#048181] hover:bg-[#048181] hover:text-white focus-visible:ring-[#048181]",
        ghost: "text-[#1F2937] hover:bg-[#F9FAFB] focus-visible:ring-[#048181]",
        light: "bg-white border-2 border-[#E5E7EB] text-[#1F2937] hover:border-[#048181] hover:text-[#048181] focus-visible:ring-[#048181]",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }







































