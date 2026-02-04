import * as React from "react"
import { cn } from "@/lib/utils"
import { colors } from "@/lib/colors"

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, icon, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text.dark }}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" style={{ color: colors.text.muted }}>
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-white",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "transition-all duration-200",
              icon && "pl-12",
              className
            )}
            style={{
              borderColor: error ? colors.status.error : colors.border.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              color: colors.text.dark,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? colors.status.error : colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${error ? colors.status.error : colors.primary}30`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? colors.status.error : colors.border.primary;
              e.currentTarget.style.boxShadow = '';
            }}
            placeholder={props.placeholder}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm" style={{ color: colors.status.error }}>{error}</p>
        )}
      </div>
    )
  }
)
FormInput.displayName = "FormInput"

export { FormInput }

