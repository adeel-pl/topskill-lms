import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'display' | 'display-sm' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, size, children, ...props }, ref) => {
    // Safe fallbacks
    const safeSize = size || 'h2';
    const Component = as || (safeSize === 'display' || safeSize === 'display-sm' ? 'h1' : safeSize === 'h1' ? 'h1' : safeSize === 'h3' ? 'h3' : safeSize === 'h4' ? 'h4' : safeSize === 'h5' ? 'h5' : safeSize === 'h6' ? 'h6' : 'h2');
    
    const sizeClasses: Record<string, string> = {
      display: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.1]',
      'display-sm': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]',
      h1: 'text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2]',
      h2: 'text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.3]',
      h3: 'text-xl sm:text-2xl md:text-3xl font-semibold leading-[1.4]',
      h4: 'text-lg sm:text-xl md:text-2xl font-semibold leading-[1.4]',
      h5: 'text-base sm:text-lg md:text-xl font-semibold leading-[1.5]',
      h6: 'text-sm sm:text-base md:text-lg font-semibold leading-[1.5]',
    }
    
    const safeSizeClass = sizeClasses[safeSize] || sizeClasses.h2;
    
    return (
      <Component
        ref={ref}
        className={cn(
          "text-[#366854] leading-tight",
          safeSizeClass,
          className
        )}
        {...props}
      >
        {children || ''}
      </Component>
    )
  }
)
Heading.displayName = "Heading"

export { Heading }



interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'display' | 'display-sm' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, size, children, ...props }, ref) => {
    // Safe fallbacks
    const safeSize = size || 'h2';
    const Component = as || (safeSize === 'display' || safeSize === 'display-sm' ? 'h1' : safeSize === 'h1' ? 'h1' : safeSize === 'h3' ? 'h3' : safeSize === 'h4' ? 'h4' : safeSize === 'h5' ? 'h5' : safeSize === 'h6' ? 'h6' : 'h2');
    
    const sizeClasses: Record<string, string> = {
      display: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.1]',
      'display-sm': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]',
      h1: 'text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2]',
      h2: 'text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.3]',
      h3: 'text-xl sm:text-2xl md:text-3xl font-semibold leading-[1.4]',
      h4: 'text-lg sm:text-xl md:text-2xl font-semibold leading-[1.4]',
      h5: 'text-base sm:text-lg md:text-xl font-semibold leading-[1.5]',
      h6: 'text-sm sm:text-base md:text-lg font-semibold leading-[1.5]',
    }
    
    const safeSizeClass = sizeClasses[safeSize] || sizeClasses.h2;
    
    return (
      <Component
        ref={ref}
        className={cn(
          "text-[#366854] leading-tight",
          safeSizeClass,
          className
        )}
        {...props}
      >
        {children || ''}
      </Component>
    )
  }
)
Heading.displayName = "Heading"

export { Heading }

