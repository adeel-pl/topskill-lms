import * as React from "react"
import { cn } from "@/lib/utils"
import { colors } from "@/lib/colors"

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'light' | 'secondary'
  size?: 'lg' | 'default' | 'sm' | 'xs'
  as?: 'p' | 'span' | 'div'
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'default', size = 'default', as: Component = 'p', style, children, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: { color: colors.text.primary },  // Dark blue - uses global settings
      muted: { color: colors.text.muted },
      light: { color: colors.text.light },
      secondary: { color: colors.text.secondary },
    }
    
    const sizeClasses: Record<string, string> = {
      lg: 'text-lg',
      default: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs',
    }
    
    // Safe fallbacks
    const safeVariantStyle = variantStyles[variant] || variantStyles.default;
    const safeSize = sizeClasses[size] || sizeClasses.default;
    
    return (
      <Component
        ref={ref}
        className={cn(
          "leading-[1.6]",
          safeSize,
          className
        )}
        style={{ ...safeVariantStyle, ...style }}
        {...props}
      >
        {children || ''}
      </Component>
    )
  }
)
Text.displayName = "Text"

export { Text }