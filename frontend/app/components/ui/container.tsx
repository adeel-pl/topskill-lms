import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'xl' | '2xl'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      default: 'max-w-[1400px]',
      xl: 'max-w-[1600px]',
      '2xl': 'max-w-[1800px]',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container }




import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'xl' | '2xl'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      default: 'max-w-[1400px]',
      xl: 'max-w-[1600px]',
      '2xl': 'max-w-[1800px]',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container }







