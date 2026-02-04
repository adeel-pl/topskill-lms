import * as React from "react"
import { cn } from "@/lib/utils"

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'light' | 'secondary'
  size?: 'lg' | 'default' | 'sm' | 'xs'
  as?: 'p' | 'span' | 'div'
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'default', size = 'default', as: Component = 'p', children, ...props }, ref) => {
    const variantClasses: Record<string, string> = {
      default: 'text-[#366854]',
      muted: 'text-[#64748B]',
      light: 'text-[#9CA3AF]',
      secondary: 'text-[#4B5563]',
    }
    
    const sizeClasses: Record<string, string> = {
      lg: 'text-lg',
      default: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs',
    }
    
    // Safe fallbacks
    const safeVariant = variantClasses[variant] || variantClasses.default;
    const safeSize = sizeClasses[size] || sizeClasses.default;
    
    return (
      <Component
        ref={ref}
        className={cn(
          "leading-[1.6]",
          safeVariant,
          safeSize,
          className
        )}
        {...props}
      >
        {children || ''}
      </Component>
    )
  }
)
Text.displayName = "Text"

export { Text }

