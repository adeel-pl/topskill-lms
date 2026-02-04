import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'soft' | 'muted'
  padding?: 'default' | 'sm' | 'lg' | 'none'
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'default', padding = 'default', children, ...props }, ref) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-white',
      soft: 'bg-[#F9FAFB]',
      muted: 'bg-[#F3F4F6]',
    }
    
    const paddingClasses: Record<string, string> = {
      default: 'py-[4.5rem]',   // 72px - matches design system
      sm: 'py-12',              // 48px
      lg: 'py-[5.5rem]',        // 88px
      none: '',
    }
    
    // Safe fallbacks
    const safeVariant = variantClasses[variant] || variantClasses.default;
    const safePadding = paddingClasses[padding] || paddingClasses.default;
    
    return (
      <section
        ref={ref}
        className={cn(
          "relative",
          safeVariant,
          safePadding,
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }

