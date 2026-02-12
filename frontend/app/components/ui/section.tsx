import * as React from "react"
import { cn } from "@/lib/utils"
import { colors } from "@/lib/colors"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'soft' | 'muted' | 'highlight'
  padding?: 'default' | 'sm' | 'lg' | 'none'
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'default', padding = 'default', children, ...props }, ref) => {
    const variantClasses: Record<string, React.CSSProperties> = {
      default: { backgroundColor: colors.background.primary },
      soft: { backgroundColor: colors.grouping.sectionSoft }, // #F9FAFB for alternating sections
      muted: { backgroundColor: colors.background.muted },
      highlight: { backgroundColor: colors.grouping.sectionHighlight }, // #F0FDF4 for featured sections
    }
    
    const paddingClasses: Record<string, string> = {
      default: 'py-[4.5rem]',   // 72px - matches design system for symmetry
      sm: 'py-12',              // 48px
      lg: 'py-[5.5rem]',        // 88px for emphasis
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
          safePadding,
          className
        )}
        style={safeVariant}
        {...props}
      >
        {children}
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }